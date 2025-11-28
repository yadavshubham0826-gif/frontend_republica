const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const User = require('../models/User'); // ✅ Import the Mongoose User model

module.exports = function(db) {
  const router = express.Router();

  // === GOOGLE OAUTH ROUTES ===

  // Google Auth Routes
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login-failure', // A path on your frontend
    successRedirect: '/login-success'  // A path on your frontend
  }));

  // Route to handle login failure
  router.get('/login-failure', (req, res) => {
    res.redirect('https://republicadrcdu.vercel.app/login?error=true');
  });

  // Route to handle login success
  router.get('/login-success', (req, res) => {
    // This route is hit by the popup window after a successful Google login.
    // We send a script to the popup that closes itself and tells the main window to reload.
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Success</title>
        <script>
          window.opener.location.reload(); // Reload the main window
          window.close(); // Close the popup
        </script>
      </head>
      <body>
        <p>Authentication successful. You can close this window.</p>
      </body>
      </html>
    `);
  });

  // === EMAIL & OTP ROUTES ===

  // SEND OTP
  router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    try {
      // ✅ CORRECT: Check for existing user in MongoDB, not Firestore
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
    } catch (error) {
      console.error('Error checking for existing user:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    req.session.otp = otp;
    req.session.otpExpires = otpExpires;
    req.session.emailForVerification = email;

    try {
      // Configure nodemailer to use Resend's SMTP server
      const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend', // This is always 'resend'
          pass: process.env.RESEND_API_KEY, // Your Resend API key
        },
      });

      const mailOptions = {
        from: '"Republica DRC" <yadavshubhamahir26@gmail.com>', // ✅ Use the exact email you verified as a Single Sender
        to: email,
        subject: 'Your Verification Code for Republica',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
      res.status(200).json({ success: true, message: 'OTP sent successfully.' });

    } catch (error) {
      console.error('Error sending OTP email:', error);
      res.status(500).json({ error: 'Failed to send verification email.' });
    }
  });

  // VERIFY OTP
  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    // 1. Basic validation
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    // 2. Check session data
    if (email !== req.session.emailForVerification) {
      return res.status(400).json({ error: 'Email does not match the one used for OTP request.' });
    }
    if (otp !== req.session.otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }
    if (Date.now() > req.session.otpExpires) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // 3. If all checks pass, clear OTP from session and send success
    req.session.otp = null;
    req.session.otpExpires = null;
    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  });

  // EMAIL SIGNUP
  router.post('/email-signup', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
      // ✅ Check if user already exists in MongoDB
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      // ✅ Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // ✅ Create new user with Mongoose model
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        authMethod: 'email',
      });
      await newUser.save();

      // ✅ Log the user in
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({
          success: true,
          message: 'Account created successfully.',
          user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        });
      });
    } catch (error) {
      console.error('Error during email signup:', error);
      res.status(500).json({ error: 'Internal server error during signup.' });
    }
  });

  // EMAIL LOGIN
  router.post('/email-login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info.message || 'Login failed. Please check your credentials.' });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({
          success: true,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
      });
    })(req, res, next);
  });

  return router;
};