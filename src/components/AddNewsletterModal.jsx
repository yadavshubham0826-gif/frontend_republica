import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from '@tinymce/tinymce-react';
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';
import ConfirmModal from './ConfirmModal';
import '../styles/style.css';

const AddNewsletterModal = ({ isOpen, onClose, onNewsletterAdded, newsletterToEdit }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editImageChoice, setEditImageChoice] = useState(null);

  const {
    uploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = useFirebasePhotoUploader();

  const isEditMode = !!newsletterToEdit;

  useEffect(() => {
    setName(isEditMode ? newsletterToEdit.name || "Janmat'25" : "Janmat'25");
    setTopic(isEditMode ? newsletterToEdit.topic || '' : '');
    setContent(isEditMode ? newsletterToEdit.content || '' : '');
    setEditImageChoice(isEditMode ? null : true); // Default to allow upload in add mode, ask in edit mode
    setPreviewImage(null); // Always reset file input
  }, [newsletterToEdit, isEditMode, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPreviewImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !topic || !content) {
      setError('Name, Topic and Content are required.');
      return;
    }
    setLoading(true);

    try {
      let previewImageURL = null;
      if (previewImage && editImageChoice) {
        const previewImageData = await uploadPhoto(previewImage, 'newsletter_previews/');
        previewImageURL = typeof previewImageData === 'string' ? previewImageData : previewImageData.url;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/update-newsletter`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          topic,
          content,
          previewImageURL, // Sending URL
          oldPreviewImageUrl: newsletterToEdit?.previewImageUrl,
          isEditMode,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save newsletter.');
      }

      // Reset form and close modal on success
      setName('');
      setTopic('');
      setPreviewImage(null);
      setContent('');
      onClose();
      if (onNewsletterAdded) onNewsletterAdded();
    } catch (err) {
      console.error('Error saving newsletter:', err);
      setError(err.message || 'Failed to save newsletter.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // This part remains the same as it sends the URL to the backend for deletion
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-newsletter`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewImageUrl: newsletterToEdit?.previewImageUrl }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete newsletter.');
      }
    } catch (err) {
      console.error('Error deleting newsletter:', err);
      setError(err.message || 'Failed to delete newsletter.');
    }

    onClose();
    if (onNewsletterAdded) onNewsletterAdded(); // Trigger refresh
  };

  const isLoading = loading || uploading;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content large-modal">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{isEditMode ? 'Edit Latest Newsletter' : 'Add Latest Newsletter'}</h2>
        {(error || uploadError) && <div className="error-message">{error || uploadError.message}</div>}
        <form onSubmit={handleSubmit} className="add-blog-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input id="topic" type="text" placeholder="e.g., Annual Edition Highlights" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          </div>

          {isEditMode && newsletterToEdit.previewImageUrl && (
            <div className="form-group">
              <label>Current Preview Image</label>
              <img src={newsletterToEdit.previewImageUrl} alt="Current preview" style={{ width: '150px', height: 'auto', border: '1px solid #ccc', borderRadius: '8px', display: 'block', marginBottom: '1rem' }} />
              <label>Do you want to change this image?</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditImageChoice(true)} className={`btn ${editImageChoice === true ? 'btn-primary' : 'modal-secondary-btn'}`}>Yes</button>
                <button type="button" onClick={() => setEditImageChoice(false)} className={`btn ${editImageChoice === false ? 'btn-primary' : 'modal-secondary-btn'}`}>No</button>
              </div>
            </div>
          )}

          {editImageChoice && (
            <div className="form-group">
              <label htmlFor="previewImage">
                {isEditMode ? 'Upload New Preview Image' : 'Preview Image'}
              </label>
              <input id="previewImage" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          )}
          
          {uploading && (
            <div className="progress-bar-container">
              <p>Uploading... {progress.toFixed(0)}%</p>
              <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
            </div>
          )}

          <div className="form-group">
            <label>Content</label>
            <Editor
              apiKey="wlob6qkemz0muvfnbvbjltl5n6419jw1uyoq4u2ym4hok7o6"
              value={content}
              onEditorChange={(newContent) => setContent(newContent)}
              init={{
                height: 400,
                menubar: true,
                plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount emoticons formatpainter',
                toolbar: 'undo redo | styleselect formatselect fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link image | table | emoticons | removeformat | code fullscreen',
                file_picker_types: "image",
                file_picker_callback: async (callback, value, meta) => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (e) => {
                    const file = e.target.files[0];
                    try {
                      const photoData = await uploadPhoto(file, 'newsletter_content/');
                      const photoURL = typeof photoData === 'string' ? photoData : photoData.url;
                      callback(photoURL, { alt: file.name });
                    } catch (err) {
                      console.error("Image upload failed:", err);
                    }
                  };
                  input.click();
                },
              }}
            />
          </div>

          <div className="confirm-modal-actions">
            {isEditMode && (
              <button type="button" className="modal-button btn-danger" onClick={() => setShowDeleteConfirm(true)} disabled={isLoading} style={{ marginRight: 'auto' }}>
                Delete Newsletter
              </button>
            )}
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={isLoading}>{isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Newsletter')}</button>
          </div>
        </form>

        {isEditMode && (
          <ConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Confirm Deletion"
            confirmText="Delete"
          >
            <p>Are you sure you want to delete the latest newsletter? This action cannot be undone.</p>
          </ConfirmModal>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddNewsletterModal;