const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        // This is the correct, stateful implementation for OAuth.
        // It finds or creates a user in the database, and links accounts if email already exists.
        const googleUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          authMethod: 'google',
          role: 'user', // Explicitly set the role for new Google users
        };

        try {
          // 1. Find user by googleId
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          // 2. If not found, find by email and link the account
          user = await User.findOne({ email: googleUser.email });
          if (user) {
            user.googleId = googleUser.googleId;
            user.profilePicture = user.profilePicture || googleUser.profilePicture;
            user.authMethod = 'google'; // or manage multiple methods
            await user.save();
            return done(null, user);
          }

          // 3. If not found by either, create a new user
          user = await User.create(googleUser);
          return done(null, user);

        } catch (err) {
          console.error('Error in Google Strategy:', err);
          return done(err, null);
        }
      }
    )
  );

  // Local Strategy (for email and password login)
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // 1. Find user by email in MongoDB.
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          // If no user is found, return the specific message.
          return done(null, false, { message: 'Email not registered.' });
        }

        // If user was created via Google, they won't have a password.
        // Deny login and prompt them to use Google sign-in.
        if (!user.password) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // 2. If user is found, compare the provided password with the stored hashed password.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          // If passwords do not match, return the specific message.
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        // 3. If everything matches, login is successful.
        return done(null, user);
      } catch (err) {
        console.error('Error in Local Strategy:', err);
        return done(err);
      }
    })
  );

  // Serialize user for the session.
  // This stores the user's database ID in the session cookie.
  passport.serializeUser((user, done) => {
    console.log('serializeUser: user.id ->', user.id); // Debugging log
    done(null, user.id);
  });

  // Deserialize user from the session.
  // This uses the ID from the session to find the user in the database
  // and attach them to req.user.
  passport.deserializeUser(async (id, done) => {
    console.log('deserializeUser: id ->', id); // Debugging log
    try {
      const user = await User.findById(id);
      console.log('deserializeUser: found user ->', user ? user.id : 'none'); // Debugging log
      done(null, user);
    } catch (err) {
      console.error('deserializeUser error:', err); // Debugging log
      done(err, null);
    }
  });
};