import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useUser } from '../context/UserContext';
import "./LoginModal.css";
import ForgotPasswordModal from "./ForgotPasswordModal";

const LoginModal = ({ onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { login, isAuthenticated } = useUser();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");

    const googleLoginUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      googleLoginUrl,
      "Google Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  // When the user becomes authenticated globally, close this modal.
  useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/email-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      let data;
      try { data = await response.json(); } catch { data = {}; }

      if (!response.ok) {
        // This block handles all non-200 responses, including 401
        if (response.status === 401) {
          // Case 1: User does not exist
          if (data.error === 'Email not registered.') {
            setError(
              <>
                Looks! Like You are New?{' '}
                <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>
                  Create an Account
                </a>
              </>
            );
          // Case 2: User exists but signed up with Google
          } else if (data.error === 'google_auth_required') {
            setError(
              <>
                This account is linked to Google. Please{' '}
                <a
                  href="#"
                  className="login-link"
                  onClick={(e) => { e.preventDefault(); handleGoogleLogin(); }}
                >
                  Continue with Google
                </a>.
              </>
            );
          } else if (data.error === 'Incorrect password.') {
            // Case 3: Specifically for incorrect password
            setError('The password you entered is incorrect.');
          } else {
            // Case 4: For any other 401 error
            setError('Invalid Credentials');
          }
        } else {
          // For other server errors (500, etc.)
          setError(data.error || 'An unexpected error occurred.');
        }
      } else {
        // This handles a successful login (status 200)
        if (data.success && data.user) {
          login(data.user);
          onClose();
          setToastMessage(`Welcome back, ${data.user.name.split(' ')[0]}!`);
          setShowToast(true);
        } else {
          setError(data.message || "An unexpected error occurred. Please try again.");
        }
      }
    } catch (err) {
      console.error("Email login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className={`toast-success ${showToast ? 'show' : ''}`}>{toastMessage}</div>
      <div className="login-modal-backdrop" onClick={onClose}>
        <div className="login-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="login-modal-content">
            <h2 className="login-modal-title">Welcome Back</h2>
            <p className="login-modal-subtitle">Log in to continue to the website.</p>

            {error && <div className="error-message">{error}</div>}

            <button className="google-login-btn" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="google-icon" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="divider"><span>OR</span></div>

            <form onSubmit={handleEmailLogin} className="email-login-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input id="login-email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input id="login-password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="forgot-password-link-container">
                <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); setShowForgotPasswordModal(true); }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Logging In..." : "Log In"}
              </button>
            </form>

            <div className="login-footer-text">
              Don’t have an account?{" "}
              <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); if (onSwitchToSignup) onSwitchToSignup(); }}>
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {showForgotPasswordModal && <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />}
      </div>
    </>,
    document.body
  );
};

export default LoginModal;
