// --- SERVER.JS START ---
console.log('--- server.js started ---');

// ----------------------------
// server.js
// ----------------------------

// 1️⃣ Load environment variables immediately
const dotenv = require('dotenv');
const path = require('path'); // Import path module
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') }); // MUST be first

// --- Verify Google Credentials Immediately ---
console.log("--- Verifying Google Credentials ---");
console.log("Loaded Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Loaded Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "Exists" : "MISSING!");
console.log("------------------------------------");
// -----------------------------------------

// 2️⃣ Import dependencies
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs'); // For hashing passwords
const nodemailer = require('nodemailer'); // For sending emails
const connectDB = require(path.join(__dirname, 'config', 'database'));

const { JSDOM } = require('jsdom'); // ✅ Import JSDOM for server-side DOM parsing

// 3️⃣ Firebase Storage - Initialized after Admin SDK


// Helper function to upload a base64 image to Firebase Storage
// Helper function to extract path from Firebase Storage URL
const extractPathFromFirebaseURL = (url) => {
  if (!url) return null;
  
  try {
    // Handle Firebase Storage URLs: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[encoded-path]?alt=media&token=...
    if (url.includes('firebasestorage.googleapis.com')) {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
      }
    }
    
    // Handle storage.googleapis.com URLs: https://storage.googleapis.com/[bucket]/[path]?alt=media
    if (url.includes('storage.googleapis.com')) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remove leading slash and bucket name
      const path = pathname.substring(1).replace(`${bucket.name}/`, '');
      return decodeURIComponent(path);
    }
    
    // If it's already a path (no http/https), return as-is
    if (!url.startsWith('http')) {
      return url;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', url, error);
    return null;
  }
};

const uploadBase64ToFirebase = async (base64String, folder, fileName) => {
  try {
    const file = bucket.file(`${folder}/${fileName}`);
    const buffer = Buffer.from(base64String.split(';base64,').pop(), 'base64');

    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg', // Or determine dynamically
      },
      public: true, // Make the file publicly readable
    });

    return `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

const deleteFileFromFirebase = async (path) => {
  if (!path || typeof path !== 'string') {
    console.warn(`⚠️  Invalid path provided for deletion: ${path}`);
    return { success: false, path, skipped: true, reason: 'Invalid path' };
  }

  try {
    // Normalize path: remove leading/trailing slashes, decode URL encoding
    let normalizedPath = path.trim();
    if (!normalizedPath) {
      console.warn(`⚠️  Empty path provided for deletion`);
      return { success: false, path, skipped: true, reason: 'Empty path' };
    }

    // Remove leading slash if present
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }

    // Try to decode URL encoding (only if it looks encoded)
    try {
      if (normalizedPath.includes('%')) {
        normalizedPath = decodeURIComponent(normalizedPath);
      }
    } catch (decodeError) {
      // If decoding fails, use the path as-is
      console.warn(`⚠️  Could not decode path (using as-is): ${normalizedPath}`);
    }
    
    console.log(`🗑️  Attempting to delete Firebase Storage file: ${normalizedPath}`);
    const file = bucket.file(normalizedPath);
    
    // Try to delete directly - check existence only if delete fails
    try {
      await file.delete();
      console.log(`✅ Successfully deleted ${normalizedPath} from Firebase Storage.`);
      return { success: true, path: normalizedPath };
    } catch (deleteError) {
      // If delete fails, check if file exists
      if (deleteError.code === 404) {
        console.warn(`⚠️  File not found in Firebase Storage: ${normalizedPath}. Skipping deletion.`);
        return { success: true, path: normalizedPath, skipped: true, reason: 'File not found' };
      }
      // Re-throw other errors
      throw deleteError;
    }
  } catch (error) {
    if (error.code === 404) {
      console.warn(`⚠️  File not found in Firebase Storage: ${path}. Skipping deletion.`);
      return { success: true, path, skipped: true, reason: 'File not found' };
    } else {
      console.error(`❌ Error deleting file from Firebase Storage: ${path}`, error);
      console.error(`   Error code: ${error.code}, Error message: ${error.message}`);
      throw error; // Re-throw for Promise.allSettled to catch
    }
  }
};


// 4️⃣ Initialize Express
const app = express();
app.set('trust proxy', 1); // Important for Render behind proxy

const port = process.env.PORT || 5000;

// ----------------------------
// Database Connections
// ----------------------------
connectDB();

// ----------------------------
// Firebase Admin SDK Initialization
// ----------------------------
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // In production (Render), parse the JSON from the environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:", e);
    process.exit(1); // Exit if the service account is invalid
  }
} else {
  // In local development, load from the file
  serviceAccount = require('./config/firebase-service-account.json');
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'drc-political-science.firebasestorage.app',
  });
  console.log("✅ Firebase Admin SDK Initialized Successfully.");
} else {
  console.log("Firebase Admin SDK already initialized.");
}
const db = getFirestore();
const { bucket } = require(path.join(__dirname, 'config', 'firebase'));
// ----------------------------
// Passport configuration
// ----------------------------
require(path.join(__dirname, 'config', 'passport'))(passport);

// ----------------------------
// Middleware Setup
// ----------------------------

// CORS
const allowedOrigins = [
  'https://republicadrcdu.vercel.app', // Your deployed frontend
  'https://republicadrcdu.vercel.app/', // Added with trailing slash, just in case
  'http://localhost:3000',
  'https://frontend-republica.onrender.com'             // Your Render-deployed backend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session
app.use(session({
  name: 'sessionId',               // optional custom cookie name
  secret: process.env.SESSION_SECRET || 'keyboardcat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    // IMPORTANT: For local development over HTTP, `secure` must be false.
    // For production deployment over HTTPS, `secure` must be true and `sameSite` should be 'none'.
    secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
    httpOnly: true,                // JS cannot read cookie
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'none' for production (cross-site), 'lax' for local dev.
    maxAge: 1000 * 60 * 60 * 24    // 1 day
  }
}));

console.log(`Session Cookie Settings:
  Secure: ${process.env.NODE_ENV === 'production'}
  SameSite: ${process.env.NODE_ENV === 'production' ? 'none' : 'lax'}
  HTTP Only: true
  Max Age: 1 day
  NODE_ENV: ${process.env.NODE_ENV}
`);


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------
// Routes
// ----------------------------
console.log('Loading auth routes...');
// Pass the db instance to the auth router
const authRouter = require(path.join(__dirname, 'routes', 'auth'))(db);
app.use('/auth', authRouter);


// API route to get user data
// ⭐️⭐️⭐️ ADDED ROUTE #1 — /api/auth/check
app.get('/api/auth/check', (req, res) => {
  console.log("Auth check hit. Session:", req.user);

  if (req.isAuthenticated() && req.user) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  }
  return res.json({ authenticated: false });
});
// ⭐️⭐️⭐️ END OF ADDED ROUTE #1
// ⭐️⭐️⭐️ ADDED ROUTE #2 — /api/auth/logout
app.get('/api/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});
// ⭐️⭐️⭐️ END OF ADDED ROUTE #2

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// ----------------------------
// Security Middleware
// ----------------------------
const ensureAdmin = (req, res, next) => {
  console.log('--- ensureAdmin check ---');
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('req.user:', req.user); // <-- Added log
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: Admins only' });
};

// ----------------------------
// Firebase Storage Delete Route
// ----------------------------
app.post('/api/delete-image', ensureAdmin, async (req, res) => {
  try {
    const { path, albumId, image } = req.body;

    if (!path || !albumId || !image) {
      return res.status(400).json({ error: 'path, albumId, and image object are required' });
    }

    // Delete from Firebase Storage first
    console.log(`🗑️  Deleting image from Firebase Storage with path: ${path}`);
    console.log(`   Album ID: ${albumId}`);
    console.log(`   Image object:`, JSON.stringify(image, null, 2));
    
    const deleteResult = await deleteFileFromFirebase(path);
    if (deleteResult.success) {
      if (deleteResult.skipped) {
        console.log(`ℹ️  File was not found, but continuing with Firestore deletion`);
      } else {
        console.log(`✅ Successfully deleted file from Firebase Storage: ${path}`);
      }
    }

    // Remove from Firestore album
    console.log(`Attempting to remove image from Firestore album: ${albumId}`);
    const albumRef = db.collection('photoAlbums').doc(albumId);
    await albumRef.update({
      imageUrls: admin.firestore.FieldValue.arrayRemove(image)
    });
    
    console.log(`✅ Successfully removed image from album ${albumId} in Firestore`);

    res.json({ success: true, message: 'Image deleted successfully from both Firebase Storage and Firestore.' });

  } catch (error) {
    console.error('❌ Error deleting image:', error);
    res.status(500).json({ error: 'Image deletion failed', details: error.message });
  }
});

// ----------------------------
// Admin Delete Album Route
// ----------------------------
app.post('/api/delete-album', ensureAdmin, async (req, res) => { // <-- Secure this route
  try {
    const { albumId } = req.body;
    // No longer need userEmail from body, we use the authenticated user from session
    console.log(`Admin user '${req.user.email}' attempting to delete album ID: ${albumId}`);

    // ✅ Admin check is now handled by ensureAdmin middleware

    // ✅ Fetch album document
    const albumRef = db.collection('photoAlbums').doc(albumId);
    const albumDoc = await albumRef.get();

    if (!albumDoc.exists) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const albumData = albumDoc.data();
    const imageUrls = albumData.imageUrls || [];
    
    // Handle both old (coverPhotoUrl) and new (coverPhoto) cover photo structures
    let coverPhotoPath = '';
    if (albumData.coverPhoto && albumData.coverPhoto.path) {
      coverPhotoPath = albumData.coverPhoto.path;
    } else if (albumData.coverPhotoUrl) {
      // Extract path from old format URL using helper function
      coverPhotoPath = extractPathFromFirebaseURL(albumData.coverPhotoUrl) || '';
    }

    // Collect all paths to delete
    const pathsToDelete = [];
    
    // 1. Add all album image paths
    imageUrls.forEach(image => {
      if (image.path) {
        pathsToDelete.push(image.path);
      }
    });
    
    // 2. Add cover photo path if it exists
    if (coverPhotoPath) {
      pathsToDelete.push(coverPhotoPath);
    }
    
    // 3. Also try to delete by album folder path (for images stored in albums/{albumId}/)
    const albumFolderPath = `albums/${albumId}/`;
    try {
      const [folderFiles] = await bucket.getFiles({ prefix: albumFolderPath });
      folderFiles.forEach(file => {
        // Only add if not already in pathsToDelete
        if (!pathsToDelete.includes(file.name)) {
          pathsToDelete.push(file.name);
        }
      });
    } catch (folderError) {
      console.log(`No files found in folder ${albumFolderPath}, continuing with individual paths`);
    }
    
    // 4. Delete all collected paths from Firebase Storage (handle errors gracefully)
    if (pathsToDelete.length > 0) {
      console.log(`🗑️  Deleting ${pathsToDelete.length} file(s) from Firebase Storage...`);
      console.log(`   Paths to delete:`, pathsToDelete);
      
      const deleteResults = await Promise.allSettled(
        pathsToDelete.map(async (path) => {
          try {
            console.log(`  - Attempting to delete: ${path}`);
            const result = await deleteFileFromFirebase(path);
            return result;
          } catch (error) {
            console.error(`  ❌ Error deleting ${path}:`, error);
            throw error;
          }
        })
      );
      
      // Count successful deletions
      const successful = deleteResults.filter(r => r.status === 'fulfilled' && !r.value?.skipped).length;
      const skipped = deleteResults.filter(r => r.status === 'fulfilled' && r.value?.skipped).length;
      const failed = deleteResults.filter(r => r.status === 'rejected').length;
      
      console.log(`✅ Successfully deleted ${successful} file(s) from Firebase Storage`);
      if (skipped > 0) {
        console.log(`ℹ️  ${skipped} file(s) were not found (may have been already deleted)`);
      }
      if (failed > 0) {
        console.warn(`⚠️  ${failed} file(s) encountered errors during deletion`);
        // Log failed deletions for debugging
        deleteResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`  ❌ Failed to delete: ${pathsToDelete[index]}`, result.reason);
          }
        });
      }
    } else {
      console.log('ℹ️  No files found to delete from Firebase Storage');
    }

    // 5. Delete the album document from Firestore (only after Storage deletion)
    console.log(`🗑️  Deleting album document from Firestore: ${albumId}`);
    await albumRef.delete();
    console.log(`✅ Successfully deleted album document from Firestore`);

    console.log(`✅ Successfully deleted album ${albumId} and all associated files`);
    res.json({ success: true, message: 'Album and all associated files deleted successfully from Firebase Storage and Firestore.' });
  } catch (err) {
    console.error('Error deleting album:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ----------------------------
// Public Get All Blogs Route
// ----------------------------
app.get('/api/blogs', async (req, res) => {
  try {
    const blogsQuery = db.collection('blogs').orderBy("date", "desc");
    const querySnapshot = await blogsQuery.get();
    const blogsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(blogsData);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Internal server error while fetching blogs.' });
  }
});

// ----------------------------
// Public Get Single Blog by Slug Route
// ----------------------------
app.get('/api/blog/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const q = db.collection('blogs').where("slug", "==", slug);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const docSnap = querySnapshot.docs[0];
    const postData = { id: docSnap.id, ...docSnap.data() };

    // Increment views
    const postRef = db.collection('blogs').doc(docSnap.id);
    await postRef.update({ views: admin.firestore.FieldValue.increment(1) });

    res.status(200).json({ ...postData, views: (postData.views || 0) + 1 });
  } catch (error) {
    console.error('Error fetching single blog:', error);
    res.status(500).json({ error: 'Internal server error while fetching blog post.' });
  }
});

// ----------------------------
// Public Get Single Blog by ID Route
// ----------------------------
app.get('/api/blog-by-id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('blogs').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error fetching single blog by ID:', error);
    res.status(500).json({ error: 'Internal server error while fetching blog post.' });
  }
});

// ----------------------------
// Public Get All Albums Route
// ----------------------------
app.get('/api/albums', async (req, res) => {
  try {
    const albumsCollection = db.collection('photoAlbums');
    const q = albumsCollection.orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();
    const fetchedAlbums = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(fetchedAlbums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Internal server error while fetching albums.' });
  }
});

// ----------------------------
// Public Get Single Album by ID Route
// ----------------------------
app.get('/api/album/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const albumRef = db.collection('photoAlbums').doc(id);
    const docSnap = await albumRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Album not found.' });
    }
    res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error fetching album details:', error);
    res.status(500).json({ error: 'Internal server error while fetching album.' });
  }
});

// ----------------------------
// Public Get All Notifications Route
// ----------------------------
app.get('/api/notifications', async (req, res) => {
  try {
    const notificationsQuery = db.collection('notifications').orderBy('createdAt', 'desc');
    const querySnapshot = await notificationsQuery.get();
    const notificationsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      };
    });
    res.status(200).json(notificationsData);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error while fetching notifications.' });
  }
});

// ----------------------------
// Admin Create Blog Route
// ----------------------------
app.post('/api/create-blog', ensureAdmin, async (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Title, content, and author are required.' });
  }

  try {
    let processedContent = content;

    const uploadedImages = []; // Array to store Firebase Storage image data
    // Find all base64 images in the content
    // Use JSDOM on the server instead of the browser's DOMParser
    const dom = new JSDOM(content);
    const htmlDoc = dom.window.document;
    const images = htmlDoc.querySelectorAll("img");

    // Upload each base64 image to Firebase Storage and replace the src
    for (const img of images) {
      const src = img.src;
      if (src.startsWith("data:image")) {
        console.log('Uploading new image to Firebase...');
        const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
        const firebaseUrl = await uploadBase64ToFirebase(src, 'drc-web-images', fileName);
        processedContent = processedContent.replace(src, firebaseUrl);
        uploadedImages.push({
          url: firebaseUrl,
          path: `drc-web-images/${fileName}`,
        });
      }
    }

    // Generate a URL-friendly slug from the title
    const generateSlug = (slugTitle) =>
      slugTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    // Save the new blog post to Firestore
    const blogData = {
      title,
      content: processedContent,
      author,
      date: new Date(),
      slug: generateSlug(title),
      views: 0,
      likes: 0,
      comments: 0,
      images: uploadedImages, // Store the array of image details
    };

    const docRef = await db.collection('blogs').add(blogData);
    console.log(`Admin '${req.user.email}' created new blog post with ID: ${docRef.id}`);
    res.status(201).json({ success: true, message: 'Blog post created successfully.', blogId: docRef.id });

  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error while creating post.' });
  }
});

// ----------------------------
// Admin Edit Blog Route
// ----------------------------
app.post('/api/edit-blog', ensureAdmin, async (req, res) => {
  const { postId, title, author, content, oldContent } = req.body;

  if (!postId || !title || !author || !content) {
    return res.status(400).json({ error: 'Post ID, title, author, and content are required.' });
  }

  try {
    let newContent = content;
    // Use JSDOM on the server
    const dom = new JSDOM();

    // --- Image Deletion Logic ---
    const oldDoc = new JSDOM(oldContent || "").window.document;
    const oldImages = [...oldDoc.querySelectorAll("img")].map(img => img.src);
    const newDoc = new JSDOM(content).window.document;
    const newImages = [...newDoc.querySelectorAll("img")].map((img) => img.src);

    const removedImages = oldImages.filter((imgUrl) => !newImages.includes(imgUrl));
    for (const imgUrl of removedImages) {
        if (imgUrl.includes('storage.googleapis.com') || imgUrl.includes('firebasestorage.googleapis.com')) {
            const path = extractPathFromFirebaseURL(imgUrl);
            if (path) {
                console.log(`Deleting removed image: ${path}`);
                await deleteFileFromFirebase(path);
            }
        }
    }

        const uploadPromises = newImages
          .filter(imgSrc => imgSrc.startsWith("data:image"))
          .map(async (imgSrc) => {
            console.log('Uploading new image to Firebase...');
            const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
            const firebaseUrl = await uploadBase64ToFirebase(imgSrc, 'drc-web-images', fileName);
            newContent = newContent.replace(imgSrc, firebaseUrl);
          });
        await Promise.all(uploadPromises);

    // --- Update Firestore Document ---
    const postRef = db.collection('blogs').doc(postId);
    await postRef.update({
      title,
      author,
      content: newContent,
      date: new Date(),
    });

    console.log(`Admin '${req.user.email}' updated blog post with ID: ${postId}`);
    res.status(200).json({ success: true, message: 'Blog post updated successfully.' });

  } catch (error) {
    console.error('Error editing blog post:', error);
    res.status(500).json({ error: 'Internal server error while editing post.' });
  }
});

// ----------------------------
// Admin Delete Blog Route
// ----------------------------
app.post('/api/delete-blog', ensureAdmin, async (req, res) => {
  const { postId, content } = req.body;
  if (!postId) return res.status(400).json({ error: 'Post ID is required.' });

  try {
    // --- Delete associated images from Firebase Storage ---
    if (content) {
      const dom = new JSDOM(content);
      const htmlDoc = dom.window.document;
      const images = [...htmlDoc.querySelectorAll("img")].map((img) => img.src);
      const paths = images.map(url => {
        if (url.includes('storage.googleapis.com') || url.includes('firebasestorage.googleapis.com')) {
          const path = extractPathFromFirebaseURL(url);
          return path;
        }
        return null;
      }).filter(Boolean);

      if (paths.length > 0) {
        console.log(`🗑️  Deleting ${paths.length} image(s) from Firebase Storage for blog post ${postId}`);
        const deleteResults = await Promise.allSettled(paths.map(path => deleteFileFromFirebase(path)));
        const successful = deleteResults.filter(r => r.status === 'fulfilled').length;
        const failed = deleteResults.filter(r => r.status === 'rejected').length;
        console.log(`✅ Successfully deleted ${successful} image(s) from Firebase Storage`);
        if (failed > 0) {
          console.warn(`⚠️  ${failed} image(s) could not be deleted`);
        }
      }
    }

    // --- Delete comments subcollection ---
    const commentsRef = db.collection('blogs').doc(postId).collection('comments');
    const commentsSnapshot = await commentsRef.get();
    const batch = db.batch();
    commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Deleted comments for post ${postId}`);

    // --- Delete the blog post itself ---
    await db.collection('blogs').doc(postId).delete();

    console.log(`Admin '${req.user.email}' deleted blog post with ID: ${postId}`);
    res.status(200).json({ success: true, message: 'Blog post deleted successfully.' });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error while deleting post.' });
  }
});

// ----------------------------
// Admin Delete Message Route
// ----------------------------
app.post('/api/delete-message', ensureAdmin, async (req, res) => {
  const { messageId } = req.body;
  if (!messageId) return res.status(400).json({ error: 'Message ID is required.' });

  try {
    await db.collection('contactSubmissions').doc(messageId).delete();
    console.log(`Admin '${req.user.email}' deleted message with ID: ${messageId}`);
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error while deleting message.' });
  }
});

// ----------------------------
// Admin Add Flipbook Route
// ----------------------------
app.post('/api/add-flipbook', ensureAdmin, async (req, res) => {
  const { publishingYear, flipbookLink, coverPhotoURL } = req.body;
  if (!publishingYear || !flipbookLink) {
    return res.status(400).json({ error: 'Year and link are required.' });
  }

  try {
    let coverPhoto = null;
    if (coverPhotoURL) {
      const path = extractPathFromFirebaseURL(coverPhotoURL);
      if (!path) {
        console.warn(`⚠️  Could not extract path from flipbook cover photo URL: ${coverPhotoURL}`);
      }
      coverPhoto = {
        url: coverPhotoURL,
        path: path || '',
      };
    }

    const docRef = await db.collection('flipbooks').add({
      publishingYear,
      flipbookLink,
      coverPhoto, // Save the entire object or null
      createdAt: new Date(),
    });

    console.log(`Admin '${req.user.email}' added flipbook with ID: ${docRef.id}`);
    res.status(201).json({ success: true, message: 'Flipbook added successfully.' });
  } catch (error) {
    console.error('Error adding flipbook:', error);
    res.status(500).json({ error: 'Internal server error while adding flipbook.' });
  }
});

// ----------------------------
// Admin Create Album / Add Photos Route
// ----------------------------
app.post('/api/create-album', ensureAdmin, async (req, res) => {
  const { title, description, coverPhotoURL } = req.body;
  if (!title || !description || !coverPhotoURL) {
    return res.status(400).json({ error: 'Title, description, and coverPhotoURL are required.' });
  }

  try {
    // Extract path from URL for deletion purposes later
    const path = extractPathFromFirebaseURL(coverPhotoURL);
    if (!path) {
      console.warn(`⚠️  Could not extract path from cover photo URL: ${coverPhotoURL}`);
      console.warn(`   Cover photo may not be deletable from Firebase Storage later!`);
    } else {
      console.log(`📷 Cover photo path: ${path}`);
    }

    const docRef = await db.collection('photoAlbums').add({
      title,
      description,
      coverPhoto: {
        url: coverPhotoURL,
        path: path || '',
      },
      createdAt: new Date(),
      imageUrls: [],
    });

    console.log(`✅ Admin '${req.user.email}' created album with ID: ${docRef.id}`);
    res.status(201).json({ success: true, message: 'Album created successfully.' });
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ error: 'Internal server error while creating album.' });
  }
});

app.post('/api/add-photos-to-album', ensureAdmin, async (req, res) => {
  const { albumId, photoURLs } = req.body;
  if (!albumId || !photoURLs || !Array.isArray(photoURLs)) {
    return res.status(400).json({ error: 'Album ID and an array of photoURLs are required.' });
  }

  try {
    const albumRef = db.collection('photoAlbums').doc(albumId);

    console.log(`📸 Adding ${photoURLs.length} photo(s) to album ${albumId}`);
    const newPhotos = photoURLs.map((url, index) => {
      const path = extractPathFromFirebaseURL(url);
      if (!path) {
        console.warn(`⚠️  Could not extract path from URL ${index + 1}: ${url}`);
        console.warn(`   This photo may not be deletable from Firebase Storage later!`);
      } else {
        console.log(`   Photo ${index + 1}: path = ${path}`);
      }
      return { url, path: path || '' };
    });

    console.log(`💾 Storing ${newPhotos.length} photo(s) with paths:`, newPhotos.map(p => p.path));

    await albumRef.update({
      imageUrls: admin.firestore.FieldValue.arrayUnion(...newPhotos),
    });

    console.log(`✅ Successfully added ${photoURLs.length} photo(s) to album ${albumId}`);
    res.status(200).json({ success: true, message: `${photoURLs.length} photos added successfully.` });
  } catch (error) {
    console.error('Error adding photos to album:', error);
    res.status(500).json({ error: 'Internal server error while adding photos.' });
  }
});

// ----------------------------
// Admin Add Notification Route
// ----------------------------
app.post('/api/add-notification', ensureAdmin, async (req, res) => {
  const { title, content, photoURL, linkUrl, linkName } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    let photoData = null;

    if (photoURL) {
      const path = extractPathFromFirebaseURL(photoURL);
      if (!path) {
        console.warn(`⚠️  Could not extract path from notification photo URL: ${photoURL}`);
      }
      photoData = {
        url: photoURL,
        path: path || '',
      };
    }

    // Prepare data for Firestore
    const notificationData = {
      title,
      content,
      linkUrl: linkUrl || '',
      linkName: linkName || '',
      photo: photoData, // Will be null if no photo was uploaded
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('notifications').add(notificationData);
    console.log(`Admin '${req.user.email}' created new notification with ID: ${docRef.id}`);
    res.status(201).json({ success: true, message: 'Notification added successfully.', notificationId: docRef.id });
  } catch (error) {
    console.error('Error adding notification:', error);
    res.status(500).json({ error: 'Internal server error while adding notification.' });
  }
});

// ----------------------------
// Admin Delete Notification Route
// ----------------------------
app.post('/api/delete-notification', ensureAdmin, async (req, res) => {
  const { notificationId, photoPath } = req.body;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required.' });
  }

  try {
    // 1. Delete photo from Firebase if it exists
    if (photoPath) {
      console.log(`Deleting notification photo from Firebase: ${photoPath}`);
      await deleteFileFromFirebase(photoPath);
      console.log('Photo deleted from Firebase.');
    }

    // 2. Delete the notification document from Firestore
    await db.collection('notifications').doc(notificationId).delete();

    console.log(`Admin '${req.user.email}' deleted notification with ID: ${notificationId}`);
    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error while deleting notification.' });
  }
});

// ----------------------------
// Admin Delete Flipbook Route
// ----------------------------
app.post('/api/delete-flipbook', ensureAdmin, async (req, res) => {
  const { flipbookId, coverPhotoPath } = req.body;
  if (!flipbookId) return res.status(400).json({ error: 'Flipbook ID is required.' });

  try {
    // Delete cover photo from Firebase if it exists
    if (coverPhotoPath) {
      console.log(`Deleting flipbook cover image: ${coverPhotoPath}`);
      await deleteFileFromFirebase(coverPhotoPath);
    }

    // Delete the flipbook document from Firestore
    await db.collection('flipbooks').doc(flipbookId).delete();

    console.log(`Admin '${req.user.email}' deleted flipbook with ID: ${flipbookId}`);
    res.status(200).json({ success: true, message: 'Flipbook deleted successfully.' });
  } catch (error) {
    console.error('Error deleting flipbook:', error);
    res.status(500).json({ error: 'Internal server error while deleting flipbook.' });
  }
});

// ----------------------------
// Admin Update Newsletter Route
// ----------------------------
app.post('/api/update-newsletter', ensureAdmin, async (req, res) => {
  const { name, topic, content, previewImageURL, oldPreviewImageUrl, isEditMode } = req.body;

  if (!name || !topic || !content) {
    return res.status(400).json({ error: 'Name, topic and content are required.' });
  }

  try {
    let finalContent = content;
    const dom = new JSDOM();
    
    // Process images pasted into the content (base64 to Firebase)
    const htmlDoc = dom.window.document.createRange().createContextualFragment(content);
    const images = htmlDoc.querySelectorAll("img");
    for (const img of images) {
      const src = img.src;
      if (src.startsWith("data:image")) {
        console.log('Uploading new image to Firebase...');
        const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
        const firebaseUrl = await uploadBase64ToFirebase(src, 'drc-janmat-images', fileName);
        finalContent = finalContent.replace(src, firebaseUrl);
      }
    }

    let finalPreviewImageUrl = oldPreviewImageUrl || '';

    // If a new preview image URL is provided, it means a new image was uploaded on the client.
    if (previewImageURL) {
      // Delete the old one if it exists
      if (oldPreviewImageUrl) {
        const path = extractPathFromFirebaseURL(oldPreviewImageUrl);
        if (path) {
            console.log(`Deleting old newsletter preview image: ${path}`);
            await deleteFileFromFirebase(path);
        }
      }
      // The new URL is the one from the client
      finalPreviewImageUrl = previewImageURL;
    }

    const newsletterRef = db.collection('latestNewsletter').doc('current');
    await newsletterRef.set({
      name: name,
      topic,
      previewImageUrl: finalPreviewImageUrl,
      content: finalContent,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Admin '${req.user.email}' updated latest newsletter.`);
    res.status(200).json({ success: true, message: 'Newsletter updated successfully.' });
  } catch (error)
 {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ error: 'Internal server error while updating newsletter.' });
  }
});

// ----------------------------
// Admin Delete Newsletter Route
// ----------------------------
app.post('/api/delete-newsletter', ensureAdmin, async (req, res) => {
  const { previewImageUrl } = req.body;

  try {
    // Delete preview image from Firebase if it exists
    if (previewImageUrl) {
        const path = extractPathFromFirebaseURL(previewImageUrl);
        if (path) {
            console.log(`Deleting newsletter cover image: ${path}`);
            await deleteFileFromFirebase(path);
        }
    }

    // Delete the newsletter document from Firestore
    await db.collection('latestNewsletter').doc('current').delete();

    console.log(`Admin '${req.user.email}' deleted latest newsletter.`);
    res.status(200).json({ success: true, message: 'Newsletter deleted successfully.' });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({ error: 'Internal server error while deleting newsletter.' });
  }
});

// ----------------------------
// Admin Delete Comment Route
// ----------------------------
app.post('/api/delete-comment', ensureAdmin, async (req, res) => {
  const { blogId, commentId } = req.body;
  if (!blogId || !commentId) {
    return res.status(400).json({ error: 'Blog ID and Comment ID are required.' });
  }

  try {
    // Delete the comment document from Firestore
    await db.collection('blogs').doc(blogId).collection('comments').doc(commentId).delete();

    // Decrement comment count on the blog post
    const blogRef = db.collection('blogs').doc(blogId);
    await blogRef.update({ comments: admin.firestore.FieldValue.increment(-1) });

    console.log(`Admin '${req.user.email}' deleted comment '${commentId}' from blog '${blogId}'.`);
    res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error while deleting comment.' });
  }
});

// ----------------------------
// Public Get Latest Newsletter Route
// ----------------------------
app.get('/api/latest-newsletter', async (req, res) => {
  try {
    const newsletterRef = db.collection('latestNewsletter').doc('current');
    const docSnap = await newsletterRef.get();
    if (docSnap.exists) {
      res.status(200).json(docSnap.data());
    } else {
      res.status(404).json({ error: 'No newsletter found.' });
    }
  } catch (error) {
    console.error('Error fetching latest newsletter:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ----------------------------
// Public Get All Flipbooks Route
// ----------------------------
app.get('/api/flipbooks', async (req, res) => {
  try {
    const flipbooksQuery = db.collection('flipbooks').orderBy("createdAt", "desc");
    const querySnapshot = await flipbooksQuery.get();
    const flipbooksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(flipbooksData);
  } catch (error) {
    console.error('Error fetching flipbooks:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin Get All Messages Route
app.get('/api/messages', ensureAdmin, async (req, res) => { // ✅ RE-APPLY SECURITY
  try {
    const messagesQuery = db.collection('contactSubmissions').orderBy('createdAt', 'desc');
    const querySnapshot = await messagesQuery.get();
    const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(messagesData);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ----------------------------
// Public Contact Form Submission Route
// ----------------------------
app.post('/api/contact-submission', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    await db.collection('contactSubmissions').add({
      name,
      email,
      subject,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
    });
    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    res.status(500).json({ error: 'Internal server error while sending message.' });
  }
});

// ----------------------------
// Public Get Comments for a Blog Post
// ----------------------------
app.get('/api/blog/:blogId/comments', async (req, res) => {
  const { blogId } = req.params;
  try {
    const commentsRef = db.collection('blogs').doc(blogId).collection('comments');
    const q = commentsRef.orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();
    const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(commentsData);
  } catch (error) {
    console.error(`Error fetching comments for blog ${blogId}:`, error);
    res.status(500).json({ error: 'Internal server error while fetching comments.' });
  }
});

// ----------------------------
// User Add Comment Route
// ----------------------------
app.post('/api/add-comment', async (req, res) => {
  // This route is for all authenticated users, so we don't use ensureAdmin
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { blogId, author, text } = req.body;
  if (!blogId || !author || !text) {
    return res.status(400).json({ error: 'Blog ID, author, and text are required.' });
  }

  try {
    const commentData = {
      author,
      text,
      authorEmail: req.user.email, // Get email from the secure session
      authorRole: req.user.role,   // Get role from the secure session
      createdAt: new Date(),
      likes: 0,
      likedBy: [],
    };

    const commentsRef = db.collection('blogs').doc(blogId).collection('comments');
    await commentsRef.add(commentData);

    // Increment comment count on the blog post
    const blogRef = db.collection('blogs').doc(blogId);
    await blogRef.update({ comments: admin.firestore.FieldValue.increment(1) });

    res.status(201).json({ success: true, message: 'Comment added successfully.' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error while adding comment.' });
  }
});

// ----------------------------
// User Like Comment Route
// ----------------------------
app.post('/api/like-comment', async (req, res) => {
  const { blogId, commentId, action } = req.body; // action is 'like' or 'unlike'
  if (!blogId || !commentId || !action) {
    return res.status(400).json({ error: 'Blog ID, Comment ID, and action are required.' });
  }

  try {
    const commentRef = db.collection('blogs').doc(blogId).collection('comments').doc(commentId);
    const incrementValue = action === 'like' ? 1 : -1;

    if (req.isAuthenticated()) {
      // If user is logged in, add/remove them from the 'likedBy' array
      const userIdentifier = { uid: req.user.id, role: req.user.role };
      const arrayUpdateOperation = action === 'like'
        ? admin.firestore.FieldValue.arrayUnion(userIdentifier)
        : admin.firestore.FieldValue.arrayRemove(userIdentifier);

      await commentRef.update({
        likes: admin.firestore.FieldValue.increment(incrementValue),
        likedBy: arrayUpdateOperation
      });
    } else {
      // If user is anonymous, just increment/decrement the like count
      await commentRef.update({ likes: admin.firestore.FieldValue.increment(incrementValue) });
    }

    res.status(200).json({ success: true, message: 'Comment liked successfully.' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Internal server error while liking comment.' });
  }
});

// ----------------------------
// User Like Blog Post Route
// ----------------------------
app.post('/api/like-blog-post', async (req, res) => {
  const { postId, action } = req.body; // action can be 'like' or 'unlike'
  if (!postId || !action) {
    return res.status(400).json({ error: 'Post ID and action are required.' });
  }

  try {
    const postRef = db.collection('blogs').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const incrementValue = action === 'like' ? 1 : -1;
    await postRef.update({ likes: admin.firestore.FieldValue.increment(incrementValue) });

    res.status(200).json({ success: true, message: 'Blog post liked successfully.' });
  } catch (error) {
    console.error('Error liking blog post:', error);
    res.status(500).json({ error: 'Internal server error while liking blog post.' });
  }
});


// ----------------------------
// Start Server
// ----------------------------
app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
