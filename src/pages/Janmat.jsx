import React, { useState, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useUser } from '../context/UserContext';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/style.css';
import { useColorPalette } from '../context/ColorContext.jsx';
import { db } from '../firebase-config.js'; // Import Firestore instance
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions

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

const Janmat = () => {
  const { user } = useUser();
  const isUserAdmin = user && user.role === 'admin';
  const [flipbooks, setFlipbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [flipbookToDelete, setFlipbookToDelete] = useState(null);

  const { palette, loading: paletteLoading } = useColorPalette();
  const gradient = palette.gradient;

  const fetchFlipbooks = async () => {
    try {
      setLoading(true);
      // Fetch flipbooks directly from Firestore
      const flipbooksCollection = collection(db, 'flipbooks');
      const q = query(flipbooksCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const flipbooksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setFlipbooks(flipbooksData);
      setError('');
    } catch (err) {
      console.error("Error fetching flipbooks:", err);
      setError("Failed to load flipbook editions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFlipbooks(); }, []);

  const handleDeleteClick = (flipbook) => {
    setFlipbookToDelete(flipbook);
    setIsDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!flipbookToDelete) return;

    try {
      // Call the new secure backend endpoint for deleting flipbooks
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-flipbook`, {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flipbookId: flipbookToDelete.id,
          coverPhotoPublicId: flipbookToDelete.coverPhoto?.public_id, // Send public_id for deletion
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete flipbook.');
      }

      setFlipbooks(prev => prev.filter(fb => fb.id !== flipbookToDelete.id));
    } catch (err) {
      setError("Failed to delete flipbook.");
    } finally {
      setIsDeleteModalOpen(false);
      setFlipbookToDelete(null);
    }
  };

  return (
    <>
      {paletteLoading ? (
        <p>Loading gradient...</p>
      ) : (
        <main id="main-content">
          <section className="page-hero" style={{ background: gradient }}>
            <div className="container narrow">
              <FadeInSection>
                <div className="text-center">
                  <h1>Janmat Editions</h1>
                  <p>Explore all the published editions of our newsletter, Janmat.</p>
                </div>
              </FadeInSection>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <FadeInSection>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Previous Issues</h2>
              </FadeInSection>
            </div>

            <FadeInSection>
              {loading && <p style={{ textAlign: 'center' }}>Loading editions...</p>}
              {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}
              {!loading && flipbooks.length === 0 && (
                <div className="container">
                  <div className="card text-center">
                    <p className="coming-soon-text">No editions have been published yet.</p>
                  </div>
                </div>
              )}
              {!loading && flipbooks.length > 0 && (
                <div className="grid four" style={{ padding: '0 20px' }}>
                  {flipbooks.map(flipbook => (
                    <a
                      href={flipbook.flipbookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={flipbook.id}
                      className="card"
                      style={{ padding: 0, position: 'relative', height: '400px', overflow: 'hidden', backgroundColor: '#f1f5f9', borderRadius: 0 }}
                    >
                      {isUserAdmin && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(flipbook);
                          }}
                          style={{
                            position: 'absolute', top: '10px', right: '10px', zIndex: 2,
                            background: 'rgba(255, 0, 0, 0.7)', color: 'white', border: 'none',
                            borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', lineHeight: '1', paddingBottom: '2px'
                          }}
                          aria-label="Delete flipbook"
                        >
                          &times;
                        </button>
                      )}
                      <img
                        src={flipbook.coverPhoto?.url || flipbook.coverPhotoUrl || 'https://via.placeholder.com/400x500/e2e8f0/334155?text=Janmat'}
                        alt={`Cover for Janmat ${flipbook.publishingYear}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Janmat - {flipbook.publishingYear}</h3>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </FadeInSection>
          </section>

          {isUserAdmin && (
            <ConfirmModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={onConfirmDelete}
              title="Confirm Deletion"
              confirmText="Delete"
            >
              <p>Are you sure you want to delete the flipbook for the year <strong>{flipbookToDelete?.publishingYear}</strong>? This action cannot be undone.</p>
            </ConfirmModal>
          )}
        </main>
      )}
    </>
  );
};

export default Janmat;
