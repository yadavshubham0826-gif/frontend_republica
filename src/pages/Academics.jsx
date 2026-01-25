import { useRef, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx';
import '../styles/style.css';

const Academics = () => {
  const mainRef = useRef(null);
  useHeaderOffset();

  const { palette, loading, setImageUrl } = useColorPalette();

  const heroImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FWhatsApp%20Image%202026-01-25%20at%2021.51.27.jpeg?alt=media&token=96ec8f21-196c-4b57-a3e6-b4de5441c2a7";

  useEffect(() => {
    if (setImageUrl) {
      setImageUrl(heroImageUrl);
    }
  }, [setImageUrl, heroImageUrl]);

  const gradient = palette.gradient;

  return (
    <main id="main-content" ref={mainRef}>
      {/* HERO SECTION */}

      <section
        className="page-hero academics-hero"
        style={{
          background:
            !loading && gradient
              ? gradient
              : "linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))",
        }}
      >
       <div className="container narrow">
  <FadeInSection>
    <h1
      style={{
        fontSize: "clamp(2.6rem, 4vw, 4rem)",
        letterSpacing: "-1px",
        marginBottom: "1rem",
        textAlign: "center",
      }}
    >
      Academics
    </h1>

    <p
      style={{
        fontSize: "15px",
        lineHeight: "1.7",
        maxWidth: "620px",
        opacity: 0.9,
        textAlign: "center",
        margin: "0 auto",
      }}
    >
      Excellence in teaching, research, and academic resources.
      Explore our faculty and access the E-Library for previous year
      question papers and study materials.
    </p>
  </FadeInSection>
</div>
</section>

      {/* FACULTY SECTION */}
      <section id="faculty" className="section light">
        <div className="container">
          <FadeInSection>
            <h2
              style={{
                color: "hsla(0, 18%, 4%, 1)",
                fontFamily: "Montserrat, sans-serif",
                textAlign: "center",
                fontSize: "2rem",
                marginBottom: "0.75rem",
              }}
            >
              Faculty
            </h2>

            <p
              style={{
                textAlign: "center",
                maxWidth: "680px",
                margin: "0 auto",
                fontSize: "16px",
                lineHeight: "1.7",
                opacity: 0.8,
                              }}
            >
              Our department is supported by experienced and dedicated faculty
              members committed to academic excellence and student mentorship.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* IMAGE SECTION */}
      <section className="home-hero-image-section academics-image-section">
        <div className="image-frame">
          <img
            src={heroImageUrl}
            alt="Academics"
            className="home-hero-image"
          />
        </div>
      </section>


<section className="section light faculty-section-bordered">
  <div className="container narrow">
    <FadeInSection>
      <h3 className="faculty-heading">Faculty Members</h3>

      <ul className="faculty-list">
        <li>
          <span className="faculty-name">Prof. Suranjita Ray</span>
        </li>

        <li>
          <span className="faculty-name">Mrs. Geetanjali Kumar</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Moitree Bhattacharya</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Shachi Chawla</span>
          <span className="faculty-role"><strong> (Teacher In Charge)</strong></span>
        </li>

        <li>
          <span className="faculty-name">Dr. Vandana Tripathi</span>
        </li>

        <li>
          <span className="faculty-name">Mrs. Manjula Rath</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Smita Yadav</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Malvika Singh</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Chandra Prakash</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Piyush Kant</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Shivali Agrawal</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Kunal Krishna</span>
          <span className="faculty-role"> <strong> (Association In Charge)</strong></span>
        </li>

        <li>
          <span className="faculty-name">Dr. Jaggu Dan Ratnoo</span>
        </li>

        <li>
          <span className="faculty-name">Dr. Nitesh Rai</span>
        </li>

        <li>
          <span className="faculty-name">Mrs. Nupur Tripathi</span>
        </li>
      </ul>
    </FadeInSection>
  </div>
</section>


{/* -------------------- E-LIBRARY SECTION -------------------- */}
      <section id="e-library" className="section light">
        <div className="container">
          <FadeInSection>
            <h2 style={{ textAlign: 'center', color: "hsla(0, 18%, 4%, 1.00)", fontFamily: "Montserrat, sans-serif" }}>E-Library</h2>
            <p style={{ textAlign: 'center', fontSize: '18px' }}>
              Access our collection of previous year question papers and study materials.
            </p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href="https://drive.google.com/drive/folders/1Ys-ha5GznZjFtOlXUPuvJswT1c7aHnGU" className="btn-rect-3d" target="_blank" rel="noopener noreferrer">
                Go to E-Library
              </a>
            </div>
          </FadeInSection>
        </div>
      </section>

    </main>
  );
};

export default Academics;
