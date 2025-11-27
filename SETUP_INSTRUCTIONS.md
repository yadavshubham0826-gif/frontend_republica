# Google OAuth & MongoDB Setup Instructions

This guide will help you set up Google OAuth authentication with MongoDB for your website.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB installed locally OR MongoDB Atlas account
- Google Account for OAuth credentials

---

## Step 1: Install MongoDB

### Option A: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download and install for your operating system

2. **Start MongoDB**
   - Windows: MongoDB should start automatically, or run `mongod` in terminal
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Verify MongoDB is running**
   ```bash
   mongo --version
   ```

### Option B: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier M0)
4. Wait for cluster to be created (5-10 minutes)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Update `MONGODB_URI` in `server/config/config.env`

---

## Step 2: Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it: "DRC Political Science Website"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: "DRC Political Science Website"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue" through all steps

5. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "DRC Website OAuth"
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/auth/google/callback`
   - Click "Create"

6. **Copy Your Credentials**
   - You'll get a Client ID and Client Secret
   - **IMPORTANT**: Keep these secure, never commit to Git!

---

## Step 3: Configure Environment Variables

1. **Open `server/config/config.env`**

2. **Update the following values:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/drc-political-science
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drc-political-science

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (generate a random string, min 32 characters)
JWT_SECRET=your_random_secret_key_min_32_characters_long

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

3. **Generate JWT Secret**
   - You can generate a random string online or use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## Step 4: Install Backend Dependencies

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

---

## Step 5: Run the Application

### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### Terminal 2: Start Frontend (Already Running)

Your frontend should already be running on `http://localhost:3001`

If not:
```bash
npm run dev
```

---

## Step 6: Test the Login

1. **Open your browser to** `http://localhost:3001`

2. **Click the "Login" button** in the top-right corner

3. **Click "Continue with Google"**

4. **Select your Google account**

5. **You should be redirected back** to your website

6. **Check the browser console** for authentication status

---

## Verify Database Storage

### Option A: MongoDB Compass (GUI)

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Open database: `drc-political-science`
4. Open collection: `users`
5. You should see your user data with name and email

### Option B: MongoDB Shell

```bash
mongo
use drc-political-science
db.users.find().pretty()
```

You should see output like:
```javascript
{
  "_id": ObjectId("..."),
  "googleId": "123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "profilePicture": "https://...",
  "createdAt": ISODate("..."),
  "lastLogin": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## Troubleshooting

### Error: "MongoDB connection failed"
- Ensure MongoDB is running
- Check your connection string in `config.env`
- For Atlas: Check your IP is whitelisted

### Error: "Google OAuth failed"
- Verify Client ID and Secret are correct
- Check redirect URI matches exactly in Google Console
- Ensure `http://localhost:5000/auth/google/callback` is added

### Error: "CORS issues"
- Ensure frontend is running on port 3001
- Check `FRONTEND_URL` in config.env

### Error: "Session not persisting"
- Clear browser cookies
- Check MongoDB connection for session storage
- Verify JWT_SECRET is set

---

## Production Deployment Notes

When deploying to production:

1. **Update URLs in Google Console**
   - Add your production domain to authorized origins
   - Add production callback URL

2. **Update Environment Variables**
   - Set `NODE_ENV=production`
   - Update `FRONTEND_URL` to your domain
   - Update `GOOGLE_CALLBACK_URL` to production URL
   - Use strong JWT_SECRET (64+ characters)

3. **Security**
   - Never commit `config.env` to Git
   - Use environment variables in hosting platform
   - Enable HTTPS (required for production OAuth)
   - Set `secure: true` for cookies

---

## Additional Features You Can Add

- **User Dashboard**: Create a protected route showing user profile
- **Logout Functionality**: Add logout button when user is authenticated
- **Admin Panel**: Add role-based access control
- **User Management**: View all users in database

---

## Need Help?

- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- MongoDB Docs: https://docs.mongodb.com/
- Passport.js Docs: http://www.passportjs.org/

---

## Security Best Practices

✅ Never commit sensitive credentials to Git
✅ Use environment variables for all secrets
✅ Implement rate limiting for auth endpoints
✅ Use HTTPS in production
✅ Regularly rotate JWT secrets
✅ Keep dependencies updated
✅ Implement proper error handling
✅ Add request validation
✅ Use secure session configuration
✅ Implement CSRF protection for production

---

**Your authentication system is now ready! Users can log in with Google and their data will be securely stored in MongoDB.** 🎉
