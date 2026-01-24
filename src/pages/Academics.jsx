import { useRef } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx';
import '../styles/style.css';
import FacultyCard from "./FacultyCard";
import FacultySection from "./FacultySection";

const Academics = () => {
  const mainRef = useRef(null);
  useHeaderOffset(); // Ensure header offset is applied

  const { palette, loading } = useColorPalette();
  const gradient = palette.gradient;

  if (loading) return <p>Loading gradient...</p>;

  return (
    <main id="main-content" ref={mainRef}>
      <section className="page-hero academics-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <FadeInSection>
            <h1>Our Academics</h1>
             <p style={{ fontSize: "14px", lineHeight: "1.6" }}>Welcome to the Academics section. Here you will find information about our faculty and also you can access Our E-Library for previous year question papers and study materials.</p>
          </FadeInSection>
        </div>
      </section>
<FacultySection />

    </main>
  );
};

export default Academics;