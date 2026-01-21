# Google OAuth Setup Guide - Fix "deleted_client" Error

## The Problem
Your Google OAuth client was deleted, causing the "Error 401: deleted_client" error.

## Solution: Create a New OAuth Client

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account (yadavshalini152005@gmail.com or the account you want to use)

### Step 2: Select or Create a Project
1. Click the project dropdown at the top
2. Either select an existing project OR click "New Project"
3. If creating new:
   - Project name: "DRC Political Science Website"
   - Click "Create"
   - Wait for it to be created, then select it

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen** (left sidebar)
2. Choose **External** user type → Click **Create**
3. Fill in the required fields:
   - **App name**: DRC Political Science Website
   - **User support email**: yadavshalini152005@gmail.com (or your email)
   - **Developer contact information**: yadavshalini152005@gmail.com (or your email)
4. Click **Save and Continue**
5. On **Scopes** page: Click **Save and Continue** (no need to add scopes)
6. On **Test users** page: Click **Save and Continue** (you can add your email later if needed)
7. Click **Back to Dashboard**

### Step 4: Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" and enable it (if not already enabled)
3. Also search for "People API" and enable it (for profile/email access)

### Step 5: Create OAuth 2.0 Client ID
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted about consent screen, click **Configure Consent Screen** and complete Step 3 above
4. For **Application type**: Select **Web application**
5. **Name**: "DRC Website OAuth Client"
6. **Authorized JavaScript origins** (click ADD URI for each):
   - `http://localhost:3000`
   - `http://localhost:5000`
   - `https://republicadrcdu.vercel.app` (if you have production frontend)
7. **Authorized redirect URIs** (click ADD URI for each):
   - `http://localhost:5000/auth/google/callback`
   - `https://frontend-republica.onrender.com/auth/google/callback` (if you have production backend)
8. Click **CREATE**
9. **IMPORTANT**: Copy both the **Client ID** and **Client Secret** immediately (you won't see the secret again!)

### Step 6: Update Your Configuration
1. Open `server/config/config.env`
2. Replace the old credentials with your new ones:
   ```env
   GOOGLE_CLIENT_ID=your_new_client_id_here
   GOOGLE_CLIENT_SECRET=your_new_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
   ```
3. Save the file

### Step 7: Restart Your Server
1. Stop your server (Ctrl+C)
2. Restart it:
   ```bash
   npm start
   # or
   npm run dev
   ```

### Step 8: Test
1. Try logging in with Google again
2. The error should be resolved!

## Important Notes

⚠️ **Security**: Never commit your `config.env` file to Git! It contains sensitive credentials.

⚠️ **Production**: When deploying to production, make sure to:
- Add your production URLs to Authorized JavaScript origins
- Add your production callback URL to Authorized redirect URIs
- Update environment variables in your hosting platform (Render, Vercel, etc.)

## Troubleshooting

**If you still get errors:**
1. Make sure the redirect URI in Google Console exactly matches `GOOGLE_CALLBACK_URL` in your config
2. Check that you've enabled Google+ API and People API
3. Verify the OAuth consent screen is configured
4. Wait a few minutes after creating credentials (Google sometimes needs time to propagate)

