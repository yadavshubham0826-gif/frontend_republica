const admin = require('firebase-admin');

// The admin app is initialized in server.js.
// We just need to get a reference to the storage bucket.
// This will use the default app initialized in server.js.
const bucket = admin.storage().bucket();

module.exports = { bucket };
