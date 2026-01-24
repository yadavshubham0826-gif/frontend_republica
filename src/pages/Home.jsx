import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx'; 
import { db } from '../firebase-config.js'; // Import Firestore instance
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions
import '../styles/style.css';
import '../styles/HomeGallery.css';
import TeamCard from "./TeamCard";
import ImageSlideshow from "../components/ImageSlideshow";
import React from "react";
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

  // Extract all images from albums for slideshow
  useEffect(() => {
    const allImages = [];
    galleryAlbums.forEach(album => {
      if (album.imageUrls && Array.isArray(album.imageUrls)) {
        album.imageUrls.forEach(image => {
          if (image && image.url) {
            allImages.push(image.url);
          }
        });
      }
    });
    console.log('Extracted slideshow images:', allImages.length, allImages);
    setSlideshowImages(allImages);
  }, [galleryAlbums]);

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
          background: !loading && palette?.gradient ? palette.gradient : "linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))", 
          padding: "60px 0",
          color: "#fff",
          textAlign: "center"
        }}
      >
        <h1 className="home-heading-main" style={{ color: '#ffffff' }}>REPUBLICA</h1>
        <p className="home-heading-sub">Political Science Association</p>
        <p className="home-heading-college">Daulat Ram College, University Of Delhi</p>
      </div>

      {/* -------------------- HERO IMAGE -------------------- */}
      <section className="home-hero-image-section">
        <img
          src={heroImageUrl}
          alt="Featured event"
          className="home-hero-image"
        />
      </section>



      {/* -------------------- ABOUT SECTION -------------------- */}

      <section id="about" className="section">
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
        style={{ background: !loading && palette?.gradient ? palette.gradient : "linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))" }}
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
                          <h3>{post.title}</h3>
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

 <section id="academics" className="section">
        <div className="container">
          <FadeInSection>
            <h2>Department Teachers</h2>
          </FadeInSection>
          <div className="grid three">
            <FadeInSection delay={0.1}>
              <article className="card person">
                <div className="avatar" aria-hidden="true"></div>
                <h3>Teacher Name</h3>
                <p className="muted">Professor • Subject / Research Area</p>
              </article>
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <article className="card person">
                <div className="avatar" aria-hidden="true"></div>
                <h3>Teacher Name</h3>
                <p className="muted">Assistant Professor • Subject</p>
              </article>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <article className="card person">
                <div className="avatar" aria-hidden="true"></div>
                <h3>Teacher Name</h3>
                <p className="muted">Lecturer • Subject</p>
              </article>
            </FadeInSection>
          </div>
          <FadeInSection delay={0.4}>
            <div className="text-center">
              <Link to="/academics" className="btn-rect-3d">View More</Link>
            </div>
          </FadeInSection>
        </div>
      </section>
      {/* -------------------- GALLERY SECTION (FILM STRIP) -------------------- */}
      <section 
        id="gallery" 
        className="section"
        style={{ 
          background: !loading && palette?.gradient ? palette.gradient : "#f0f4f8",
          color: '#ffffff'
        }}
      >
        <div className="home-gallery-container text-center">
          <FadeInSection>
            <h2 className="home-gallery-heading">Gallery</h2>
          </FadeInSection>

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
      //Contact Us Section//
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
 <p><strong>Address:</strong> Republica, Political Science Association<br />Daulat Ram College, University Of Delhi, 4-Maurice Nagar,New Delhi-110007</p>
                    </div>
                  </FadeInSection>
                  <FadeInSection delay={0.2}>
                    <div className="card">
                      <h3>Send Message</h3>
                      <p> Have questions or want to learn more about our department? We'd love to hear from you.</p>
                      <Link to="/contact#message-form" className="btn">
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
