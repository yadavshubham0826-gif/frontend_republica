import { useState, useRef, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useHeaderOffset } from '../hooks/useHeaderOffset';
import { useColorPalette } from '../context/ColorContext.jsx';
import { useUser } from '../context/UserContext';
import Notification from '../components/Notification';
import '../styles/style.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const mainRef = useRef(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => window.scrollTo(0, 0), []);
  useHeaderOffset();

  const { user } = useUser();
  const { palette, loading } = useColorPalette();
  const gradient = palette.gradient;

  const authorizedAdmins = ["10shubhamyadav@gmail.com", "15shubhamyadav@gmail.com"];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      // Use the backend API to submit the contact form
      const response = await fetch("http://localhost:5000/api/contact-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message.');
      }

      setNotification({ message: 'Thank you for your message! We will get back to you soon.', type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message: ", error);
      setNotification({ message: 'Sorry, there was an error sending your message. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading gradient...</p>;

  return (
    <main id="main-content" ref={mainRef}>
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />

      <section className="page-hero" style={{ background: gradient }}>
        <div className="container">
          <FadeInSection>
            <h1>Contact Us</h1>
            <p>Get in touch with our department for admissions, inquiries, and more.</p>
          </FadeInSection>
        </div>
      </section>

      <section className="section">
        <div className="container grid two">
          <div>
            <FadeInSection delay={0.1}>
              <h2>Department Information</h2>
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <div className="card" style={{ background: 'none', backdropFilter: 'none' }}>
                <h3>Contact Details</h3>
                <p><strong>Email:</strong> polscience@daulatramcollege.edu</p>
                <p><strong>Phone:</strong> +91-11-XXXX-XXXX</p>
                <p><strong>Office Hours:</strong> Monday to Friday, 9:00 AM - 5:00 PM</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="card" style={{ background: 'none', backdropFilter: 'none' }}>
                <h3>Address</h3>
                <p>
                  <strong>Republica Department of Political Science</strong><br />
                  Daulat Ram College<br />
                  University of Delhi<br />
                  4, Patel Marg, Maurice Nagar<br />
                  New Delhi - 110007
                </p>
              </div>
            </FadeInSection>
          </div>

          <FadeInSection delay={0.4}>
            <div id="message-form" className="card contact-form-card" style={{ background: 'none', backdropFilter: 'none' }}>
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                {['name','email','subject','message'].map((field, idx) => (
                  <div key={idx} style={{ marginBottom: '15px' }}>
                    <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label><br />
                    {field === 'message' ? (
                      <textarea id={field} name={field} rows="4" value={formData[field]} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    ) : (
                      <input type={field === 'email' ? 'email' : 'text'} id={field} name={field} value={formData[field]} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    )}
                  </div>
                ))}
                <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
              </form>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="section light">
        <div className="container">
          <FadeInSection delay={0.5}>
            <h2>Faculty Contact</h2>
          </FadeInSection>
          <div className="grid three">
            {[
              { name: 'Dr. Rajesh Kumar', title: 'Head of Department', email: 'rajesh.kumar@daulatramcollege.edu' },
              { name: 'Dr. Priya Sharma', title: 'Associate Professor', email: 'priya.sharma@daulatramcollege.edu' },
              { name: 'Dr. Amit Singh', title: 'Assistant Professor', email: 'amit.singh@daulatramcollege.edu' }
            ].map((faculty, idx) => (
              <FadeInSection key={idx} delay={0.6 + idx*0.1}>
                <div className="card" style={{ background: 'none', backdropFilter: 'none' }}>
                  <h3>{faculty.name}</h3>
                  <p><strong>{faculty.title}</strong></p>
                  <p>Email: {faculty.email}</p>
                  <p>Phone: +91-11-XXXX-XXXX</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
