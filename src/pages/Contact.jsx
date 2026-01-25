import { useState, useRef, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx';
import { useUser } from '../context/UserContext';
import Notification from '../components/Notification';
import '../styles/style.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const mainRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useHeaderOffset();

  const { user } = useUser();
  const { palette, loading } = useColorPalette();
  const gradient = palette?.gradient;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/contact-submission`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message.');
      }

      setNotification({
        message: 'Thank you for your message! We will get back to you soon.',
        type: 'success'
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      setNotification({
        message: 'Sorry, there was an error sending your message.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main id="main-content" ref={mainRef}>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {/* HERO */}
      <section className="page-hero" style={{ background: gradient }}>
        <div className="container">
          <FadeInSection>
            <h1>Contact Us</h1>
            <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Get in touch with our department for inquiries, feedback and much more.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="section">
        <div className="container grid two">

          {/* LEFT COLUMN */}
          <div>
            <FadeInSection delay={0.1}>
              <h2>Department Information</h2>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="card" style={{ background: 'none', backdropFilter: 'none' }}>
                <h3>Contact Details</h3>

  <p>
  <strong>
    <a
      className="social-link gmail"
      href="mailto:republica.psa.drc@gmail.com?subject=Inquiry%20from%20Website&body=Hello%20Republica%20Team,%0D%0A%0D%0AI%20am%20writing%20to%20inquire%20about%20your%20department.%0D%0A%0D%0ARegards,"
      onClick={(e) => {
        // Desktop → Gmail Web | Mobile → Mail app
        if (window.innerWidth > 768) {
          e.preventDefault();
          window.open(
            'https://mail.google.com/mail/?view=cm&fs=1&to=republica.psa.drc@gmail.com&su=Inquiry%20from%20Website&body=Hello%20Republica%20Team,%0D%0A%0D%0AI%20am%20writing%20to%20inquire%20about%20your%20department.%0D%0A%0D%0ARegards,',
            '_blank'
          );
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600'
      }}
    >
      {/* Gmail icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M3 6.5L12 12.5L21 6.5"
          stroke="#EA4335"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          ry="2"
          stroke="#EA4335"
          strokeWidth="2"
        />
      </svg>

      {/* Email text */}
      <span style={{ color: '#000' }}>
        republica.psa.drc@gmail.com
      </span>
    </a>
  </strong>
</p>


    <p>
  <strong>
    <a
    className="social-link insta"
      href="https://www.instagram.com/republica_drc/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {/* Instagram SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>

        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
          ry="5"
          stroke="url(#instaGradient)"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="4" stroke="url(#instaGradient)" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.2" fill="url(#instaGradient)" />
      </svg>

      republica_drc
    </a>
  </strong>
</p>
<p>
  <strong>
    <a
      className="social-link linkedin"
      href="https://www.linkedin.com/in/republica-drc/" // replace with your actual LinkedIn profile
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600',
         fontSize: '18px',
         
      }}
    >
      {/* LinkedIn icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M4 4.5C4 5.328 3.328 6 2.5 6S1 5.328 1 4.5 1.672 3 2.5 3 4 3.672 4 4.5Z"
          fill="#0077B5"
        />
        <path
          d="M0 8h5v16H0V8Zm7 0h5v2h.07c.69-1.3 2.37-2.7 4.93-2.7 5.27 0 6.97 3.46 6.97 7.96V24h-5v-7.54c0-1.8-.03-4.1-2.5-4.1-2.5 0-2.88 1.95-2.88 3.96V24H7V8Z"
          fill="#0077B5"
        />
      </svg>

      {/* LinkedIn text */}
      <span style={{ color: '#0077B5' }}>Republica DRC</span>
    </a>
  </strong>
</p>
   <p>
  <strong>
    <a
      className="social-link facebook"
      href="https://www.facebook.com/share/1MVv3pRqyQ/" // replace if needed
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '18px',
        color: '#1877F2', // Facebook blue
      }}
    >
      {/* Facebook icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ flexShrink: 0 }}
      >
        <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
      </svg>

      {/* Facebook text */}
      <span>Republica DRC</span>
    </a>
  </strong>
</p>



                <hr style={{ margin: '20px 0', opacity: 0.3 }} />

                <h3>Address</h3>
                <p>
                  <strong>Republica Department of Political Science</strong><br />
                  Daulat Ram College<br />
                  University of Delhi<br />
                  4 Maurice Nagar<br />
                  New Delhi - 110007
                </p>
              </div>
            </FadeInSection>
          </div>

          {/* RIGHT COLUMN */}
          <FadeInSection delay={0.3}>
            <div className="card contact-form-card" style={{ background: 'none', backdropFilter: 'none' }}>
              <h2>Send us a Message</h2>

              <form onSubmit={handleSubmit}>
                {['name', 'email', 'subject', 'message'].map((field, idx) => (
                  <div key={idx} style={{ marginBottom: '15px' }}>
                    <label htmlFor={field}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}:
                    </label><br />

                    {field === 'message' ? (
                      <textarea
                        id={field}
                        name={field}
                        rows="4"
                        value={formData[field]}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                      />
                    ) : (
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        id={field}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                      />
                    )}
                  </div>
                ))}

                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </FadeInSection>

        </div>
      </section>
    </main>
  );
};

export default Contact;
