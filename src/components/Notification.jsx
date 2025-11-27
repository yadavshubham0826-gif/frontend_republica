import React, { useEffect } from 'react';
import '../styles/Notification.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    // Automatically close the notification after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    // Cleanup the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`notification ${type}`}>
      <p>{message}</p>
      <button onClick={onClose} className="close-btn">&times;</button>
    </div>
  );
};

export default Notification;