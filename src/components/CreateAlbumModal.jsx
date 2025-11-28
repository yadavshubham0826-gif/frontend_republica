import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any'; // Import the conversion library

const CreateAlbumModal = ({ isOpen, onClose, onAlbumCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // ✅ Add description state
  const [coverPhoto, setCoverPhoto] = useState(null); // State for the file
  const [coverPreview, setCoverPreview] = useState(null); // State for the image preview URL
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

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
      // Convert cover photo file to base64 to send to backend
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      const coverPhotoBase64 = await toBase64(coverPhoto);

      // Call the secure backend API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-album`, {
        method: 'POST',
        credentials: 'include', // <-- ADD THIS LINE
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description, // ✅ Send description
          coverPhotoBase64: coverPhotoBase64,
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
      setError(err.message || 'Failed to create album. Please try again.');
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

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-button modal-secondary-btn" onClick={onClose} disabled={isCreating}>
              Cancel
            </button>
            <button type="submit" className="modal-button modal-primary-btn" disabled={isCreating}>
              {isCreating ? <><span className="spinner"></span> Creating...</> : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}; // ✅ FIX: Added the missing closing brace for the component function

export default CreateAlbumModal