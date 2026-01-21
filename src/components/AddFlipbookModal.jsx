import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';
import '../styles/style.css'; // Reusing modal styles

const AddFlipbookModal = ({ isOpen, onClose, onFlipbookAdded }) => {
  const [publishingYear, setPublishingYear] = useState('');
  const [flipbookLink, setFlipbookLink] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [error, setError] = useState('');

  const {
    uploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = useFirebasePhotoUploader();

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

    try {
      let coverPhotoURL = null;
      if (coverPhoto) {
        const coverPhotoData = await uploadPhoto(coverPhoto, 'flipbook_covers/');
        coverPhotoURL = typeof coverPhotoData === 'string' ? coverPhotoData : coverPhotoData.url;
      }

      // Call the new secure backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/add-flipbook`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishingYear,
          flipbookLink,
          coverPhotoURL, // Sending URL now
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
    }
  };

  const isLoading = uploading;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Add New Flipbook</h2>
        {(error || uploadError) && <div className="error-message">{error || uploadError.message}</div>}
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
          
          {uploading && (
            <div className="progress-bar-container" style={{ width: '100%', marginBottom: '1rem' }}>
              <p>Uploading... {progress.toFixed(0)}%</p>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
          
          <div className="confirm-modal-actions">
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Flipbook'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddFlipbookModal;