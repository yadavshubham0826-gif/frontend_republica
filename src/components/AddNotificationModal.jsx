import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/style.css'; // Reusing modal styles

const AddNotificationModal = ({ isOpen, onClose, onNotificationAdded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const wordLimit = 500;

  if (!isOpen) return null;

  const handleContentChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length <= wordLimit) {
      setContent(text);
    }
  };

  const getWordCount = () => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  // Helper to convert file to base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !content) {
      setError('Title and Main Content are required.');
      return;
    }
    setLoading(true);

    try {
      const photoBase64 = photo ? await toBase64(photo) : null;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/add-notification`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          photoBase64,
          linkUrl,
          linkName,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add notification.');
      }

      onClose();
      if (onNotificationAdded) onNotificationAdded();

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Add New Notification</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="add-blog-form">
          <div className="form-group">
            <label htmlFor="notificationTitle">Title</label>
            <input id="notificationTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="notificationContent">Main Content ({getWordCount()}/{wordLimit} words)</label>
            <textarea id="notificationContent" rows="8" value={content} onChange={handleContentChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="notificationPhoto">Photo (Optional)</label>
            <input id="notificationPhoto" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="form-group">
            <label htmlFor="notificationLinkUrl">Link URL (Optional)</label>
            <input id="notificationLinkUrl" type="url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="notificationLinkName">Link Common Name (Optional)</label>
            <input id="notificationLinkName" type="text" placeholder="e.g., Click Here for Details" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Notification'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddNotificationModal;