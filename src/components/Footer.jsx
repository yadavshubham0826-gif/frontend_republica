import { Link } from 'react-router-dom';
import '../styles/style.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Define the logo URL
  const logoUrl = "https://res.cloudinary.com/dyv1rtwvh/image/upload/v1763817711/WhatsApp_Image_2025-11-22_at_18.42.47_fa6778ca_nqifs2.jpg";

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        {/* Left side with logo and copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={logoUrl} 
            alt="Republica Logo" 
            style={{ height: '72px', width: '72px', objectFit: 'cover', borderRadius: '50%' }} 
          />
          <p style={{ margin: 0 }}>© {currentYear} Daulat Ram College Political Science Association Republica • All rights reserved</p>
        </div>

        {/* Right side with navigation */}
        <nav aria-label="Footer" style={{ marginLeft: 'auto' }}>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/academics">Academics</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
