import React from 'react';
import FadeInSection from '../components/FadeInSection';
import { useColorPalette } from '../context/ColorContext.jsx';
import '../styles/style.css';
import '../styles/team.css';

function About() {
  const { palette, loading } = useColorPalette();
  const gradient = palette.gradient;

  if (loading) return <p>Loading gradient...</p>;

  return (
    <main id="main-content">
      {/* Hero Section */}
      <section className="page-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <FadeInSection>
            <h1>About Republica</h1>
            <p>
              Discover the mission, vision, and the people behind the Political Science Association of Daulat
              Ram College.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Team Sections */}
      <div className="team-container">
        <section className="team-section">
          <h2 className="team-title">Content & Research</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764344709/Nensi_bhpp8z.jpg" alt="" />
            <h3>Nensi Sharma</h3>
            <p>Content and Research Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764344719/Aseem_ge80ca.webp" alt="" />
            <h3>Aseem Talwar</h3>
            <p>Content and Research Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Creative</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764345350/Screenshot_2025-11-28_212445_idlpb5.jpg" alt="" />
            <h3>Yashika</h3>
            <p>Creative Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764345350/Screenshot_2025-11-28_212349_aatb3x.jpg" alt="" />
            <h3>Manshi Sikaria</h3>
            <p>Creative Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Editorial-In-Chiefs</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764346011/Screenshot_2025-11-28_213556_po2zse.jpg" alt="" />
            <h3>Afeefa Nasir</h3>
            <p>Editor-In-Chief</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764345541/Sumedha_yhf4mh.jpg" alt="" />
            <h3>Sumedha Manhas</h3>
            <p>Editor-In-Chief</p>
          </div>
        </section>

        <section className="team-section team-three">
          <h2 className="team-title">Management</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764346127/Khushi_Siddiqui__g2eqz7.jpg" alt="" />
            <h3>Khushi Siddiqui</h3>
            <p>Management Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764348403/rizul_q2ml0b.jpg" alt="" />
            <h3>Rizul Rao</h3>
            <p>Management Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764346127/Anshika_Malhotra__bnwodb.jpg" alt="" />
            <h3>Anshika Malhotra</h3>
            <p>Management Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Social Media</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764346801/Screenshot_2025-11-28_214851_v1w4hh.jpg" alt="" />
            <h3>Akshita Chauhan</h3>
            <p>Social Media Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764348832/WhatsApp_Image_2025-11-28_at_22.22.54_43301c8a_bdopox.jpg" alt="" />
            <h3>Ananya Prasad</h3>
            <p>Social Media Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Sponsorship & PR</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764347218/Screenshot_2025-11-28_215605_chjhpx.jpg" alt="" />
            <h3>Kripa Jaiswal</h3>
            <p>Sponsorship & PR Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764347109/khushi_x0sqri.png" alt="" />
            <h3>Khushi</h3>
            <p>Sponsorship & PR Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Technical</h2>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764349290/Screenshot_2025-11-28_220441_qofnvo.png" alt=""/>       
           <h3>Shalini Yadav</h3>
            <p>Technical Head</p>
          </div>
          <div className="team-box">
            <img src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764347412/Screenshot_2025-11-28_215845.png_o49iyc.jpg" alt="" />
            <h3>Tanvi</h3>
            <p>Technical Head</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default About;
