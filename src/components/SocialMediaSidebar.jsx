import React from 'react';
import '../styles/SocialMediaSidebar.css';

const SocialMediaSidebar = () => {
  return (
    <div className="social-media-sidebar">

      {/* LinkedIn */}
      <a
        href="https://in.linkedin.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn Profile"
        className="linkedin-icon"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          className="social-icon"
        >
          <path d="M20.447 20.452H16.89v-5.396c0-1.287-.026-2.944-1.796-2.944-1.797 0-2.071 1.402-2.071 2.851v5.489H9.465V9h3.41v1.561h.049c.476-.9 1.637-1.85 3.368-1.85 3.598 0 4.264 2.37 4.264 5.455v6.286zM5.337 7.433a1.988 1.988 0 1 1 0-3.975 1.988 1.988 0 0 1 0 3.975zM7.119 20.452H3.553V9h3.566v11.452z"/>
        </svg>
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook Profile"
        className="facebook-icon"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          className="social-icon"
        >
          <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H8.1V12h2.4V9.8c0-2.37 1.4-3.68 3.55-3.68 1.03 0 2.1.18 2.1.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46V12h2.59l-.41 2.88h-2.18v6.99A10 10 0 0 0 22 12"/>
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram Profile"
        className="instagram-icon"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          className="social-icon"
        >
          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7.2A2.7 2.7 0 1 1 14.7 12 2.7 2.7 0 0 1 12 14.7zM17.8 6.2a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z"/>
        </svg>
      </a>

    </div>
  );
};

export default SocialMediaSidebar;
