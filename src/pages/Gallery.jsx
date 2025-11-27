import React, { useEffect, useRef, useState } from 'react';
import Notification from '../components/Notification';
import { Link } from 'react-router-dom';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useUser } from '../context/UserContext';
import { useColorPalette } from '../context/ColorContext.jsx';
import ConfirmModal from '../components/ConfirmModal'; // For deletion confirmation
import '../styles/style.css';
import { db } from '../firebase-config.js'; // Import Firestore instance
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions
import '../styles/Gallery.css';

const Gallery = () => {
  const mainRef = useRef(null);
  useHeaderOffset();

  const { user } = useUser();
  const isUserAdmin = user && user.role === 'admin';
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  const [showNotification, setShowNotification] = useState(false);

  const { palette, loading } = useColorPalette();
  const { gradient } = palette; // shared gradient from context

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.getBoundingClientRect().height : 80;
          const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoadingAlbums(true);
      try {
        // Fetch albums directly from Firestore
        const albumsCollection = collection(db, 'photoAlbums');
        const q = query(albumsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedAlbums = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlbums(fetchedAlbums);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoadingAlbums(false);
      }
    };
    fetchAlbums();
  }, []);

  const handleDeleteClick = (album) => {
    setAlbumToDelete(album);
    setIsDeleteModalOpen(true);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationMessage('');
  };

  // ----------------------------
  // Updated: Delete via backend
  // ----------------------------
  const handleConfirmDelete = async () => {
    if (!albumToDelete || !user) return;

    try {
      // Call your server API instead of Firebase Function
      const response = await fetch('https://republicadrcdu.vercel.app/api/delete-album', {
        credentials: 'include', // <-- Add credentials to authenticate the admin
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: albumToDelete.id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotificationMessage('Album and all assets deleted successfully!');
        setNotificationType('success');
        setShowNotification(true);

        // Update UI
        setAlbums(prevAlbums => prevAlbums.filter(album => album.id !== albumToDelete.id));
      } else {
        throw new Error(result.error || 'Server deletion failed.');
      }

    } catch (error) {
      console.error("Error deleting album:", error);
      setNotificationMessage(`Error deleting album: ${error.message}`);
      setNotificationType('error');
      setShowNotification(true);
    } finally {
      setIsDeleteModalOpen(false);
      setAlbumToDelete(null);
    }
  };

  if (loading) return <p>Loading gradient...</p>;

  return (
    <main id="main-content" ref={mainRef}>
      <section className="page-hero gallery-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <FadeInSection>
            <h1>Our Event Gallery</h1>
            <p>Explore moments from our past events, workshops, and gatherings. This page showcases a comprehensive collection of our society's activities.</p>
          </FadeInSection>
        </div>
      </section>

      <section id="gallery-full" className="section">
        <div className="container">
          {loadingAlbums ? (
            <p style={{ textAlign: 'center' }}>Loading albums...</p>
          ) : albums.length === 0 ? (
            <div className="card text-center">
              <p className="coming-soon-text">No photo albums have been added yet.</p>
            </div>
          ) : (
            <div className="grid three gallery-grid">
              {albums.map((album, idx) => (
                <FadeInSection key={album.id} delay={0.1 + idx * 0.1}>
                  <div className="album-card-wrapper">
                    <Link to={`/gallery/album/${album.id}`} className="album-card">
                      <img
                        src={album.coverPhoto?.url || album.coverPhotoUrl}
                        alt={`Cover for ${album.title}`}
                        className="album-card-image"
                      />
                      <div className="album-card-overlay">
                        <h3 className="album-title">{album.title}</h3>
                        <p className="album-description">{album.description}</p>
                      </div>
                      {isUserAdmin && (
                        <button
                          className="delete-album-button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(album);
                          }}
                        >&#x1F5D1;</button>
                      )}
                    </Link>
                  </div>
                </FadeInSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Album Deletion"
        confirmText="Delete"
      >
        <p>Are you sure you want to permanently delete the album "<strong>{albumToDelete?.title}</strong>"?</p>
        <p>This will delete the album and all of its photos. This action cannot be undone.</p>
      </ConfirmModal>

      {showNotification && (
        <Notification
          message={notificationMessage}
          type={notificationType}
          onClose={handleCloseNotification}
        />
      )}
    </main>
  );
};

export default Gallery;
