import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx'; 
import { db, storage } from '../firebase-config.js'; // Import Firestore instance
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import '../styles/style.css';
import '../styles/HomeGallery.css';
import TeamCard from "./TeamCard";
import ImageSlideshow from "../components/ImageSlideshow";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
const Home = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [totalPages, setTotalPages] = useState(0);
  const [galleryAlbums, setGalleryAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [slideshowImages, setSlideshowImages] = useState([]);
  const mainRef = useRef(null);
  const { palette, loading, setImageUrl } = useColorPalette(); 
  const POSTS_PER_PAGE = 3;
  const heroImageUrl = "https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FScreenshot%202026-01-24%20162436.png?alt=media&token=e5c66d54-5b57-431c-9100-76abd09973c3";

  useHeaderOffset();

  // When the Home component mounts, tell the ColorContext which image to use.
  useEffect(() => {
    if (setImageUrl) {
      setImageUrl(heroImageUrl);
    }
  }, [setImageUrl, heroImageUrl]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        // Fetch posts directly from Firestore
        const blogsCollection = collection(db, 'blogs');
        const q = query(blogsCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllPosts(posts); // This already triggers the pagination useEffect
        setTotalPages(Math.ceil(posts.length / POSTS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching all posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  // Fetch albums
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoadingAlbums(true);
      try {
        // Fetch albums directly from Firestore
        const albumsCollection = collection(db, 'photoAlbums');
        const q = query(albumsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedAlbums = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGalleryAlbums(fetchedAlbums);
      } catch (error) {
        console.error("Error fetching gallery albums:", error);
      } finally {
        setLoadingAlbums(false);
      }
    };
    fetchAlbums();
  }, []);

  // Fetch slideshow images from Firebase Storage
  useEffect(() => {
    const fetchSlideshowImages = async () => {
      try {
        const slideshowFolderRef = ref(storage, 'slideshow');
        const res = await listAll(slideshowFolderRef);
        
        // Take the first 8 items
        const firstEightItems = res.items.slice(0, 8);

        const urls = await Promise.all(
          firstEightItems.map((itemRef) => getDownloadURL(itemRef))
        );
        setSlideshowImages(urls);
      } catch (error) {
        console.error("Error fetching slideshow images from Firebase Storage:", error);
      }
    };

    fetchSlideshowImages();
  }, []);

  // Update latest posts based on pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    setLatestPosts(allPosts.slice(startIndex, endIndex));
  }, [currentPage, allPosts]);

  // Helper to extract first image from post content
  const getFirstImage = (content) => {
    if (!content) return null;
    const match = content.match(/<img.*?src=["'](.*?)["']/);
    return match ? match[1] : null;
  };

  const formatBlogDate = (value) => {
    if (!value) return "";
    let date;
    if (typeof value?.toDate === "function") {
      date = value.toDate();
    } else if (typeof value?.seconds === "number") {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }
    if (Number.isNaN(date.getTime())) return "";
    const month = date.toLocaleString("en-US", { month: "long" });
    const day = date.getDate();
    return `${month} | ${day}`;
  };

  // Handle like clicks
  const handleLikeClick = (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikedPosts = new Set(likedPosts);
    const postIndex = latestPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const updatedPosts = [...latestPosts];
    const postToUpdate = { ...updatedPosts[postIndex] };

    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      postToUpdate.likes = (postToUpdate.likes || 1) - 1;
    } else {
      newLikedPosts.add(postId);
      postToUpdate.likes = (postToUpdate.likes || 0) + 1;
    }

    updatedPosts[postIndex] = postToUpdate;
    setLatestPosts(updatedPosts);
    setLikedPosts(newLikedPosts);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <main id="main-content" ref={mainRef}>
      {/* -------------------- HEADER -------------------- */}
      <div 
        className="home-heading-container" 
        style={{ 
          background: !loading && palette?.gradient ? palette.gradient : "linear-gradient(to bottom right, #9db2a2 0%, #c1c7b1 50%, #e2d1c3 100%)", 
          padding: "30px 0",
          color: "#fff",
          textAlign: "center"
        }}
      >
        <div className="home-heading-stack">
          <h1 className="home-heading-main">REPUBLICA</h1>
          <div className="home-heading-divider" aria-hidden="true"></div>
          <p className="home-heading-sub">Political Science Association</p>
          <p className="home-heading-college">Daulat Ram College, University Of Delhi</p>
        </div>
      </div>

      {/* -------------------- HERO IMAGE -------------------- */}
{/* -------------------- HERO IMAGE -------------------- */}
<section className="home-hero-image-section">
  <img
    src={heroImageUrl}
    alt="Hero"
    className="home-hero-image"
    loading="eager"
  />
</section>


      {/* -------------------- ABOUT SECTION -------------------- */}

      <section id="about" className="section about-section">
        <div className="container">
          <div className="about-slideshow-wrapper">
            <FadeInSection delay={0.1}>
              <div className="white-box about-section-content">
                <h2>About the Society</h2>
                <p>Department of Political Science As a discipline, Political Science engages the students to understand a broad and diverse area of inquiry covering Political Ideas, Political Theory, Comparative Political Systems, Indian Politics, Global Politics, and the Administrative State. The students of Political Science are trained to develop an analytical framework to understand the multiple perspectives of understanding reality. An analytical study equips them to not only argue, interrogate and contest the linear approach, but also, to move towards an adequate understanding of the issues, challenges, dilemmas, and conflicts that are critical to contemporary polity, economy and society..</p>
                <Link to="/about" className="btn-rect-3d">Know More</Link>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <div className="slideshow-section">
                {loadingAlbums ? (
                  <div style={{ padding: '2rem', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Loading slideshow...</p>
                  </div>
                ) : (
                  <ImageSlideshow images={slideshowImages} />
                )}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
      {/*---------------------Team Section----------------------*/}
      <TeamSection />



      {/* -------------------- BLOG SECTION -------------------- */}
      <div 
        id="blog"
        className="home-blog-section" 
        style={{ background: !loading && palette?.gradient ? palette.gradient : "linear-gradient(to bottom right, #9db2a2 0%, #c1c7b1 50%, #e2d1c3 100%)", color: "#ffffff", textShadow: "0px 1px 3px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="container">
          <FadeInSection>
            <h2 className="home-blog-heading" style={{ color: '#ffffff', fontFamily: 'Montserrat, sans-serif' }}>Blogs</h2>
          </FadeInSection>

          <div className="home-blog-grid-container">
            <div className="grid three">
              {loadingPosts ? (
                <p style={{ color: '#fff' }}>Loading latest posts...</p>
              ) : latestPosts.length > 0 ? (
                latestPosts.map((post, index) => (
                  <FadeInSection key={post.id} delay={(index + 1) * 0.1}>
                    <Link to={`/blog/${post.slug}`} className="home-blog-card-link">
                      <div 
                        className="home-blog-card" 
                        style={{ backgroundImage: `url(${getFirstImage(post.content) || heroImageUrl})` }}
                      >
                        <div className="home-blog-card-overlay">
                          <div className="home-blog-date">{formatBlogDate(post.date)}</div>
                          <h3 className="home-blog-title">{post.title}</h3>
                          <div className="home-blog-author">- {post.author || "Unknown"}</div>
                          <div className="home-blog-stats">
                            <span className="home-blog-stat">
                              <svg
                                className="home-blog-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="#e74c3c"
                                stroke="#e74c3c"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              <span className="home-blog-stat-text">{post.likes || 0}</span>
                            </span>
                            <span className="home-blog-stat">
                              <svg
                                className="home-blog-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              <span className="home-blog-stat-text">{post.views || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </FadeInSection>
                ))
              ) : (
                <p style={{ color: '#fff' }}>No posts yet. Check back soon!</p>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1 || loadingPosts}
                className="pagination-btn"
              >
                &larr; Previous
              </button>
              <span className="page-indicator">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages || loadingPosts}
                className="pagination-btn"
              >&rarr; Next</button>
            </div>
          )}
        </div>
      </div>


      {/* -------------------- E-LIBRARY SECTION -------------------- */}
<section
  id="e-library"
  className="section"
  style={{
    // Soft Mint & Slate Gradient base
    background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #83c5be 100%)',
    position: 'relative',
    padding: '20px 0',
    overflow: 'hidden', // This hides the parts of the curves that go off-screen
  }}
>
  {/* --- BACKGROUND DECORATIVE CURVES (Blobs) --- */}
  {/* These replace the visual interest of the SVG with soft, modern depth */}
  <div style={{
    position: 'absolute',
    width: '700px',
    height: '700px',
    background: 'rgba(0, 210, 255, 0.3)',
    borderRadius: '43% 57% 70% 30% / 30% 45% 55% 70%',
    top: '-200px',
    right: '-100px',
    filter: 'blur(90px)',
    zIndex: 0
  }}></div>

  <div style={{
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '50% 50% 30% 70% / 50% 30% 70% 50%',
    bottom: '-150px',
    left: '-50px',
    filter: 'blur(80px)',
    zIndex: 0
  }}></div>

  {/* --- CONTENT --- */}
  {/* We keep zIndex: 1 here to ensure text stays above the blurred background */}
  <div className="container" style={{ position: 'relative', zIndex: 1 }}>
    <FadeInSection>
      <h2 style={{ 
        textAlign: 'center', 
        color: "#2d5a57", 
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 'bold',
        fontSize: '2.5rem'
      }}>
        E-Library
      </h2>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#4a7a76', maxWidth: '600px', margin: '0 auto' }}>
        Access our collection of previous year question papers and study materials.
      </p>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a
          href="https://drive.google.com/drive/folders/1Ys-ha5GznZjFtOlXUPuvJswT1c7aHnGU"
          className="btn-rect-3d"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          Go to E-Library <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </a>
      </div>
    </FadeInSection>
  </div>
</section>




      {/* -------------------- GALLERY HEADING SECTION -------------------- */}
 <section 
  className="section home-gallery-cta" 
  style={{ 
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%)', 
    padding: '6px 0 12px'
  }}
>
  <div className="container text-center">
    <FadeInSection>
      <h2 
        className="home-gallery-heading" 
        style={{ color: 'var(--text, #333)', fontSize: '32px', margin: '0 0 8px' }}
      >
        Gallery
      </h2>
      <p 
        style={{ 
          fontSize: "18px", 
          lineHeight: "1.6", 
          color: '#666', 
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)', 
          maxWidth: '700px', 
          margin: '0 auto 12px' 
        }}
      >
        Explore moments from our past events, workshops, and gatherings. This page showcases a comprehensive collection of our society's activities.
      </p>
      <Link
        to="/gallery"
        className="btn-rect-3d"
        style={{ 
          marginBottom: "16px", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px" 
        }}
      >
        Gallery <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
      </Link>
    </FadeInSection>
  </div>
</section>
      {/* -------------------- GALLERY SECTION (FILM STRIP) -------------------- */}
      <section
        id="gallery"
        className="section"
        style={{
          background: !loading && palette?.gradient ? palette.gradient : "#f0f4f8",
          color: '#ffffff',
          paddingTop: "24px",
          paddingBottom: "8px"
        }}
      >
        <div className="home-gallery-container">
          {loadingAlbums ? (
            <p>Loading albums...</p>
          ) : galleryAlbums.length > 0 ? (
            <div className="home-gallery-film">
              {galleryAlbums.map((album, index) => (
                <FadeInSection key={album.id} delay={(index + 1) * 0.05}>
                  <Link to={`/gallery/album/${album.id}`} className="home-gallery-box">
                    <img src={album.coverPhoto?.url || album.coverPhotoUrl} alt={`Cover for ${album.title}`} />
                    <div className="home-gallery-overlay">
                      <span className="home-gallery-title">{album.title}</span>
                    </div>
                  </Link>
                </FadeInSection>
              ))}
            </div>
          ) : (
            <p>No albums to display yet.</p>
          )}
        </div>
      </section>
      {/* Contact Us Section */}
      <section id="contact" className="section light">
              <div className="container text-center">
                <FadeInSection>
                  <h2>Contact Us</h2>
                </FadeInSection>
                <div className="grid two">
                  <FadeInSection delay={0.1}>
                    <div>
                      <h3>Get in Touch</h3>
                                           <a
      
      href="mailto:republica.psa.drc@gmail.com?subject=Inquiry%20from%20Website&body=Hello%20Republica%20Team,%0D%0A%0D%0AI%20am%20writing%20to%20inquire%20about%20your%20department.%0D%0A%0D%0ARegards,"
      onClick={(e) => {
        // Desktop → Gmail Web | Mobile → Mail app
        if (window.innerWidth > 768) {
          e.preventDefault();
          window.open(
            'https://mail.google.com/mail/?view=cm&fs=1&to=republica.psa.drc@gmail.com&su=Inquiry%20from%20Website&body=Hello%20Republica%20Team,%0D%0A%0D%0AI%20am%20writing%20to%20inquire%20about%20your%20department.%0D%0A%0D%0ARegards,',
            '_blank'
          );
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600'
      }}
    >
      {/* Gmail icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M3 6.5L12 12.5L21 6.5"
          stroke="#EA4335"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          ry="2"
          stroke="#EA4335"
          strokeWidth="2"
        />
      </svg>

      {/* Email text */}
      <span style={{ color: '#000' }}>
        republica.psa.drc@gmail.com
      </span>
    </a>
  <p>
  <strong>
    <a
    
      href="https://www.instagram.com/republica_drc/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {/* Instagram SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>

        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
          ry="5"
          stroke="url(#instaGradient)"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="4" stroke="url(#instaGradient)" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.2" fill="url(#instaGradient)" />
      </svg>

      republica_drc
    </a>
  </strong>
</p>
<p>
  <strong>
    <a
      
      href="https://www.linkedin.com/company/republica-the-political-science-department-daulat-ram-college/" // replace with your actual LinkedIn profile
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600',
         fontSize: '18px',
         
      }}
    >
      {/* LinkedIn icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M4 4.5C4 5.328 3.328 6 2.5 6S1 5.328 1 4.5 1.672 3 2.5 3 4 3.672 4 4.5Z"
          fill="#0077B5"
        />
        <path
          d="M0 8h5v16H0V8Zm7 0h5v2h.07c.69-1.3 2.37-2.7 4.93-2.7 5.27 0 6.97 3.46 6.97 7.96V24h-5v-7.54c0-1.8-.03-4.1-2.5-4.1-2.5 0-2.88 1.95-2.88 3.96V24H7V8Z"
          fill="#0077B5"
        />
      </svg>

      {/* LinkedIn text */}
      <span style={{ color: '#0077B5' }}>Republica DRC</span>
    </a>
  </strong>
  </p>
   <p>
  <strong>
    <a
      
      href="https://www.facebook.com/share/1MVv3pRqyQ/" // replace if needed
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '18px',
        color: '#1877F2', // Facebook blue
      }}
    >
      {/* Facebook icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ flexShrink: 0 }}
      >
        <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
      </svg>

      {/* Facebook text */}
      <span>Republica DRC</span>
    </a>
  </strong>
</p>
 <p><strong>Address:</strong> Republica, Political Science Association<br />Daulat Ram College, University Of Delhi, 4 Maurice Nagar,New Delhi-110007</p>
                    </div>
                  </FadeInSection>
                  <FadeInSection delay={0.2}>
                    <div className="card">
                      <h3>Send Message</h3>
                      <p> Have questions or want to learn more about our department? We'd love to hear from you.</p>
                      <Link to="/contact#message-form" className="btn btn-contact-cta">
        Send a Message
      </Link>
                    </div>
                  </FadeInSection>
                </div>
              </div>
            </section>
    </main>
  );
};

export default Home;

function TeamSection() {
  const styles = {
    wrapper: {
      marginTop: "60px",
      display: "flex",
      gap: "60px",
      justifyContent: "center",
      flexWrap: "wrap",
    },
  };

  return (
    <section id="team" className="section light">
      <div className="container">
        <FadeInSection>
          <h2
            style={{
              color: "hsla(0, 18%, 4%, 1.00)",
              fontFamily: "Montserrat, sans-serif",
              textAlign: "center",
            }}
          >
            Meet The Union
          </h2>
        </FadeInSection>

     <div style={styles.wrapper}>
  <TeamCard
    img="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FUnion%2FIsha_Yadav_President_eugnlb.jpg?alt=media&token=f709f052-ab18-47ed-9683-13b9a8a65cdf"
    name="Isha Yadav"
    role="President"/>
  <TeamCard
    img="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FUnion%2FDivyanshe_my2ao0.jpg?alt=media&token=69f7cd99-9500-4eb0-bb40-cc8cc70891a6"
    name="Divyanshe"
    role="Treasurer"
  />
  <TeamCard
    img="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FUnion%2FKhushi_VP_zmnvxd.jpg?alt=media&token=8184eed9-e3ea-4d8d-844d-db0358c4008a"
    name="Khushi Iwanathe"
    role="Vice President"
  />
  <TeamCard
  img="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FUnion%2FKaumudi_General_Secretary_aqwayg.jpg?alt=media&token=168eb5ac-ad82-49be-8094-e95455a03e3a"
  name="Kaumudi Sharma"
  role="General Secretary"
  />
  <TeamCard
  img="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FUnion%2FRashi_JS_n4dpcw.jpg?alt=media&token=382ef00b-5385-48ec-93e8-9a8f050c579c"
  name="Rashi"
  role="Joint Secretary"
  />
   <TeamCard
  img="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FUnion%2FVashu_vnjjtb.jpg?alt=media&token=ab1a60c6-6ff3-4a37-9e14-65544bd04c7e"
  name="Vashu Yadav"
  role="Cultural Secretary"
  />
</div>

      </div>
    </section>
  );
}
