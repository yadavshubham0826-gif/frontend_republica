import React from 'react';
import FadeInSection from '../components/FadeInSection';
import { useColorPalette } from '../context/ColorContext.jsx';
import '../styles/style.css';

function About() {
     const { palette, loading } = useColorPalette();
  const gradient = palette.gradient;

  if (loading) return <p>Loading gradient...</p>;

  return (
    <main id="main-content">
      {/* Removed any glass effect */}
      <section className="page-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <FadeInSection>
            <h1>About Republica</h1>
            <p>
              Discover the mission, vision, and the people behind the Political Science Association of Daulat Ram College.
            </p>
          </FadeInSection>
        </div>
      </section>
      {/* Add more sections with content below */}
    </main>
  );
}

export default About;
