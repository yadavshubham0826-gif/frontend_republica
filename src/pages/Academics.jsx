import { useRef } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx';
import '../styles/style.css';

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
            <p>Welcome to the Academics section. Here you will find detailed information about our courses, faculty, research areas, and academic programs.</p>
          </FadeInSection>
        </div>
      </section>

      <section id="academics-full" className="section">
        <div className="container">
          <FadeInSection delay={0.1}>
            <h2>Faculty Members</h2>
          </FadeInSection>
          <div className="grid three team-grid">
            {[
              { name: 'Dr. Anjali Sharma', role: 'Professor • Political Theory', desc: 'Specializes in classical and contemporary political thought. Author of "Ideas of Justice".' },
              { name: 'Dr. Vikram Singh', role: 'Associate Professor • International Relations', desc: 'Focuses on South Asian geopolitics and international security.' },
              { name: 'Ms. Pooja Kumari', role: 'Assistant Professor • Public Administration', desc: 'Expert in governance, public policy, and administrative reforms.' },
              { name: 'Dr. Rohan Mehta', role: 'Lecturer • Comparative Politics', desc: 'Research interests include democratization and political systems in developing countries.' },
            ].map((faculty, idx) => (
              <FadeInSection key={idx} delay={0.2 + idx * 0.1}>
                <article className="card person" style={{ background: 'none', backdropFilter: 'none' }}>
                  <div className="avatar" aria-hidden="true"></div>
                  <h3>{faculty.name}</h3>
                  <p className="muted">{faculty.role}</p>
                  <p>{faculty.desc}</p>
                </article>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection delay={0.6}>
            <h2>Courses Offered</h2>
            <ul>
              <li><strong>Undergraduate Programs:</strong> B.A. (Hons.) Political Science, B.A. Programme with Political Science.</li>
              <li><strong>Postgraduate Programs:</strong> M.A. Political Science (affiliated with University of Delhi).</li>
            </ul>
          </FadeInSection>

          <FadeInSection delay={0.7}>
            <h2>Research Areas</h2>
            <p>Our faculty and students are actively engaged in research across various sub-fields of political science, including:</p>
            <ul>
              <li>Indian Political Thought</li>
              <li>International Law and Organizations</li>
              <li>Gender and Politics</li>
              <li>Environmental Politics</li>
              <li>Human Rights</li>
            </ul>
          </FadeInSection>

          <FadeInSection delay={0.8}>
            <h2>Student Resources</h2>
            <p>Links to academic resources, library, and departmental notices.</p>
            <ul>
              <li><a href="#">Departmental Syllabus (PDF)</a></li>
              <li><a href="#">Recommended Readings</a></li>
              <li><a href="#">Research Guidelines</a></li>
            </ul>
          </FadeInSection>
        </div>
      </section>
    </main>
  );
};

export default Academics;
