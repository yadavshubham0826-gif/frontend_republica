import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/style.css'; // Reusing modal styles

const CLOUDINARY_CLOUD_NAME = "dyv1rtwvh";
const CLOUDINARY_UPLOAD_PRESET = "DRC_JANMAT_IMAGES";

const AddFlipbookModal = ({ isOpen, onClose, onFlipbookAdded }) => {
  const [publishingYear, setPublishingYear] = useState('');
  const [flipbookLink, setFlipbookLink] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!publishingYear || !flipbookLink) {
      setError('Publishing Year and Flipbook Link are required.');
      return;
    }
    setLoading(true);

    try {
      // Convert file to base64 to send as JSON
      const coverPhotoBase64 = coverPhoto ? await toBase64(coverPhoto) : null;

      // Call the new secure backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/add-flipbook`, {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishingYear,
          flipbookLink,
          coverPhotoBase64,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add flipbook.');
      }

      setPublishingYear('');
      setFlipbookLink('');
      setCoverPhoto(null);
      onClose();
      if (onFlipbookAdded) {
        onFlipbookAdded();
      }
    } catch (err) {
      console.error('Error adding flipbook:', err);
      setError(err.message || 'Failed to add flipbook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert file to base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Add New Flipbook</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="add-blog-form">
          <div className="form-group">
            <label htmlFor="publishingYear">Publishing Year</label>
            <input id="publishingYear" type="number" placeholder="e.g., 2024" value={publishingYear} onChange={(e) => setPublishingYear(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="flipbookLink">Link of Flipbook</label>
            <input id="flipbookLink" type="url" placeholder="https://example.com/flipbook" value={flipbookLink} onChange={(e) => setFlipbookLink(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="coverPhoto">Cover Photo</label>
            <input id="coverPhoto" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="confirm-modal-actions">
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Flipbook'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddFlipbookModal;