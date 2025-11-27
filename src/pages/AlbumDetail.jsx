import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useUser } from '../context/UserContext'; // Import useUser for admin check
import FadeInSection from '../components/FadeInSection';
import { db } from '../firebase-config.js'; // Import Firestore instance
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
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

  // Render loading or error message
  if (loading) {
    return <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>Loading album...</div>;
  }

  if (error) {
    return <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>{error}</div>;
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
                  <FadeInSection key={image.public_id || index} delay={0.1 + index * 0.05}>
                    <div className="gallery-item-wrapper">
                      <div className="card gallery-item" style={{ cursor: 'pointer' }}>
                        <PhotoView src={image.url}>
                          <img
                            src={image.url}
                            alt={`Album photo ${index + 1}`}
                          />
                        </PhotoView>
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
      </>
    </main>
  );
};

export default AlbumDetail;
