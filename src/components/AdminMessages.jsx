import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ConfirmModal from './ConfirmModal';
import './AdminMessages.css';

const AdminMessages = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    // If user data has loaded and the user is not an admin, redirect to home.
    if (!userLoading && (!user || user.role !== 'admin')) {
      navigate('/');
      return;
    }

    // If user data has loaded but user is not an admin, stop loading.
    if (!userLoading && !user) {
      setLoading(false);
      return;
    }

    // Fetch messages if the user is an admin
    if (user && user.role === 'admin') {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages`, {
            credentials: 'include', // Important for sending session cookies
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch messages.');
          }
          const data = await response.json();
          setMessages(data);
        } catch (err) {
          console.error("Error fetching messages:", err);
          setError('Failed to load messages.');
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [user, userLoading, navigate]);

  const handleDeleteClick = (messageId) => {
    setMessageToDelete(messageId);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messageId: messageToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message.');
      }
      setMessages(messages.filter((msg) => msg.id !== messageToDelete));
    } catch (err) {
      console.error("Error deleting message:", err);
      setError('Failed to delete message.');
    } finally {
      setShowConfirmModal(false);
      setMessageToDelete(null);
    }
  };

  if (userLoading || loading) {
    return <div className="admin-messages-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="admin-messages-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <main id="main-content">
      <div className="admin-messages-container">
        <h1>Contact Messages</h1>
        <p>Here are the messages submitted through the contact form.</p>

        {messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <div className="messages-list">
            {messages.map(message => (
              <div key={message.id} className="message-card">
                <div className="message-header">
                  <div className="message-sender">
                    <strong>{message.name}</strong>
                    <span>({message.email})</span>
                  </div>
                  <div className="message-meta">
                    <span className="message-date">
                      {console.log("message.timestamp", message.timestamp)}
                      {console.log("message.createdAt", message.createdAt)}
                      {message.timestamp ? new Date(message.timestamp.seconds * 1000).toLocaleString() : (message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleString() : 'No date')}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(message.id)}
                      aria-label={`Delete message from ${message.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="message-body">{message.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
      >
        <p>Are you sure you want to delete this message? This action cannot be undone.</p>
      </ConfirmModal>
    </main>
  );
};

export default AdminMessages;