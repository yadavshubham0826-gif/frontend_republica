import React from 'react';
import FadeInSection from '../components/FadeInSection';
import LoadingUI from '../components/LoadingUI';
import { useColorPalette } from '../context/ColorContext.jsx';
import '../styles/style.css';
import '../styles/team.css';

function About() {
  const { palette, loading } = useColorPalette();
  const gradient = palette.gradient;

  if (loading) return <LoadingUI text="Preparing about page" detail="Getting the page colors ready." variant="page" />;

  return (
    <main id="main-content">
      {/* Hero Section */}
      <section className="page-hero" style={{ background: gradient }}>
        <div className="container narrow">
          <FadeInSection>
            <h1>About Republica</h1>
             <p style={{ fontSize: "12px", lineHeight: "1.6" }}>
              Department of Political Science As a discipline, Political Science engages the students to understand a broad and diverse area of inquiry covering Political Ideas, Political Theory, Comparative Political Systems, Indian Politics, Global Politics, and the Administrative State. The students of Political Science are trained to develop an analytical framework to understand the multiple perspectives of understanding reality. An analytical study equips them to not only argue, interrogate and contest the linear approach, but also, to move towards an adequate understanding of the issues, challenges, dilemmas, and conflicts that are critical to contemporary polity, economy and society. While developing a clear understanding of the fundamentals of Political Science, they also get a good grounding in both theoretical and empirical knowledge that is essential to the discipline. Thus it enables the students to revisit some of the universal concepts, theories and practices by locating them in the larger historical context of the social, economic, political, and cultural processes of the global order. Study of Political Science opens avenues for career in Research, Teaching, Civil Services, Journalism, Law, NGOs and other agencies that work in the areas like Gender studies, Human Rights, Rural and Urban Development, Public Policy and International Relations. Thus our graduates/post graduates become influential performers in a range of professional settings.
            </p>
          </FadeInSection>
        </div>
      </section>
      
      {/* Our Team Heading */}
      <div className="container" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <FadeInSection>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Our Team</h2>
        </FadeInSection>
      </div>

      {/* Team Sections */}
      <div className="team-container">
        <section className="team-section">
          <h2 className="team-title">Content & Research</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FCreative%2FNensi_bhpp8z.jpg?alt=media&token=133b3408-eac9-4533-8028-91a778af5cce" alt="" />
            <h3>Nensi Sharma</h3>
            <p>Content and Research Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FCreative%2FAseem_ge80ca.webp?alt=media&token=11249e68-db3e-4b14-94e8-838b96776184" alt="" />
            <h3>Aseem Talwar</h3>
            <p>Content and Research Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Creative</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FContent%2FScreenshot_2025-11-28_212445_idlpb5.jpg?alt=media&token=f55e5abf-e717-4224-9598-24d01a18b85c" alt="" />
            <h3>Yashika</h3>
            <p>Creative Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FContent%2FScreenshot_2025-11-28_212349_aatb3x.jpg?alt=media&token=feaabae2-fce0-458e-9b43-40a032eb336a" alt="" />
            <h3>Manshi Sikaria</h3>
            <p>Creative Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Editor-In-Chiefs</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FEditor%2FScreenshot_2025-11-28_213556_po2zse.jpg?alt=media&token=a6311cc5-dc49-48f2-abf3-19f948dad74c" alt="" />
            <h3>Afeefa Nasir</h3>
            <p>Editor-In-Chief</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FEditor%2FSumedha_yhf4mh.jpg?alt=media&token=297a1066-0920-4f3e-8a88-28a3d9c85d57" alt="" />
            <h3>Sumedha Manhas</h3>
            <p>Editor-In-Chief</p>
          </div>
        </section>

        <section className="team-section team-three">
          <h2 className="team-title">Management</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FManagement%2FKhushi_Siddiqui__g2eqz7.jpg?alt=media&token=3b1c1e35-2b90-4fc2-9582-63d73ac830ee" alt="" />
            <h3>Khushi Siddiqui</h3>
            <p>Management Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FTechnical%2Frizul_q2ml0b.jpg?alt=media&token=2ca604a3-125a-46d6-9d00-2aab986c2f11" alt="" />
            <h3>Rizul Rao</h3>
            <p>Management Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FManagement%2FAnshika_Malhotra__bnwodb.jpg?alt=media&token=1d04c429-77d3-45f2-b864-4899046fffe5" alt="" />
            <h3>Anshika Malhotra</h3>
            <p>Management Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Social Media</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FScreenshot_2025-11-28_214851_v1w4hh.jpg?alt=media&token=e751735f-f5c6-494f-b3d2-a3c090ce06cc" alt="" />
            <h3>Akshita Chauhan</h3>
            <p>Social Media Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FTechnical%2FWhatsApp_Image_2025-11-28_at_22.22.54_43301c8a_bdopox.jpg?alt=media&token=86633c89-05f1-43f8-a9d6-2f554b851db2" alt="" />
            <h3>Ananya Prasad</h3>
            <p>Social Media Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Sponsorship & PR</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FSponsorship%2FScreenshot_2025-11-28_215605_chjhpx.jpg?alt=media&token=934723bf-6fd6-487d-aad8-4967c0729c7d" alt="" />
            <h3>Kripa Jaiswal</h3>
            <p>Sponsorship & PR Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FSponsorship%2Fkhushi_x0sqri.png?alt=media&token=cdf93dab-581f-41d9-ae3d-b0ca78c0fca9" alt="" />
            <h3>Khushi</h3>
            <p>Sponsorship & PR Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Technical</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FTechnical%2FScreenshot_2025-11-28_220441_qofnvo.png?alt=media&token=7fca7e04-eff8-4735-ac9b-dd3186fc7a6b" alt=""/>       
           <h3>Shalini Yadav</h3>
            <p>Technical Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FTechnical%2FScreenshot_2025-11-28_215845.png_o49iyc.jpg?alt=media&token=74922364-3c9f-4b9f-b0d6-e818b98a285f" alt="" />
            <h3>Tanvi</h3>
            <p>Technical Head</p>
          </div>
        </section>
      </div>
    </main>
    
  );
}

export default About;
