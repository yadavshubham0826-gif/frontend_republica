import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import LoginModal from './LoginModal';
import EmailSignupModal from './EmailSignupModal';
import { useUser } from '../context/UserContext';
import { useModal } from '../context/ModalContext';

import ConfirmModal from './ConfirmModal';
import '../styles/style.css';
// Import Admin Modals
import AddBlogModal from './AddBlogModal';
import AddFlipbookModal from './AddFlipbookModal';
import AddNewsletterModal from './AddNewsletterModal';
import AddPhotosModal from './AddPhotosModal'; // The only photo modal we need
import AddNotificationModal from './AddNotificationModal';
import { db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { showLogin, setShowLogin, showSignup, setShowSignup } = useModal();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAcademicsDropdownOpen, setIsAcademicsDropdownOpen] = useState(false);
  const [isJanmatDropdownOpen, setIsJanmatDropdownOpen] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [showAddFlipbookModal, setShowAddFlipbookModal] = useState(false);
  const [showAddNewsletterModal, setShowAddNewsletterModal] = useState(false);
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [showAddNotificationModal, setShowAddNotificationModal] = useState(false);
  const [newsletterToEdit, setNewsletterToEdit] = useState(null);
  const [latestJanmatName, setLatestJanmatName] = useState("Janmat'25");

  const { user, logout, isAuthenticated } = useUser();
  const isUserAdmin = user && user.role === 'admin'; // <-- New admin check
  const username = user?.name || user?.displayName || 'User';
  const userDropdownRef = useRef(null);
  const academicsDropdownRef = useRef(null); // Ref for Academics dropdown
  const janmatDropdownRef = useRef(null); // Ref for Janmat dropdown

  const fetchLatestJanmatName = async () => {
    try {
      const newsletterRef = doc(db, 'latestNewsletter', 'current');
      const docSnap = await getDoc(newsletterRef);
      if (docSnap.exists()) {
        setLatestJanmatName(docSnap.data().name || "Janmat'25");
      }
    } catch (error) {
      console.error("Error fetching latest Janmat name:", error);
    }
  };

  // Fetch latest newsletter name on component mount
  useEffect(() => {
    fetchLatestJanmatName();
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown if click is outside
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      // Close Academics dropdown if click is outside
      if (academicsDropdownRef.current && !academicsDropdownRef.current.contains(event.target)) {
        setIsAcademicsDropdownOpen(false);
      }
      // Close Janmat dropdown if click is outside
      if (janmatDropdownRef.current && !janmatDropdownRef.current.contains(event.target)) {
        setIsJanmatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modals on successful login
  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
      setShowSignup(false);
    }
  }, [isAuthenticated]);

  // Switch from Login → Signup
  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setTimeout(() => setShowSignup(true), 200);
  };

  // Switch from Signup → Login
  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setTimeout(() => setShowLogin(true), 200);
  };

  const handleLogout = async () => {
    await logout();
    setIsConfirmModalOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    setIsUserDropdownOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleNavClick = (e) => {
    // Stop the click from bubbling up to parent dropdown toggles
    e.stopPropagation(); 
    setIsNavOpen(false);
    setIsAcademicsDropdownOpen(false);
    setIsJanmatDropdownOpen(false);
  };

  const handleEditNewsletterClick = async () => {
    // Fetch the current newsletter data to pass to the modal for editing
    try {
      const newsletterRef = doc(db, 'latestNewsletter', 'current');
      const docSnap = await getDoc(newsletterRef);
      setNewsletterToEdit(docSnap.exists() ? docSnap.data() : null);
    } catch (error) {
      console.error("Error fetching newsletter for edit:", error);
    }
    setShowAddNewsletterModal(true);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-top">
          <Link className="logo" to="/" aria-label="Home">
            <img
              id="site-logo"
              className="logo-mark"
              src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1763817711/WhatsApp_Image_2025-11-22_at_18.42.47_fa6778ca_nqifs2.jpg"
              alt="Republica logo"
            />
            <span className="logo-text">
              <span className="logo-line logo-title">DAULAT RAM COLLEGE</span>
              <span className="logo-line logo-subtitle">Political Science Association</span>
              <span className="logo-line logo-subtitle">REPUBLICA</span>
            </span>
            <img
              id="drc-logo"
              className="logo-mark"
              src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1763817290/drc-logo_bllde2.png"
              alt="DRC logo"
            />
          </Link>

          <button
            className="nav-toggle"
            aria-controls="primary-nav"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
          </button>
        </div>

        <nav id="primary-nav" className={`site-nav ${isNavOpen ? 'open' : ''}`} aria-label="Primary">
          <ul>
            <li><Link to="/" onClick={handleNavClick}>Home</Link></li>
            <li><Link to="/about" onClick={handleNavClick}>About</Link></li>
            <li><Link to="/blog" onClick={handleNavClick}>Blog</Link></li>
            <li><Link to="/gallery" onClick={handleNavClick}>Gallery</Link></li>

            {/* Academics Dropdown */}
            <li className={`dropdown ${isAcademicsDropdownOpen ? 'open' : ''}`} ref={academicsDropdownRef}>
              <Link 
                to="/academics" 
                onClick={(e) => {
                  // Prevent navigation only on mobile to allow dropdown toggle
                  if (window.innerWidth <= 900) {
                    e.preventDefault();
                    setIsAcademicsDropdownOpen(!isAcademicsDropdownOpen);
                  } else {
                    // On desktop, just close the main mobile nav if it's open
                    setIsNavOpen(false);
                  }
                }} 
                className="dropdown-link"
              >
                Academics <span className="dropdown-arrow"></span>
              </Link>
              <ul className="dropdown-menu">
                <li><Link to="/academics" onClick={handleNavClick}>Department & Faculty</Link></li>
                <li onClick={handleNavClick}>
                  <a href="https://drive.google.com/drive/folders/1Ys-ha5GznZjFtOlXUPuvJswT1c7aHnGU?usp=drive_link" target="_blank" rel="noopener noreferrer" onClick={handleNavClick}>E-Library</a>
                </li>
              </ul>
            </li>

            {/* Janmat Dropdown */}
            <li className={`dropdown ${isJanmatDropdownOpen ? 'open' : ''}`} ref={janmatDropdownRef}>
              <Link 
                to="/janmat" 
                onClick={(e) => {
                  if (window.innerWidth <= 900) {
                    e.preventDefault();
                    setIsJanmatDropdownOpen(!isJanmatDropdownOpen);
                  } else {
                    setIsNavOpen(false);
                  }
                }} 
                className="dropdown-link"
              >
                Janmat <span className="dropdown-arrow"></span>
              </Link>
              <ul className="dropdown-menu">
                <li><Link to="/janmat" onClick={handleNavClick}>Previous Issues</Link></li>
                <li><Link to="/latest-janmat" onClick={handleNavClick}>{latestJanmatName}</Link></li>
              </ul>
            </li>

            <li><Link to="/notifications" onClick={handleNavClick}>Notifications</Link></li>

            <li><Link to="/contact" onClick={handleNavClick}>Contact Us</Link></li>

            {/* --- UNIFIED LOGIN/USER MENU --- */}
            <li className="user-actions-item">
              {user ? (
                <div
                  className={`user-menu dropdown ${isUserDropdownOpen ? 'show' : ''}`}
                  ref={userDropdownRef}
                >
                    <button
                      onClick={(e) => {
                        setIsUserDropdownOpen(!isUserDropdownOpen);
                      }}
                      className="user-name-btn"
                      aria-haspopup="true"
                      aria-expanded={isUserDropdownOpen}
                    >
                      {username}
                      <span className="dropdown-arrow" style={{ transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </button> 
                  <ul className={`dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`}>
                      {isUserAdmin && (
                        <>
                          <li><Link to="/admin-messages" onClick={(e) => handleNavClick(e)}>See Messages</Link></li>
                          <li><button className="logout-btn" onClick={(e) => { setShowAddBlogModal(true); handleNavClick(e); }}>Add Blog</button></li>
                          <li><button className="logout-btn" onClick={(e) => { setShowAddPhotosModal(true); handleNavClick(e); }}>Create New Album</button></li>
                          <li><button className="logout-btn" onClick={(e) => { setShowAddFlipbookModal(true); handleNavClick(e); }}>Add Janmat Flipbook</button></li>
                          <li><button className="logout-btn" onClick={(e) => { handleEditNewsletterClick(); handleNavClick(e); }}>Edit Latest Newsletter</button></li>
                          <li><button className="logout-btn" onClick={(e) => { setShowAddNotificationModal(true); handleNavClick(e); }}>Add In Notifications</button></li>
                          <li style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }}><hr style={{border: 'none', height: '1px', backgroundColor: 'var(--border)'}}/></li>
                        </>
                      )}
                      <li>
                        <button
                          onClick={(e) => { handleLogoutClick(); handleNavClick(e); }}
                          className="logout-btn"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setShowLogin(true); 
                    handleNavClick(e); 
                  }}
                >Login</a>
              )}

            </li>
          </ul>
        </nav>
      </div>

      {/* Login/Signup Modals - Now managed by Header */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}

      {showSignup && (
        <EmailSignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin} // This function is defined in Header
        />
      )}
      
      {/* Admin Modals - Centralized in Header */}
      {isUserAdmin && (
        <>
          <AddBlogModal 
            isOpen={showAddBlogModal} 
            onClose={() => setShowAddBlogModal(false)} 
            onAddBlog={() => window.location.reload()} 
          />
          <AddFlipbookModal 
            isOpen={showAddFlipbookModal} 
            onClose={() => setShowAddFlipbookModal(false)} 
            onFlipbookAdded={() => window.location.reload()} 
          />
          <AddNewsletterModal 
            isOpen={showAddNewsletterModal} 
            onClose={() => {
              setShowAddNewsletterModal(false);
              setNewsletterToEdit(null); // Clear edit data on close
            }} 
            onNewsletterAdded={fetchLatestJanmatName} 
            newsletterToEdit={newsletterToEdit}
          />
          <AddPhotosModal
            isOpen={showAddPhotosModal}
            onClose={() => setShowAddPhotosModal(false)}
            onUploadComplete={() => window.location.reload()}
          />
          <AddNotificationModal
            isOpen={showAddNotificationModal}
            onClose={() => setShowAddNotificationModal(false)}
            onNotificationAdded={() => window.location.reload()}
          />
        </>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        confirmText="Logout"
      >
        <p>Are you sure you want to log out?</p>
      </ConfirmModal>

    </header>
  );
};

export default Header;
