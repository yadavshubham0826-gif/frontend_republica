const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// --- In-memory OTP store (replace with Redis in production) ---
const otpStore = {}; // { "email@example.com": { otp: "123456", expires: 1731420000000, verified: false, purpose: "signup/password_reset" } }

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail from .env
    pass: process.env.EMAIL_PASS, // App password from .env
  },
});

// =====================================================
// 🔹 GOOGLE AUTH ROUTES
// =====================================================

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email']
}));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failed' // Redirect to a simple failure page or back to login
  }),
  (req, res, next) => { // <-- Add 'next' here
    console.log('Google callback hit!'); // <-- Add this line
    // Manually establish a session after successful authentication
    req.login(req.user, (err) => { // Passport's login function
      if (err) { return next(err); }
      // Successful authentication, send a script to close the popup.
      const userPayload = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
        dateOfBirth: req.user.dateOfBirth,
        role: req.user.role,
        authMethod: req.user.authMethod,
      };

      fs.readFile(path.join(__dirname, '..', 'public', 'auth-success.html'), 'utf8', (err, html) => {
        if (err) {
          console.error('Error reading auth-success.html:', err);
          return res.status(500).send('Authentication successful, but failed to close popup.');
        }

        const modifiedHtml = html.replace(
          'USER_DATA_PLACEHOLDER',
          JSON.stringify(userPayload)
        );
        res.send(modifiedHtml);
      });
    });
  }
);

// =====================================================
// 🔹 EMAIL LOGIN
// =====================================================
router.post('/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Case 1: Email not found
    if (!user) {
      return res.status(404).json({ success: false, status: 'email_not_found', message: 'Email not registered.' });
    }

    // Case 2: User has no password set (e.g., signed up only with Google)
    if (!user.password) {
      return res.status(403).json({ 
        success: false, 
        status: 'google_auth_required', 
        message: 'This account was created using Google. Please use Google to sign in.' 
      });
    }

    // Case 3: Email user, check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, status: 'invalid_password', message: 'Incorrect password.' });
    }

    // Success - log them in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login failed.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          dateOfBirth: user.dateOfBirth,
          role: user.role, // ✅ Add role to login response
          authMethod: user.authMethod,
        },
      });
    });
  } catch (err) {
    console.error('Email login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =====================================================
// 🔹 CHECK AUTH STATUS
// =====================================================
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    // Check if the user is from the database (has _id) or a temporary Google user.
    const isDbUser = !!user._id;

    res.status(200).json({
      authenticated: true,
      // Construct the user payload based on its type
      user: isDbUser
        ? { // Payload for a user from MongoDB
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            dateOfBirth: user.dateOfBirth,
            role: user.role, // ✅ Add role to auth check response
            authMethod: user.authMethod,
          }
        : { // Payload for a temporary user from Google
            ...user, // Spread the existing tempUser properties (id, name, email, etc.)
            dateOfBirth: null, // Ensure all properties are present
          },
    });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

// =====================================================
// 🔹 LOGOUT
// =====================================================
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to destroy session.' });
      res.clearCookie('connect.sid');
      return res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
  });
});

// =====================================================
// 🔹 SEND OTP
// =====================================================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  try {
    const lowerEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered.' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore[lowerEmail] = { otp, expires, verified: false, purpose: 'signup' };
    console.log(`OTP for ${lowerEmail}: ${otp}`);

    // Send OTP via email
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: lowerEmail,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Error sending OTP.' });
  }
});

// =====================================================
// 🔹 VERIFY OTP
// =====================================================
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

  const lowerEmail = email.toLowerCase().trim();
  const record = otpStore[lowerEmail];

  if (!record) return res.status(400).json({ success: false, message: 'OTP not found or expired.' });
  if (Date.now() > record.expires) {
    delete otpStore[lowerEmail];
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
  }
  if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

  otpStore[lowerEmail].verified = true;
  res.status(200).json({ success: true, message: 'OTP verified successfully.' });
});

// =====================================================
// 🔹 FORGOT PASSWORD REQUEST
// =====================================================
router.post('/forgot-password-request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  try {
    const lowerEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: lowerEmail });
    if (!existingUser) return res.status(404).json({ success: false, message: 'Email does not exist.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore[lowerEmail] = { otp, expires, verified: false, purpose: 'password_reset' };
    console.log(`Password Reset OTP for ${lowerEmail}: ${otp}`);

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: lowerEmail,
      subject: 'Password Reset OTP',
      html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    console.error('Forgot password request error:', error);
    res.status(500).json({ success: false, message: 'Error initiating password reset.' });
  }
});

// =====================================================
// 🔹 RESET PASSWORD
// =====================================================
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
  }

  try {
    const lowerEmail = email.toLowerCase().trim();
    const record = otpStore[lowerEmail];

    if (!record || record.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset request.' });
    }
    if (Date.now() > record.expires) {
      delete otpStore[lowerEmail];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    const user = await User.findOne({ email: lowerEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    delete otpStore[lowerEmail]; // Clear OTP after successful reset
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
});

// =====================================================
// 🔹 EMAIL SIGNUP (with OTP verification)
// =====================================================
router.post('/email-signup', async (req, res) => {
  const { name, email, password, dateOfBirth } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });

  const lowerEmail = email.toLowerCase().trim();
  const record = otpStore[lowerEmail];

  if (!record || !record.verified)
    return res.status(400).json({ success: false, message: 'Please verify your email first.' });

  try {
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const dobValue = dateOfBirth ? new Date(dateOfBirth) : undefined;

    const user = new User({
      name,
      email: lowerEmail,
      password: hashedPassword,
      authMethod: 'email',
      dateOfBirth: dobValue,
      role: 'user', // ✅ Explicitly set role on creation
    });

    await user.save();
    delete otpStore[lowerEmail]; // cleanup OTP

    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in user after signup:', err);
        return res.status(500).json({ success: false, message: 'Account created, but failed to log in automatically.' });
      }

      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          dateOfBirth: user.dateOfBirth,
          role: user.role, // ✅ Add role to signup response
          authMethod: user.authMethod,
        },
      });
    });
  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Temporary route to set a user's role to admin
// WARNING: This route is not secured. It should be removed or secured after initial admin setup.
router.post('/set-admin-role', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: `User ${user.email} is now an admin.` });
  } catch (error) {
    console.error('Error setting admin role:', error);
    res.status(500).json({ success: false, message: 'Server error setting admin role.' });
  }
});

module.exports = router;
