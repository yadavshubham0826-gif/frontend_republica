const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    // Password is not required for Google OAuth users
  },
  role: {
    type: String,
    default: 'user', // 'user' or 'admin'
  },
  authMethod: {
    type: String,
    required: true,
    default: 'email', // 'email' or 'google'
  },
  googleId: String,
});

module.exports = mongoose.model('User', UserSchema);