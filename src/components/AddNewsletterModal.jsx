import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from '@tinymce/tinymce-react';
import ConfirmModal from './ConfirmModal';
import '../styles/style.css';

// Helper to extract Cloudinary public_id from a URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9_]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const AddNewsletterModal = ({ isOpen, onClose, onNewsletterAdded, newsletterToEdit }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editImageChoice, setEditImageChoice] = useState(null);

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
      setError('Topic and Content are required.');
      return;
    }
    setLoading(true);

    try {
      // Convert new preview image to base64 to send to the backend
      let previewImageBase64 = null;
      if (previewImage && editImageChoice) {
        const reader = new FileReader();
        reader.readAsDataURL(previewImage);
        previewImageBase64 = await new Promise(resolve => reader.onload = () => resolve(reader.result));
      }

      // Call the new secure backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/update-newsletter`, {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        name,
        topic,
        content,
        previewImageBase64,
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
    try {
      // Call the new secure backend endpoint for deletion
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-newsletter`, {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
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

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{isEditMode ? 'Edit Latest Newsletter' : 'Add Latest Newsletter'}</h2>
        {error && <div className="error-message">{error}</div>}
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

          <div className="form-group">
            <label>Content</label>
 <Editor
   apiKey="wlob6qkemz0muvfnbvbjltl5n6419jw1uyoq4u2ym4hok7o6"
   value={content}
   onEditorChange={(newContent) => setContent(newContent)}
   init={{
     height: 500,
     menubar: true,
     plugins: [
       "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
       "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media",
       "table", "help", "wordcount", "emoticons", "formatpainter"
       // ⬆ removed "textpattern" ONLY
     ],
     toolbar:
       "undo redo | styleselect formatselect fontfamily fontsize | " +
       "bold italic underline strikethrough forecolor backcolor | " +
       "alignleft aligncenter alignright alignjustify | " +
       "bullist numlist | outdent indent | " +
       "link image | table | emoticons | " +
       "removeformat | code fullscreen",
     style_formats: [
       {
         title: 'Headers',
         items: [
           { title: 'Heading 1', format: 'h1' },
           { title: 'Heading 2', format: 'h2' },
           { title: 'Heading 3', format: 'h3' },
           { title: 'Heading 4', format: 'h4' },
           { title: 'Heading 5', format: 'h5' },
           { title: 'Heading 6', format: 'h6' }
         ]
       },
       {
         title: 'Inline',
         items: [
           { title: 'Bold', format: 'bold' },
           { title: 'Italic', format: 'italic' },
           { title: 'Underline', format: 'underline' },
           { title: 'Strikethrough', format: 'strikethrough' }
         ]
       },
       {
         title: 'Blocks',
         items: [
           { title: 'Paragraph', format: 'p' },
           { title: 'Blockquote', format: 'blockquote' }
         ]
       },
       {
         title: 'Image Styles',
         items: [
           { title: 'Image Shadow', selector: 'img', classes: 'img-shadow' },
           { title: 'Image Border', selector: 'img', classes: 'img-border' }
         ]
       }
     ],
     content_style: `
       img.img-shadow { box-shadow: 4px 4px 12px rgba(0,0,0,0.3); }
       img.img-border { border: 2px solid #ccc; padding: 2px; }
     `,
     automatic_uploads: false,
     file_picker_types: "image",
     file_picker_callback: (callback) => {
       const input = document.createElement("input");
       input.type = "file";
       input.accept = "image/*";
       input.onchange = async (e) => {
         const file = e.target.files[0];
         const reader = new FileReader();
         reader.onload = () =>
           callback(reader.result, { alt: file.name });
         reader.readAsDataURL(file);
       };
       input.click();
     },
   }}
 />
 
          </div>
          <div className="confirm-modal-actions">
            {isEditMode && (
              <button type="button" className="modal-button btn-danger" onClick={() => setShowDeleteConfirm(true)} disabled={loading} style={{ marginRight: 'auto' }}>
                Delete Newsletter
              </button>
            )}
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={loading}>{loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Newsletter')}</button>
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