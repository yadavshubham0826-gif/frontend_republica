import React, { useState, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useColorPalette } from '../context/ColorContext.jsx';
import { useUser } from '../context/UserContext';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/style.css';
import { db } from '../firebase-config.js'; // Import Firestore instance
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions

function Notifications() {
  const { palette, loading: paletteLoading } = useColorPalette();
  const gradient = palette.gradient;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();
  const isUserAdmin = user && user.role === 'admin';

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch notifications directly from Firestore
        const notificationsCollection = collection(db, 'notifications');
        const q = query(notificationsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          // Convert Firestore Timestamp to a readable string
          const createdAtString = docData.createdAt?.toDate 
            ? docData.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Date not available';

          return { id: doc.id, ...docData, createdAt: createdAtString };
        });

        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const openDeleteConfirm = (notification) => {
    setNotificationToDelete(notification);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    setDeleteLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-notification`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notificationToDelete.id,
          photoPublicId: notificationToDelete.photo?.public_id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete notification.');
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
      setIsConfirmOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (paletteLoading) return <p>Loading...</p>;

  return (
    <main id="main-content">
      {/* Removed any glass effect */}
      <section className="page-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <FadeInSection>
            <h1>Notifications</h1>
            <p>
              Stay updated with the latest announcements, news, and important information from the department.
            </p>
          </FadeInSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <p>Loading notifications...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <FadeInSection key={notification.id} className="notification-card">
                    <div className="notification-inner-content">
                      <div className="notification-text-content">
                        <div className="notification-header">
                          <h3 className="notification-title">{notification.title}</h3>
                          <span className="notification-date">{notification.createdAt}</span>
                        </div>
                        <p className="notification-content">{notification.content}</p>
                        {notification.linkUrl && notification.linkName && (
                          <a href={notification.linkUrl} target="_blank" rel="noopener noreferrer" className="btn notification-link-btn">
                            {notification.linkName}
                          </a>
                        )}
                      </div>
                      <div className="notification-media-content">
                        {notification.photo && (
                          <div className="notification-photo-container">
                            <img src={notification.photo.url} alt={notification.title} className="notification-photo" />
                          </div>
                        )}
                        {isUserAdmin && (
                          <div className="notification-actions">
                            <button onClick={() => openDeleteConfirm(notification)} className="delete-notification-btn">Delete</button>
                          </div>
                        )}
                        </div>
                    </div>
                  </FadeInSection>
                ))
              ) : (<p>No notifications found.</p>)}
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
      >
        <p>Are you sure you want to permanently delete this notification? This action cannot be undone.</p>
      </ConfirmModal>
    </main>
  );
}

export default Notifications;
