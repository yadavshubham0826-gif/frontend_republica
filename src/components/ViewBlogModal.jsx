import React from "react";
import DOMPurify from 'dompurify'; // Import the sanitizer
import "../styles/style.css"; // Reusing existing modal styles

const ViewBlogModal = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post) {
    return null;
  }

  // Stop propagation to prevent closing when clicking inside the content
  const handleContentClick = (e) => e.stopPropagation();

  return (
    // The `modal-backdrop` class will provide the dark overlay
    <div className="modal-backdrop" onClick={onClose}>
      {/* This button is now outside the scrollable content, so it remains fixed */}
      <button
        onClick={onClose}
        className="close-modal-btn"
        style={{
          position: 'fixed', // Fix position relative to the viewport
          top: '20px',
          left: '20px',
          zIndex: 1060, // Ensure it's above the modal content
          fontSize: '3rem', // Increased the size
          color: 'red', // Make it visible on the dark backdrop
          background: 'transparent',
          border: 'none'
        }}
      >
        &times;
      </button>

      <div 
        className="modal-content" 
        onClick={handleContentClick} 
        style={{ maxWidth: '950px' }} // No longer needs relative positioning for the button
      >
        <div className="blog-post-full-content">
          <h1>{post.title}</h1>
          <p className="muted" style={{ marginBottom: "2rem" }}>
            By {post.author} on {new Date(post.date).toLocaleDateString()}
          </p>
          {/* Render the full HTML content from the editor */}
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
        </div>
      </div>
    </div>
  );
};

export default ViewBlogModal;