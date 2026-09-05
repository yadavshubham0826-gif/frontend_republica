import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from '@tinymce/tinymce-react';
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';
import LoadingUI from './LoadingUI';
import ConfirmModal from './ConfirmModal';
import '../styles/style.css';

const stripHtml = (html) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://frontend-republica.onrender.com';

const ManageNoticeModal = ({ isOpen, onClose, onNoticeUpdated }) => {
  const [notices, setNotices] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    uploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = useFirebasePhotoUploader();

  const fetchNotices = async () => {
    setLoadingList(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`);
      if (!response.ok) {
        throw new Error('Failed to load notices.');
      }
      const items = await response.json();
      setNotices(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err.message || 'Failed to load notices.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotices();
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setBody('');
    setPhoto(null);
    setLinkUrl('');
    setError('');
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!stripHtml(body) && !photo && !linkUrl.trim()) {
      setError('Add a main body: text, a URL, an image, or a combination.');
      return;
    }

    setSaving(true);

    try {
      let photoURL = '';
      let photoPath = '';

      if (photo) {
        const photoData = await uploadPhoto(photo, 'siteNotices/');
        photoURL = typeof photoData === 'string' ? photoData : photoData.url;
        photoPath = typeof photoData === 'string' ? '' : photoData.path;
      }

      const response = await fetch(`${API_BASE_URL}/api/add-notice`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          linkUrl: linkUrl.trim(),
          photoURL,
          photoPath,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save notice.');
      }

      resetForm();
      await fetchNotices();
      if (onNoticeUpdated) onNoticeUpdated();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-notice`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeId: deleteTarget.id,
          photoPath: deleteTarget.photo?.path,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete notice.');
      }

      setDeleteTarget(null);
      await fetchNotices();
      if (onNoticeUpdated) onNoticeUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isLoading = uploading || saving;

  return ReactDOM.createPortal(
    <>
      <div className="modal-backdrop">
        <div className="modal-content manage-flash-modal manage-notice-modal">
          <button className="close-modal-btn" onClick={onClose}>&times;</button>
          <h2 className="modal-title">Add / Delete Notice</h2>
          {(error || uploadError) && <div className="error-message">{error || uploadError.message}</div>}

          <div className="flash-manage-layout">
            <section className="flash-manage-list">
              <h3>Existing Notices</h3>
              {loadingList ? (
                <LoadingUI text="Loading notices" variant="inline" size="sm" />
              ) : notices.length > 0 ? (
                <ul className="flash-manage-items">
                  {notices.map((item) => (
                    <li key={item.id} className="flash-manage-item">
                      <div className="flash-manage-item-info">
                        <span className="flash-manage-item-title">{item.title}</span>
                        <span className="flash-manage-item-type">
                          {[item.body && 'TEXT', item.photo?.url && 'IMAGE', item.linkUrl && 'URL']
                            .filter(Boolean)
                            .join(' + ') || 'NOTICE'}
                        </span>
                      </div>
                      <div className="flash-manage-item-actions">
                        <button type="button" className="delete-notification-btn" onClick={() => setDeleteTarget(item)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flash-manage-empty">No notices yet. The website will open normally.</p>
              )}
            </section>

            <section className="flash-manage-form-section">
              <h3>Add New Notice</h3>
              <form onSubmit={handleSubmit} className="add-blog-form">
                <div className="form-group">
                  <label htmlFor="noticeTitle">Title</label>
                  <input
                    id="noticeTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Notice title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="noticeBody">Main Body</label>
                  <Editor
                    id="noticeBody"
                    apiKey="wlob6qkemz0muvfnbvbjltl5n6419jw1uyoq4u2ym4hok7o6"
                    value={body}
                    onEditorChange={(newContent) => setBody(newContent)}
                    init={{
                      height: 380,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                        'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media',
                        'table', 'help', 'wordcount', 'emoticons', 'formatpainter',
                      ],
                      toolbar:
                        'undo redo | styleselect formatselect fontfamily fontsize | ' +
                        'bold italic underline strikethrough forecolor backcolor | ' +
                        'alignleft aligncenter alignright alignjustify | ' +
                        'bullist numlist | outdent indent | ' +
                        'link image | table | emoticons | ' +
                        'removeformat | code fullscreen',
                      style_formats: [
                        {
                          title: 'Headers',
                          items: [
                            { title: 'Heading 1', format: 'h1' },
                            { title: 'Heading 2', format: 'h2' },
                            { title: 'Heading 3', format: 'h3' },
                            { title: 'Heading 4', format: 'h4' },
                            { title: 'Heading 5', format: 'h5' },
                            { title: 'Heading 6', format: 'h6' },
                          ],
                        },
                        {
                          title: 'Inline',
                          items: [
                            { title: 'Bold', format: 'bold' },
                            { title: 'Italic', format: 'italic' },
                            { title: 'Underline', format: 'underline' },
                            { title: 'Strikethrough', format: 'strikethrough' },
                          ],
                        },
                        {
                          title: 'Blocks',
                          items: [
                            { title: 'Paragraph', format: 'p' },
                            { title: 'Blockquote', format: 'blockquote' },
                          ],
                        },
                        {
                          title: 'Image Styles',
                          items: [
                            { title: 'Image Shadow', selector: 'img', classes: 'img-shadow' },
                            { title: 'Image Border', selector: 'img', classes: 'img-border' },
                          ],
                        },
                      ],
                      content_style: `
                        body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
                        img.img-shadow { box-shadow: 4px 4px 12px rgba(0,0,0,0.3); }
                        img.img-border { border: 2px solid #ccc; padding: 2px; }
                      `,
                      automatic_uploads: true,
                      file_picker_types: 'image',
                      file_picker_callback: (callback, value, meta) => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          const file = e.target.files[0];
                          try {
                            const photoData = await uploadPhoto(file, 'siteNotices/');
                            const photoURL = typeof photoData === 'string' ? photoData : photoData.url;
                            callback(photoURL, { alt: file.name });
                          } catch (err) {
                            console.error('Image upload failed', err);
                          }
                        };
                        input.click();
                      },
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="noticePhoto">Image (optional)</label>
                  <input id="noticePhoto" type="file" accept="image/*" onChange={handlePhotoChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="noticeLinkUrl">URL (optional)</label>
                  <input
                    id="noticeLinkUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>

                {uploading && (
                  <LoadingUI text="Uploading image" detail={`${progress.toFixed(0)}% complete`} progress={progress} variant="card" size="sm" />
                )}

                <div className="modal-actions">
                  <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={isLoading}>
                    Close
                  </button>
                  <button type="submit" className="modal-button modal-primary-btn" disabled={isLoading}>
                    {isLoading ? <><span className="spinner"></span> Saving...</> : 'Save Notice'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        loading={deleteLoading}
        loadingText="Deleting notice..."
      >
        <p>Are you sure you want to permanently delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.</p>
      </ConfirmModal>
    </>,
    document.body
  );
};

export default ManageNoticeModal;
