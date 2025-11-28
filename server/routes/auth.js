const express = require('express');
const passport = require('passport');

module.exports = function(db) {
  const router = express.Router();

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
    // The user is now authenticated and in the session.
    // Redirect to the frontend's home page or dashboard.
    res.redirect('https://republicadrcdu.vercel.app/');
  });

  // You can add other auth-related routes here if needed.

  return router;
};