import { Link } from 'react-router-dom';
import '../styles/style.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Define the logo URL
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FMain%20Page%2Frepublica_logo.jpg?alt=media&token=5400e619-c51a-48f6-8240-9f88b15ac83d";

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
