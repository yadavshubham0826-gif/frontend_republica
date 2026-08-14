import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';
import LoadingUI from './LoadingUI';
import ConfirmModal from './ConfirmModal';
import '../styles/style.css';

const TITLE_WORD_LIMIT = 30;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://frontend-republica.onrender.com';

const ManageFlashModal = ({ isOpen, onClose, onFlashUpdated }) => {
  const [flashItems, setFlashItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [attachmentType, setAttachmentType] = useState('image');
  const [photo, setPhoto] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
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

  const fetchFlashItems = async () => {
    setLoadingList(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/flash`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to load flash items.');
      setFlashItems(result);
    } catch (err) {
      setError(err.message || 'Failed to load flash items.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFlashItems();
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setAttachmentType('image');
    setPhoto(null);
    setPdfDoc(null);
    setLinkUrl('');
    setError('');
  };

  const getWordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  const handleTitleChange = (e) => {
    const text = e.target.value;
    if (getWordCount(text) <= TITLE_WORD_LIMIT) {
      setTitle(text);
    }
  };

  const handleAttachmentTypeChange = (type) => {
    setAttachmentType(type);
    setPhoto(null);
    setPdfDoc(null);
    setLinkUrl('');
    setError('');
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handlePdfChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setPdfDoc(null);
      return;
    }

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfDoc(null);
      e.target.value = '';
      setError('Please upload a PDF document only.');
      return;
    }

    setError('');
    setPdfDoc(selectedFile);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setAttachmentType(item.attachmentType || 'image');
    setPhoto(null);
    setPdfDoc(null);
    setLinkUrl(item.linkUrl || '');
    setError('');
  };

  const getAttachmentUrl = (item) => {
    if (item.attachmentType === 'url') return item.linkUrl;
    if (item.attachmentType === 'pdf') return item.document?.url;
    if (item.attachmentType === 'image') return item.photo?.url;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (attachmentType === 'url' && !linkUrl.trim()) {
      setError('Please enter a URL link.');
      return;
    }

    if (attachmentType === 'image' && !photo) {
      if (!editingId) {
        setError('Please select an image to upload.');
        return;
      }
      const existing = flashItems.find(item => item.id === editingId);
      if (!existing?.photo?.url) {
        setError('Please select an image to upload.');
        return;
      }
    }

    if (attachmentType === 'pdf' && !pdfDoc) {
      if (!editingId) {
        setError('Please select a PDF to upload.');
        return;
      }
      const existing = flashItems.find(item => item.id === editingId);
      if (!existing?.document?.url) {
        setError('Please select a PDF to upload.');
        return;
      }
    }

    setSaving(true);

    try {
      let photoURL = '';
      let photoPath = '';
      let pdfURL = '';
      let pdfName = '';
      let pdfPath = '';

      if (attachmentType === 'image' && photo) {
        const photoData = await uploadPhoto(photo, 'notifications/');
        photoURL = typeof photoData === 'string' ? photoData : photoData.url;
        photoPath = typeof photoData === 'string' ? '' : photoData.path;
      } else if (attachmentType === 'pdf' && pdfDoc) {
        const uploadedPdf = await uploadPhoto(pdfDoc, 'noti_doc/');
        pdfURL = typeof uploadedPdf === 'string' ? uploadedPdf : uploadedPdf.url;
        pdfPath = typeof uploadedPdf === 'string' ? '' : uploadedPdf.path;
        pdfName = pdfDoc.name;
      }

      const endpoint = editingId ? '/api/update-flash' : '/api/add-flash';
      const body = {
        title: title.trim(),
        attachmentType,
        linkUrl: attachmentType === 'url' ? linkUrl.trim() : '',
        photoURL,
        photoPath,
        pdfURL,
        pdfName,
        pdfPath,
      };

      if (editingId) {
        body.flashId = editingId;
        const existing = flashItems.find(item => item.id === editingId);
        body.oldPhotoPath = existing?.photo?.path || '';
        body.oldDocumentPath = existing?.document?.path || '';
        body.oldAttachmentType = existing?.attachmentType || 'none';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save flash item.');
      }

      resetForm();
      await fetchFlashItems();
      if (onFlashUpdated) onFlashUpdated();
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
      const response = await fetch(`${API_BASE_URL}/api/delete-flash`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashId: deleteTarget.id,
          photoPath: deleteTarget.photo?.path,
          documentPath: deleteTarget.document?.path,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete flash item.');
      }

      if (editingId === deleteTarget.id) {
        resetForm();
      }
      setDeleteTarget(null);
      await fetchFlashItems();
      if (onFlashUpdated) onFlashUpdated();
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
        <div className="modal-content manage-flash-modal">
          <button className="close-modal-btn" onClick={onClose}>&times;</button>
          <h2 className="modal-title">Add / Delete / Update Flash</h2>
          {(error || uploadError) && <div className="error-message">{error || uploadError.message}</div>}

          <div className="flash-manage-layout">
            <section className="flash-manage-list">
              <h3>Existing Flash Items</h3>
              {loadingList ? (
                <LoadingUI text="Loading flash items" variant="inline" size="sm" />
              ) : flashItems.length > 0 ? (
                <ul className="flash-manage-items">
                  {flashItems.map(item => (
                    <li key={item.id} className={`flash-manage-item${editingId === item.id ? ' editing' : ''}`}>
                      <div className="flash-manage-item-info">
                        <span className="flash-manage-item-title">{item.title}</span>
                        {item.attachmentType && item.attachmentType !== 'none' && (
                          <span className="flash-manage-item-type">{item.attachmentType.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flash-manage-item-actions">
                        <button type="button" className="flash-edit-btn" onClick={() => startEdit(item)}>Edit</button>
                        <button type="button" className="delete-notification-btn" onClick={() => setDeleteTarget(item)}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flash-manage-empty">No flash items yet.</p>
              )}
            </section>

            <section className="flash-manage-form-section">
              <h3>{editingId ? 'Update Flash Item' : 'Add New Flash Item'}</h3>
              <form onSubmit={handleSubmit} className="add-blog-form">
                <div className="form-group">
                  <label htmlFor="flashTitle">Title ({getWordCount(title)}/{TITLE_WORD_LIMIT} words)</label>
                  <input
                    id="flashTitle"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    required
                    placeholder="Enter flash title (max 30 words)"
                  />
                </div>

                <div className="form-group">
                  <label>Attachment (choose exactly one)</label>
                  <div className="flash-attachment-options">
                    <label className="flash-attachment-option">
                      <input
                        type="radio"
                        name="attachmentType"
                        value="image"
                        checked={attachmentType === 'image'}
                        onChange={() => handleAttachmentTypeChange('image')}
                      />
                      Image
                    </label>
                    <label className="flash-attachment-option">
                      <input
                        type="radio"
                        name="attachmentType"
                        value="pdf"
                        checked={attachmentType === 'pdf'}
                        onChange={() => handleAttachmentTypeChange('pdf')}
                      />
                      PDF
                    </label>
                    <label className="flash-attachment-option">
                      <input
                        type="radio"
                        name="attachmentType"
                        value="url"
                        checked={attachmentType === 'url'}
                        onChange={() => handleAttachmentTypeChange('url')}
                      />
                      URL Link
                    </label>
                  </div>
                </div>

                {attachmentType === 'image' && (
                  <div className="form-group">
                    <label htmlFor="flashPhoto">Image</label>
                    <input id="flashPhoto" type="file" accept="image/*" onChange={handlePhotoChange} />
                    {editingId && !photo && (
                      <p className="flash-current-file">
                        Current: {getAttachmentUrl(flashItems.find(i => i.id === editingId)) ? 'Image attached' : 'No image'}
                      </p>
                    )}
                  </div>
                )}

                {attachmentType === 'pdf' && (
                  <div className="form-group">
                    <label htmlFor="flashPdf">PDF Document</label>
                    <input id="flashPdf" type="file" accept="application/pdf,.pdf" onChange={handlePdfChange} />
                    {editingId && !pdfDoc && (
                      <p className="flash-current-file">
                        Current: {flashItems.find(i => i.id === editingId)?.document?.name || 'No PDF'}
                      </p>
                    )}
                  </div>
                )}

                {attachmentType === 'url' && (
                  <div className="form-group">
                    <label htmlFor="flashLinkUrl">URL Link</label>
                    <input
                      id="flashLinkUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                )}

                {uploading && (
                  <LoadingUI text="Uploading file" detail={`${progress.toFixed(0)}% complete`} progress={progress} variant="card" size="sm" />
                )}

                <div className="modal-actions">
                  {editingId && (
                    <button type="button" className="modal-button modal-secondary-btn" onClick={resetForm} disabled={isLoading}>
                      Cancel Edit
                    </button>
                  )}
                  <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={isLoading}>
                    Close
                  </button>
                  <button type="submit" className="modal-button modal-primary-btn" disabled={isLoading}>
                    {isLoading ? <><span className="spinner"></span> Saving...</> : editingId ? 'Save Changes' : 'Save Flash'}
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
        loadingText="Deleting flash item..."
      >
        <p>Are you sure you want to permanently delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.</p>
      </ConfirmModal>
    </>,
    document.body
  );
};

export default ManageFlashModal;
