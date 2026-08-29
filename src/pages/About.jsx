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
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FContent2026%2FManjari.jpeg?alt=media&token=20a0ae28-b7e5-4ccc-a259-b489e08f2b66" alt="" />
            <h3>Manjari Mishra</h3>
            <p>Content and Research Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FContent2026%2Fmoli.jpg?alt=media&token=68c9eb86-a8ef-42a2-affb-a7d8008827cc" alt="" />
            <h3>Moli Singh Sikarawar</h3>
            <p>Content and Research Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Creative</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FCreative2026%2FShreya%20yadav2.jpeg?alt=media&token=8e2915d4-e42f-49cb-b12c-fc2d7e83530b" alt="" />
            <h3>Shreya Yadav</h3>
            <p>Creative Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FCreative2026%2FSambhavi.jpg?alt=media&token=fea76295-683e-4617-ae29-ee39a0a50a3f" alt="" />
            <h3>Shambhavi Chauhan</h3>         
             <p>Creative Head</p>
          </div>
        </section>
        <div className="team-solo-group">
          <section className="team-section team-solo">
            <h2 className="team-title">Editor-In-Chief</h2>
            <div className="team-box">
              <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FEditor%2FSumedha.jpg?alt=media&token=2682bd3f-e479-43ec-814d-fe63c2a9bf47" alt="" />
              <h3>Sumedha Manhas</h3>
              <p>Editor-In-Chief</p>
            </div>
          </section>
          <section className="team-section team-solo">
            <h2 className="team-title">Website Lead</h2>
            <div className="team-box">
              <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FWebsite%20Lead%2FShalini%20yadav.jpg?alt=media&token=8ec441c0-3e9b-42fd-b6c6-49ef6b31d2eb" alt="" />
              <h3>Shalini Yadav</h3>
              <p>Website Head</p>
            </div>
          </section>
        </div>
         <section className="team-section team-three">
          <h2 className="team-title">Management</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FManagement%2Faadhya.jpg?alt=media&token=d8aa4076-d855-4d4d-8f5e-47f265b17097" alt="" />
            <h3>Aadhya Sinha</h3>
            <p>Management Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FManagement%2FGarima.jpg?alt=media&token=65861885-8d11-4e1e-82ff-979dbe96379a" alt="" />
            <h3>Garima Sharma</h3>
            <p>Management Head</p>
          </div>
          <div className="team-box">
            <img src="" alt="" />
            <h3>Tanisha Choudhary</h3>
            <p>Management Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Social Media</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FSocial2026%2FAaradhya.jpg?alt=media&token=8bc668b3-fc4d-4e04-8108-1c6d17b69baa" alt="" />
            <h3>Aaradhya</h3>
            <p>Social Media Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FSocial2026%2FLavanya.jpg?alt=media&token=6bfda7e3-1d84-47c4-8c1e-21f620fa25c1" alt="" />
            <h3>Lavanya Raina</h3>
            <p>Social Media Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Sponsorship & PR</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FSponsorship2026%2Fananya.jpg?alt=media&token=6fa2056a-0f81-47f8-9495-1df4550db0b8" alt="" />
            <h3>Ananya Singh</h3>
            <p>Sponsorship & PR Head</p>
          </div>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FSponsorship2026%2FDevanshi.jpeg?alt=media&token=8de99b68-4e1a-4e09-8ad5-9d8fa96ad9bb" alt="" />
            <h3>Devanshi Mahajan</h3>
            <p>Sponsorship & PR Head</p>
          </div>
        </section>

        <section className="team-section">
          <h2 className="team-title">Technical</h2>
          <div className="team-box">
            <img src="https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FTechnical%2FPriyal.jpg?alt=media&token=d3ba7656-639d-4e81-ad54-28b3632008e4" alt=""/>       
           <h3>Priyal Jain</h3>
            <p>Technical Head</p>
          </div>
          <div className="team-box">
            <img src="" alt="" />
            <h3>Prachi Ghosh</h3>
            <p>Technical Head</p>
          </div>
        </section>
      </div>
    </main>
    
  );
}

export default About;
