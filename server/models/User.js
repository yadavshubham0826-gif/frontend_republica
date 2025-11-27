const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: function () {
      return this.authMethod === 'email';
    }
  },

  googleId: {
    type: String,
  },

  profilePicture: {
    type: String,
    default: 'https://i.imgur.com/6b6psO5.png',
  },

  authMethod: {
    type: String,
    enum: ['email', 'google'],
    required: true,
  },

  // 🔥 IMPORTANT: ROLE FIELD
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  dateOfBirth: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
