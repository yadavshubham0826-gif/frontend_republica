import React, { useState, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useUser } from '../context/UserContext';
import { useColorPalette } from '../context/ColorContext.jsx'; // use your context
import { db } from '../firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';
import DOMPurify from 'dompurify';

const LatestJanmat = () => {
  const { user } = useUser();
  const isUserAdmin = user && user.role === 'admin';
  const { setImageUrl, palette, loading: paletteLoading } = useColorPalette(); // use ColorContext
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch newsletter
  const fetchNewsletter = async () => {
    setLoading(true);
    try {
      const newsletterRef = doc(db, 'latestNewsletter', 'current');
      const docSnap = await getDoc(newsletterRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNewsletter(data);

        // Set the preview image for the ColorContext
        if (setImageUrl && data.previewImageUrl) {
          setImageUrl(data.previewImageUrl);
        }
      } else {
        setNewsletter(null);
      }
    } catch (err) {
      console.error("Error fetching newsletter:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletter();
  }, []);

  return (
    <main id="main-content">
      <section
        className="page-hero"
        style={{
          background: !paletteLoading && palette?.gradient ? palette.gradient : '#e0f2fe',
          transition: 'background 0.5s ease-in-out'
        }}
      >
        <div className="container narrow">
          <FadeInSection>
            <div className="text-center">
              <h1 style={{ color: 'white' }}>
                {newsletter?.name || "Janmat'25"} - The Latest Edition
              </h1>
              <h2 style={{ color: 'white', fontWeight: 'normal', fontSize: '1.5rem', marginTop: '0.5rem' }}>
                {newsletter?.topic || "Topic for the latest edition will appear here."}
              </h2>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <FadeInSection>
            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading newsletter...</p>
            ) : newsletter ? (
              <div className="card" style={{ padding: '2rem' }}>
                {newsletter.previewImageUrl && (
                  <img
                    src={newsletter.previewImageUrl}
                    alt={newsletter.topic}
                    style={{
                      float: 'right',
                      width: '50%',
                      marginLeft: '2rem',
                      marginBottom: '1rem',
                      borderRadius: '8px'
                    }}
                  />
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newsletter.content || '') }}
                  style={{ textAlign: 'left' }}
                />
              </div>
            ) : (
              <div className="card text-center">
                <h2 style={{ marginBottom: '1rem' }}>Janmat'25 Newsletter</h2>
                <p className="coming-soon-text">The content for the latest newsletter will be displayed here soon.</p>
                <div className="placeholder-media" style={{ height: '500px', marginTop: '2rem' }} aria-hidden="true"></div>
              </div>
            )}
          </FadeInSection>
        </div>
      </section>
    </main>
  );
};

export default LatestJanmat;
