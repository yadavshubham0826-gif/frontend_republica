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
  const mainRef = useRef(null);
  const { palette, loading, setImageUrl } = useColorPalette(); 
  const POSTS_PER_PAGE = 3;
  const heroImageUrl = "https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764008799/gallery/demo4/xtyuxyieev1coxuhleq3.png";

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
          background: !loading && palette?.gradient ? palette.gradient : "#f0f4f8", 
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
          <FadeInSection delay={0.1}>
            <div className="white-box">
              <h2>About the Society</h2>
              <p>Describe your mission, activities, and impact. This is placeholder text.</p>
              <Link to="/about" className="btn-rect-3d">Know More</Link>
                          </div>
          </FadeInSection>
                  </div>
      </section>
      {/*---------------------Team Section----------------------*/}
      <TeamSection />



      {/* -------------------- BLOG SECTION -------------------- */}
      <div 
        id="blog"
        className="home-blog-section" 
        style={{ background: !loading && palette?.gradient ? palette.gradient : "#f0f4f8" }}
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
              <Link to="/academics" className="btn">View More</Link>
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
                      <p>Contact information placeholder. Add your department details here.</p>
                      <p><strong>Email:</strong> department@college.edu</p>
                      <p><strong>Phone:</strong> +91-XXX-XXXX-XXXX</p>
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
    img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764334385/Isha_Yadav_President_eugnlb.jpg"
    name="Isha Yadav"
    role="PRESIDENT"
  />
  <TeamCard
    img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764336560/Divyanshe_my2ao0.jpg"
    name="Divyanshe"
    role="Treasurer"
  />
  <TeamCard
    img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764334385/Khushi_VP_zmnvxd.jpg"
    name="Khushi Iwanathe"
    role="Vice President"
  />
  <TeamCard
  img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764334385/Kaumudi_General_Secretary_aqwayg.jpg"
  name="Kaumudi Sharma"
  role="General Secretary"
  />
  <TeamCard
  img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764334385/Rashi_JS_n4dpcw.jpg"
  name="Rashi"
  role="Joint Secretary"
  />
   <TeamCard
  img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764338162/Vashu_vnjjtb.jpg"
  name="Vashu Yadav"
  role="Cultural Secretary"
  />
</div>

      </div>
    </section>
  );
}
