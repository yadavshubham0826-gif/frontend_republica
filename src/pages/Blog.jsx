// src/pages/Blog.jsx
import { useState, useEffect } from "react";
import { useColorPalette } from '../context/ColorContext.jsx';
import { useUser } from '../context/UserContext';
import { useNavigate } from "react-router-dom"; // for navigation
import ConfirmModal from "../components/ConfirmModal";
import EditBlogModal from "../components/EditBlogModal";
import { db } from "../firebase-config.js"; // Import Firestore instance
import { collection, getDocs, query, orderBy, doc, updateDoc, increment } from "firebase/firestore"; // Import Firestore functions
import "../styles/style.css";

// Helper to extract Cloudinary public_id from a URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9_]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set()); // Track liked posts in this session

  const { user } = useUser();
  const isUserAdmin = user && user.role === 'admin'; // <-- New admin check

  const { palette, loading: paletteLoading } = useColorPalette();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch posts directly from Firestore
      const blogsCollection = collection(db, 'blogs');
      const q = query(blogsCollection, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const processedPosts = postsData.map((data) => {
        const content = data.content || "";
        let previewImage = null;
        try {
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(content, "text/html");
          const firstImg = htmlDoc.querySelector("img");
          previewImage = firstImg ? firstImg.src : null;
        } catch (err) {
          console.error("Error parsing HTML for preview image:", err);
        }

        // The date from the backend might be a string or a Firestore timestamp-like object
        let postDate;
        if (data.date && typeof data.date.toDate === 'function') { // Firestore Timestamp object
            postDate = data.date.toDate().toISOString();
        } else if (data.date && data.date._seconds) { // Firestore timestamp-like object from older API
            postDate = new Date(data.date._seconds * 1000).toISOString();
        } else if (data.date) { // Already a string or Date object
            const parsedDate = new Date(data.date);
            postDate = !isNaN(parsedDate) ? parsedDate.toISOString() : new Date().toISOString();
        } else {
            postDate = new Date().toISOString();
        }

        return {
          id: data.id,
          ...data,
          slug: data.slug || (data.title ? data.title.replace(/\s+/g, "-").toLowerCase() : ''),
          date: postDate,
          previewImage,
        };
      });

      setPosts(processedPosts);
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to fetch blog posts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (paletteLoading) {
    return <p>Loading...</p>;
  }
  const gradient = palette.gradient;

  const handleLike = async (postId) => {
    const isCurrentlyLiked = likedPosts.has(postId);
    const newLikedPosts = new Set(likedPosts);
    const incrementValue = isCurrentlyLiked ? -1 : 1;

    if (isCurrentlyLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    setPosts(currentPosts =>
      currentPosts.map(p => 
        p.id === postId ? { ...p, likes: (p.likes || 0) + incrementValue } : p
      )
    );

    try {
      // Update the like count directly in Firestore
      const postRef = doc(db, "blogs", postId);
      await updateDoc(postRef, {
        likes: increment(incrementValue)
      });
    } catch (error) {
      console.error("Failed to update like count:", error);
      // Rollback UI on error
      setLikedPosts(prevLiked => {
        const newLiked = new Set(prevLiked);
        isCurrentlyLiked ? newLiked.add(postId) : newLiked.delete(postId);
        return newLiked;
      });
      setPosts(currentPosts =>
        currentPosts.map(p =>
          p.id === postId ? { ...p, likes: (p.likes || 0) - incrementValue } : p
        )
      );
    }
  };

  // This function is now just a callback to refresh the posts list.
  const handleUpdateBlog = () => {
    fetchPosts();
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      // Call the new secure backend endpoint
      const response = await fetch("https://republicadrcdu.vercel.app/api/delete-blog", {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postToDelete.id,
          content: postToDelete.content, // Send content to find images on backend
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete post.');
      }

      setPosts(posts.filter((p) => p.id !== postToDelete.id));
      setPostToDelete(null);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again.");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  const createSummary = (htmlContent, wordLimit) => {
    if (!htmlContent) return "";
    const text = new DOMParser().parseFromString(htmlContent, "text/html").body.textContent || "";
    return text.split(/\s+/).slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <main id="main-content">
      <section className="page-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <h1>Blog</h1>
          <p>Insights, articles, and updates from the department. </p>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <div className="blog-header">
            <h2>Latest Posts</h2>
          </div>

          {loading && <p>Loading posts...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && posts.length === 0 && <p>No posts yet.</p>}

          <div className="grid">
            {posts.map((post) => {
              const summary = createSummary(post.content, 50);

              return (
                <div
                  key={post.id}
                  className="card blog-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="blog-item-inner-content" style={{ flexGrow: 1 }}>
                      {post.previewImage && (
                        <div className="blog-preview-image-container">
                          <img
                            src={post.previewImage}
                            alt={post.title}
                            className="blog-preview-image"
                          />
                        </div>
                      )}
                      <div className="blog-item-text-content">
                        <h2>{post.title}</h2>
                        <p className="muted" style={{ marginBottom: "0.5rem" }}>
                          By {post.author} on {new Date(post.date).toLocaleDateString()}
                        </p>
                        <p>{summary}</p>
                      </div>
                    </div>
                    <div className="blog-item-stats" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1cm', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                      <span 
                        role="button"
                        className="stat-item" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                      >
                        {likedPosts.has(post.id) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e74c3c' }}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        )}
                        <span style={{ fontWeight: '500' }}>{post.likes || 0}</span>
                      </span>
                      <span className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3498db' }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span style={{ fontWeight: '500' }}>{post.views || 0}</span>
                      </span>
                      <button 
                        className="stat-item" 
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/blog/${post.slug}#comments`);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2ecc71' }}>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span style={{ fontWeight: '500' }}>{post.comments || 0}</span>
                      </button>
                    </div>

                    {isUserAdmin && (
                      <div className="blog-item-actions" style={{ display: "flex", gap: "0.5rem", alignItems: "center", paddingTop: '1rem' }}>
                        <button
                          className="btn btn-secondary edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPost(post);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToDelete(post);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {isUserAdmin && currentPost && (
        <EditBlogModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onAddBlog={handleUpdateBlog}
          postToEdit={currentPost}
        />
      )}

      {isUserAdmin && postToDelete && (
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeletePost}
          title="Confirm Deletion"
        >
          <p>
            Are you sure you want to delete the post titled "
            <strong>{postToDelete.title}</strong>"? This action cannot be undone.
          </p>
        </ConfirmModal>
      )}
    </main>
  );
};

export default Blog;
