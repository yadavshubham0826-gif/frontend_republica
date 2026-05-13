import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';
import LoadingUI from './LoadingUI';
import '../styles/AddPhotosModal.css';

const AddPhotosModal = ({ isOpen, onClose, onUploadComplete, initialAlbum }) => {
  // State for the overall modal
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for 'add photos' view
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // State for 'create' view
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    uploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = useFirebasePhotoUploader();

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setFiles([]);
      setPreviews([]);
      setNewAlbumTitle('');
      setNewAlbumDescription('');
      setCoverPhoto(null);
      setCoverPreview(null);
      setIsSubmitting(false);

      if (initialAlbum) {
        setSelectedAlbum(initialAlbum);
      }
    }
  }, [isOpen, initialAlbum]);

  // Create/revoke object URLs for previews
  useEffect(() => {
    const newPreviews = files.map(file => ({
      ...file,
      preview: URL.createObjectURL(file),
    }));
    setPreviews(newPreviews);
    return () => newPreviews.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  useEffect(() => {
    if (coverPhoto) {
      const url = URL.createObjectURL(coverPhoto);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverPhoto]);

  // Dropzone callbacks
  const onAddPhotosDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, { id: Math.random().toString(36).substring(2, 9) }))]);
    setError('');
  }, []);

  const onCreateCoverDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) setCoverPhoto(acceptedFiles[0]);
  }, []);

  const { getRootProps: addPhotosProps, getInputProps: addPhotosInputProps, isDragActive: addPhotosActive } = useDropzone({
    onDrop: onAddPhotosDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
  });

  const { getRootProps: createCoverProps, getInputProps: createCoverInputProps, isDragActive: createCoverActive } = useDropzone({
    onDrop: onCreateCoverDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: 1,
  });

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    setNewAlbumDescription(text.slice(0, 250));
  };

  const handleUpload = async () => {
    if (files.length === 0) return setError('Please select at least one photo.');
    if (!selectedAlbum) return setError('No album selected for upload.');

    // Check if API URL is configured (define outside try block for error handling)
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      setError('API server URL is not configured. Please check your environment variables.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Upload all files in parallel and get their URLs and paths
      const photoData = await Promise.all(
        files.map(file => uploadPhoto(file, `albums/${selectedAlbum.id}/`))
      );

      // Extract URLs from the response (handle both old format string and new format object)
      const photoURLs = photoData.map(data => typeof data === 'string' ? data : data.url);

      // Send the URLs to the backend
      const response = await fetch(`${apiUrl}/api/add-photos-to-album`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId: selectedAlbum.id,
          photoURLs, // Send array of URLs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || 'Failed to add photos to album.');
      }

      const result = await response.json();

      if (onUploadComplete) onUploadComplete();
      onClose();
    } catch (err) {
      console.error("Error uploading photos:", err);
      
      // Provide user-friendly error messages for different scenarios
      let errorMessage = 'Failed to upload photos. ';
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Network error - could be connection refused, CORS, or network timeout
        const isLocalhost = apiUrl && apiUrl.includes('localhost');
        if (isLocalhost) {
          errorMessage += 'Cannot connect to the local server. Please make sure the backend server is running on ' + apiUrl;
        } else {
          errorMessage += 'Cannot connect to the server. Please check your internet connection and try again.';
        }
      } else if (err.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage += 'Connection refused. The server may be down or not accessible.';
      } else if (err.message.includes('API server URL')) {
        errorMessage += err.message;
      } else {
        errorMessage += err.message || 'An unexpected error occurred. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) return setError('Album title is required.');
    if (!newAlbumDescription.trim()) return setError('Album description is required.');
    if (!coverPhoto) return setError('A cover photo is required.');

    // Check if API URL is configured (define outside try block for error handling)
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      setError('API server URL is not configured. Please check your environment variables.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Upload cover photo and get URL (handle both old format string and new format object)
      const coverPhotoData = await uploadPhoto(coverPhoto, 'album_covers/');
      const coverPhotoURL = typeof coverPhotoData === 'string' ? coverPhotoData : coverPhotoData.url;

      // Send the URL to the backend
      const response = await fetch(`${apiUrl}/api/create-album`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAlbumTitle,
          description: newAlbumDescription,
          coverPhotoURL, // Send URL instead of base64
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || 'Failed to create album.');
      }

      const result = await response.json();
      
      if (onUploadComplete) onUploadComplete();
      onClose();
    } catch (err) {
      console.error("Error creating album:", err);
      
      // Provide user-friendly error messages for different scenarios
      let errorMessage = 'Failed to create album. ';
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        // Network error - could be connection refused, CORS, or network timeout
        const isLocalhost = apiUrl && apiUrl.includes('localhost');
        if (isLocalhost) {
          errorMessage += 'Cannot connect to the local server. Please make sure the backend server is running on ' + apiUrl;
        } else {
          errorMessage += 'Cannot connect to the server. Please check your internet connection and try again.';
        }
      } else if (err.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage += 'Connection refused. The server may be down or not accessible.';
      } else if (err.message.includes('API server URL')) {
        errorMessage += err.message;
      } else {
        errorMessage += err.message || 'An unexpected error occurred. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isOperationInProgress = uploading || isSubmitting;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content add-photos-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>

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
            {uploading && (
              <LoadingUI text="Uploading photos" detail={`${progress.toFixed(0)}% complete`} progress={progress} variant="card" size="sm" />
            )}
            <div className="modal-actions">
              <button className="modal-button modal-primary-btn" onClick={handleUpload} disabled={isOperationInProgress || files.length === 0}>
                {isOperationInProgress ? <><span className="spinner"></span> {uploading ? 'Uploading...' : 'Saving...'}</> : 'Upload Photos'}
              </button>
            </div>
          </>
        ) : (
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
             {uploading && (
              <LoadingUI text="Uploading cover photo" detail={`${progress.toFixed(0)}% complete`} progress={progress} variant="card" size="sm" />
            )}
            <div className="modal-actions">
              <button className="modal-button modal-primary-btn" onClick={handleCreateAlbum} disabled={isOperationInProgress || !newAlbumTitle || !coverPhoto}>
                {isOperationInProgress ? <><span className="spinner"></span> {uploading ? 'Uploading...' : 'Creating...'}</> : 'Create Album'}
              </button>
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
        {uploadError && <p className="error-message">{uploadError.message}</p>}
      </div>
    </div>
  );
};

export default AddPhotosModal;
