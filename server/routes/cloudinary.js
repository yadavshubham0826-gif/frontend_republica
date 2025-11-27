const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');

// Route to handle image deletion from Cloudinary
// Handles DELETE requests to /cloudinary/delete-image
router.delete('/delete-image', async (req, res) => {
  const { public_id } = req.body;

  // Ensure a public_id was sent in the request body
  if (!public_id) {
    return res.status(400).json({ message: 'Image public_id is required.' });
  }

  try {
    // Use the Cloudinary SDK's 'destroy' method to delete the image
    const result = await cloudinary.uploader.destroy(public_id);

    // Check the result from Cloudinary
    if (result.result === 'ok') {
      res.status(200).json({ message: 'Image deleted successfully from Cloudinary.' });
    } else {
      res.status(404).json({ message: 'Image not found or could not be deleted.', details: result });
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    res.status(500).json({ message: 'Server error during image deletion.' });
  }
});

module.exports = router;