import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any'; // Import the conversion library
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';

const CreateAlbumModal = ({ isOpen, onClose, onAlbumCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // ✅ Add description state
  const [coverPhoto, setCoverPhoto] = useState(null); // State for the file
  const [coverPreview, setCoverPreview] = useState(null); // State for the image preview URL
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const {
    uploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = useFirebasePhotoUploader();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      let fileToProcess = acceptedFiles[0];
      setError('');
      setIsCreating(true); // Show a processing state

      const fileName = fileToProcess.name.toLowerCase();

      // Check if the file is a HEIC/HEIF image
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        try {
          // Convert it to JPEG
          const convertedBlob = await heic2any({
            blob: fileToProcess,
            toType: 'image/jpeg',
            quality: 0.8, // Adjust quality as needed
          });

          // Create a new File object from the converted blob
          fileToProcess = new File([convertedBlob], `${fileName.split('.')[0]}.jpg`, {
            type: 'image/jpeg',
            lastModified: new Date().getTime(),
          });
        } catch (conversionError) {
          console.error('Error converting HEIC file:', conversionError);
          setError(`Failed to convert ${fileToProcess.name}. Please try a different file.`);
          setIsCreating(false);
          return; // Stop processing
        }
      }

      setCoverPhoto(fileToProcess);
      setCoverPreview(URL.createObjectURL(fileToProcess)); // Create a temporary URL for preview
      setIsCreating(false); // Done processing
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif'] }, // ✅ Accept HEIC/HEIF
    maxFiles: 1, // Only allow one cover photo
  });

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Album title cannot be empty.');
      return;
    }
    if (!coverPhoto) {
      setError('Please select a cover photo.');
      return;
    }
    if (!description.trim()) { // ✅ Validate description
      setError('Album description cannot be empty.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Upload cover photo to Firebase Storage first (handle both old format string and new format object)
      const coverPhotoData = await uploadPhoto(coverPhoto, 'album_covers/');
      const coverPhotoURL = typeof coverPhotoData === 'string' ? coverPhotoData : coverPhotoData.url;

      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      if (!apiUrl) {
        throw new Error('API server URL is not configured. Please check your environment variables.');
      }

      // Call the secure backend API with Firebase Storage URL
      const response = await fetch(`${apiUrl}/api/create-album`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          coverPhotoURL: coverPhotoURL, // Send Firebase Storage URL instead of base64
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create album.');
      }

      if (onAlbumCreated) {
        onAlbumCreated(); // Refresh the gallery page
      }
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Error creating album:", err);
      let errorMessage = err.message || 'Failed to create album. Please try again.';
      
      // Provide user-friendly error messages
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const isLocalhost = apiUrl && apiUrl.includes('localhost');
        if (isLocalhost) {
          errorMessage = 'Cannot connect to the local server. Please make sure the backend server is running on ' + apiUrl;
        } else {
          errorMessage = 'Cannot connect to the server. Please check your internet connection and try again.';
        }
      }
      
      setError(errorMessage);
      setIsCreating(false);
    }
  };

  // Do not render anything if the modal is not supposed to be open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Create New Album</h2>
        
        <form onSubmit={handleCreateAlbum}>
          <div className="form-group">
            <label htmlFor="albumTitle">Album Title</label>
            <input
              type="text"
              id="albumTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fresher's Party 2025"
              required
            />
          </div>

          <div className="form-group"> {/* ✅ Add Description Field */}
            <label htmlFor="albumDescription">Album Description</label>
            <textarea
              id="albumDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this album..."
              rows="3"
              required
            ></textarea>
          </div>
          <div className="form-group"> {/* Cover Photo Dropzone */}
            <label>Cover Photo</label>
            <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
              <input {...getInputProps()} />
              {coverPreview ? ( // If there's a preview, show the image
                <img 
                  src={coverPreview} 
                  alt="Cover preview" 
                  style={{ 
                    maxHeight: '150px', 
                    borderRadius: '8px', 
                    objectFit: 'contain'
                  }} 
                />
              ) : ( // Otherwise, show the prompt text
                <p>Drag & drop a cover photo here, or click to select one</p>
              )}
            </div>
          </div>

          {uploading && (
            <div className="progress-bar-container">
              <p>Uploading cover photo... {progress.toFixed(0)}%</p>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          {uploadError && <p className="error-message">{uploadError.message}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={isCreating || uploading}>
              Cancel
            </button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={isCreating || uploading || !title || !coverPhoto || !description}>
              {isCreating || uploading ? <><span className="spinner"></span> {uploading ? 'Uploading...' : 'Creating...'}</> : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}; // ✅ FIX: Added the missing closing brace for the component function

export default CreateAlbumModal