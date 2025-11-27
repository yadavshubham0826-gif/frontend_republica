import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/AddPhotosModal.css';

const AddPhotosModal = ({ isOpen, onClose, onUploadComplete, initialAlbum }) => {
  // State for the overall modal
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // State for 'add photos' view
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  // State for 'create' view
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState(''); // New state for album description
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Fetch albums and set initial state when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all states when modal opens
      setError('');
      setFiles([]);
      setPreviews([]);
      setNewAlbumTitle('');
      setNewAlbumDescription(''); // Reset description
      setCoverPhoto(null);
      setCoverPreview(null);
      setIsProcessing(false);

      // If the modal is opened to add photos to an existing album
      if (initialAlbum) {
        setSelectedAlbum(initialAlbum);
      }
    }
  }, [isOpen, initialAlbum]);

  // Effect for multi-file previews
  useEffect(() => {
    const newPreviews = files.map(file => ({
      ...file, preview: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
    return () => newPreviews.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  // Effect for single cover photo preview
  useEffect(() => {
    if (coverPhoto) {
      const url = URL.createObjectURL(coverPhoto);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverPhoto]);

  const onAddPhotosDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, { id: Math.random().toString(36).substring(2, 9) }))]);
    setError('');
  }, []);

  const onCreateCoverDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) setCoverPhoto(acceptedFiles[0]);
  }, []);

  const { getRootProps: addPhotosProps, getInputProps: addPhotosInputProps, isDragActive: addPhotosActive } = useDropzone({
    onDrop: onAddPhotosDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }
  });

  const { getRootProps: createCoverProps, getInputProps: createCoverInputProps, isDragActive: createCoverActive } = useDropzone({
    onDrop: onCreateCoverDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: 1
  });

  const handleDescriptionChange = (e) => {
    const text = e.target.value;    
    if (text.length > 250) {
      // If the limit is exceeded, truncate the text to 250 characters
      setNewAlbumDescription(text.slice(0, 250));
    } else {
      setNewAlbumDescription(text);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return setError('Please select at least one photo.');
    if (!selectedAlbum) return setError('No album selected for upload.');

    setIsProcessing(true);
    setError('');

    try {
      for (const file of files) {
        const photoBase64 = await toBase64(file);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/add-photos-to-album`, {
          method: 'POST',
          credentials: 'include', // <-- ADD THIS LINE
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            albumId: selectedAlbum.id,
            albumTitle: selectedAlbum.title,
            photoBase64,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          // Stop on first error
          throw new Error(result.error || `Failed to upload ${file.name}.`);
        }
      }
      
      if (onUploadComplete) onUploadComplete();
      onClose();
    } catch (err) {
      console.error("Error uploading photos:", err);
      setError(err.message || 'Failed to upload photos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) return setError('Album title is required.');
    if (!newAlbumDescription.trim()) return setError('Album description is required.'); // Validate description
    if (!coverPhoto) return setError('A cover photo is required.');
    setIsProcessing(true); setError('');
    try {
      const coverPhotoBase64 = await toBase64(coverPhoto);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-album`, {
        method: 'POST',
        credentials: 'include', // <-- ADD THIS LINE
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAlbumTitle,
          description: newAlbumDescription,
          coverPhotoBase64,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create album.');
      }

      if (onUploadComplete) onUploadComplete();
      onClose();
    } catch (err) {
      console.error("Error creating album:", err);
      setError(err.message || 'Failed to create album.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to convert file to base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content add-photos-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        
        {/* If initialAlbum is passed, show the 'Add Photos' UI */}
        {initialAlbum ? (
          <>
            <h2>Add Photos to "{initialAlbum.title}"</h2>
            <div {...addPhotosProps({ className: `dropzone ${addPhotosActive ? 'active' : ''}` })}>
              <input {...addPhotosInputProps()} />
              <p>Drag 'n' drop photos here, or click to select files</p>
            </div>
            {previews.length > 0 && (
              <div className="previews-container">
                {previews.map(file => (
                  <div key={file.id} className="preview-item">
                    <img src={file.preview} alt="Preview" />
                    <button onClick={() => setFiles(files.filter(f => f.id !== file.id))}>&times;</button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="modal-button modal-primary-btn" onClick={handleUpload} disabled={isProcessing || files.length === 0}>
                {isProcessing ? <><span className="spinner"></span> Uploading...</> : 'Upload Photos'}
              </button>
            </div>
          </>
        ) : (
          // Otherwise, show the 'Create New Album' UI
          <>
            <h2>Create New Album</h2>
            <div className="form-group"><label htmlFor="albumTitle">Album Title</label><input type="text" id="albumTitle" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} placeholder="e.g., Fresher's Party 2025" required /></div>
            <div className="form-group">
              <label htmlFor="albumDescription">Album Description</label>
              <textarea id="albumDescription" value={newAlbumDescription} onChange={handleDescriptionChange} placeholder="Briefly describe this album..." rows="3" required></textarea>
              <small className="word-counter">{250 - newAlbumDescription.length} characters remaining</small>
            </div>
            <div className="form-group"><label>Cover Photo</label>
              <div {...createCoverProps({ className: `dropzone ${createCoverActive ? 'active' : ''}` })}>
                <input {...createCoverInputProps()} />
                {coverPreview ? <img src={coverPreview} alt="Cover preview" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} /> : <p>Drag & drop a cover photo here</p>}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-button modal-primary-btn" onClick={handleCreateAlbum} disabled={isProcessing || !newAlbumTitle || !coverPhoto}>
                {isProcessing ? <><span className="spinner"></span> Creating...</> : 'Create Album'}
              </button>
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default AddPhotosModal;
