# Backend Server - Google OAuth & MongoDB

Express.js backend server with Google OAuth authentication and MongoDB integration.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy the template: `cp config/config.env.example config/config.env`
   - Add your Google OAuth credentials
   - Add your MongoDB connection string
   - Generate a JWT secret

3. **Start the server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes (`/auth`)

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback URL
- `GET /auth/user` - Get current authenticated user (requires auth)
- `GET /auth/logout` - Logout current user (requires auth)
- `GET /auth/check` - Check authentication status

### Health Check

- `GET /health` - Server health check

## Environment Variables

Required variables in `config/config.env`:

```env
MONGODB_URI=mongodb://localhost:27017/drc-political-science
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=http://localhost:3001
```

### Google SMTP Environment Variables

To use Google SMTP for sending emails, you need to configure the following environment variables. You can get the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the Google API Console. The `GOOGLE_REFRESH_TOKEN` can be obtained using the OAuth 2.0 Playground.

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
EMAIL_USERNAME=your_email@gmail.com
```

## Database Schema

### User Model

```javascript
{
  googleId: String (required, unique),
  email: String (required, unique),
  name: String (required),
  profilePicture: String,
  createdAt: Date,
  lastLogin: Date
}
```

## Development

```bash
npm run dev  # Start with nodemon (auto-reload)
npm start    # Start without auto-reload
```

## Security Notes

- Never commit `config.env` file
- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Keep dependencies updated

## Full Setup Instructions

See `../SETUP_INSTRUCTIONS.md` for complete setup guide including:
- MongoDB installation
- Google OAuth configuration
- Production deployment

## Tech Stack

- Express.js - Web framework
- Mongoose - MongoDB ODM
- Passport.js - Authentication middleware
- passport-google-oauth20 - Google OAuth strategy
- express-session - Session management
- connect-mongo - MongoDB session store
- cors - Cross-origin resource sharing
