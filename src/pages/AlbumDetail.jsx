import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useUser } from '../context/UserContext'; // Import useUser for admin check
import FadeInSection from '../components/FadeInSection';
import ConfirmModal from '../components/ConfirmModal'; // Import ConfirmModal
import LoadingUI from '../components/LoadingUI';
import { createFailurePath } from '../utils/failureRoute';
import { db } from '../firebase-config.js'; // Import Firestore instance
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'; // Import Firestore functions
// Assuming you have created this modal component
import AddPhotosModal from '../components/AddPhotosModal'; 
import '../styles/style.css'; // Correct path to the consolidated stylesheet
import 'react-photo-view/dist/react-photo-view.css';
import '../styles/AlbumDetail.css';

const AlbumDetail = () => {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Authentication for Admin ---
  const { user } = useUser();
  const isAdmin = user && user.role === 'admin';

  const fetchAlbum = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch a single album directly from Firestore
      const albumRef = doc(db, 'photoAlbums', albumId);
      const docSnap = await getDoc(albumRef);
      if (docSnap.exists()) {
        setAlbum({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Album not found.');
      }
    } catch (err) {
      console.error("Error fetching album details:", err);
      setError('Failed to load the album.');
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  // Fetch album details from Firestore
  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    if (!imageToDelete) return;

    // Check if API URL is configured (define outside try block for error handling)
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      setError('API server URL is not configured. Please check your environment variables.');
      setShowDeleteModal(false);
      setImageToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Check if image has a path property (required for Firebase Storage)
      if (!imageToDelete.path) {
        throw new Error('Image path is missing. Cannot delete image.');
      }

      // The entire deletion logic is now on the backend
      const response = await fetch(`${apiUrl}/api/delete-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: imageToDelete.path, // Send path instead of public_id
          albumId: albumId,
          image: imageToDelete, // Send the full image object for arrayRemove
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || 'Failed to delete image.');
      }

      // Refresh album from Firestore to reflect the deletion
      fetchAlbum();

    } catch (err) {
      console.error("Error deleting image:", err);
      
      // Provide user-friendly error messages for different scenarios
      let errorMessage = 'Failed to delete image. ';
      
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
      setIsDeleting(false);
      setShowDeleteModal(false);
      setImageToDelete(null);
    }
  };

  // Render loading or error message
  if (loading) {
    return <LoadingUI text="Loading album" detail="Opening this gallery collection." variant="page" />;
  }

  if (error) {
    return <Navigate to={createFailurePath(error)} replace />;
  }


  return (
    <main id="main-content" style={{ paddingTop: '120px' }}>
      <>
        <section className="section">
          <div className="container">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0 }}>{album.title}</h1>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {isAdmin && album && ( // Only show if album exists and user is admin
                  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    + Add Photos to Album
                  </button>
                )}
                <Link to="/gallery" className="btn">← Back to Gallery</Link>
              </div>
            </div>

            {/* Render the image gallery */}
            <PhotoProvider
              speed={() => 800}
              easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
              maskOpacity={0.9}
              bannerVisible={true} // Show the default top banner which includes close and image count
              pullClosable={true}
              maskClosable={true}
            >
              <div className="grid two gallery-grid">
                {album.imageUrls && album.imageUrls.map((image, index) => (
                  <FadeInSection key={image.path || image.url || index} delay={0.1 + index * 0.05}>
                    <div className="gallery-item-wrapper">
                      <div className="card gallery-item" style={{ cursor: 'pointer' }}>
                        <PhotoView src={image.url}>
                          <img
                            src={image.url}
                            alt={`Album photo ${index + 1}`}
                          />
                        </PhotoView>
                        {isAdmin && (
                          <button 
                            className="delete-photo-btn" 
                            onClick={() => handleDeleteClick(image)}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </PhotoProvider>
          </div>
        </section>

        {/* Add Photos Modal */}
        {isModalOpen && (
          <AddPhotosModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialAlbum={album} // Pass the entire album object
            onUploadComplete={fetchAlbum} // Re-fetch album data on completion
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={onConfirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          loading={isDeleting}
          loadingText="Deleting photo..."
        >
          <p>Are you sure you want to delete this photo?</p>
        </ConfirmModal>
      </>
    </main>
  );
};

export default AlbumDetail;
