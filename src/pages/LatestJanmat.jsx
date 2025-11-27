import React, { useState, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useUser } from '../context/UserContext';
import { usePalette } from 'color-thief-react';
import { db } from '../firebase-config.js'; // Import Firestore instance
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import DOMPurify from 'dompurify'; // Import the sanitizer

const LatestJanmat = () => {
  // Custom hook for generating a gradient from an image, specific to this page
  const useImageGradient = (imageUrl) => {
    const { data: colors, loading, error } = usePalette(imageUrl, 5, 'hex', {
      crossOrigin: 'anonymous',
    });
    const [gradient, setGradient] = useState(null);

    useEffect(() => {
      if (colors && Array.isArray(colors) && colors.length > 0) {
        // Simple check to avoid overly dark gradients. A more complex brightness check could be added.
        const suitableColors = colors.filter(color => {
          const hex = color.substring(1); // remove #
          const rgb = parseInt(hex, 16);
          const r = (rgb >> 16) & 0xff;
          const g = (rgb >> 8) & 0xff;
          const b = (rgb >> 0) & 0xff;
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
          return luma > 40; // Filter out very dark colors
        });

        if (suitableColors.length >= 2) {
          setGradient(`linear-gradient(135deg, ${suitableColors.join(', ')})`);
        } else if (suitableColors.length === 1) {
          setGradient(`linear-gradient(135deg, ${suitableColors[0]}, #ffffff)`);
        } else {
          setGradient(null); // Fallback
        }
      }
    }, [colors]);

    return { gradient, loading, error };
  };
  const { user } = useUser();
  const isUserAdmin = user && user.role === 'admin';
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the self-contained hook
  const { gradient, loading: gradientLoading } = useImageGradient(newsletter?.previewImageUrl);

  const fetchNewsletter = async () => {
    setLoading(true);
    try {
      // Fetch the latest newsletter directly from Firestore
      const newsletterRef = doc(db, 'latestNewsletter', 'current');
      const docSnap = await getDoc(newsletterRef);

      if (docSnap.exists()) {
        setNewsletter(docSnap.data());
      } else {
        setNewsletter(null); // No newsletter found
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
          background: !gradientLoading && gradient ? gradient : '#e0f2fe',
          transition: 'background 0.5s ease-in-out'
        }}>
        <div className="container narrow">
          <FadeInSection>
            <div className="text-center">
              <h1 style={{ color: 'white' }}>{newsletter?.name || "Janmat'25"} - The Latest Edition</h1>
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
                {/* Sanitize the content before rendering */}
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