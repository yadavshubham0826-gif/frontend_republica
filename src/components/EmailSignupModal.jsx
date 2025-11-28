import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useUser } from '../context/UserContext';
import "./EmailSignupModal.css"; // Your CSS file

const EmailSignupModal = ({ onClose = () => {}, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [step, setStep] = useState("email"); // email, otp, password, success
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false); // ✅ New state
  const { user, login } = useUser();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const displayError = (err) => setError(err);
  const displayMessage = (msg) => setMessage(msg);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return displayError("Please enter a valid email");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(
          <>
            Email already exists. Please{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
            >
              log in
            </a>.
          </>
        );
        return;
      }
      if (res.ok) {
        setStep("otp");
        setTimer(60);
        displayMessage("OTP sent to your email.");
      } else displayError(data.message || "Failed to send OTP");
    } catch (err) {
      console.error(err);
      displayError("Server error while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return displayError("Please enter OTP");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("password");
        setMessage("✅ OTP verified! Continue creating your account.");
        setTimeout(() => setMessage(""), 2000);
      } else displayError(data.message || "Invalid OTP");
    } catch (err) {
      console.error(err);
      displayError("Server error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name) return displayError("Please enter your name.");
    if (!dateOfBirth) return displayError("Please enter your date of birth.");
    if (!password || !confirmPassword) return displayError("Please enter password.");
    if (password !== confirmPassword) return displayError("Passwords do not match.");
    if (password.length < 6) return displayError("Password must be at least 6 characters.");

    // Age validation
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 13) return displayError("You must be at least 13 years old.");

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/email-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, dateOfBirth, role: 'user' }), // Ensure role is sent to backend
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user) login(data.user);
        setShowCongrats(true); // ✅ Show popup
      } else displayError(data.message || "Signup failed.");
    } catch (err) {
      console.error(err);
      displayError("Server error while creating account.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    await handleSendOtp(new Event("submit"));
  };

  const handleCongratsClose = () => {
    setShowCongrats(false);
    onClose(); // Close modal after user presses OK
  };

  const goBack = () => {
    if (step === "otp") setStep("email");
    if (step === "password") setStep("otp");
  };

  return ReactDOM.createPortal(
    <div className="login-modal-backdrop">
      <div className="login-modal">
        <button className="close-modal-btn" onClick={onClose}>
          ×
        </button>
        <div className="login-modal-content">
          {/* ✅ Congrats Popup - Moved inside */}
          {showCongrats && (
            <div className="welcome-popup-overlay">
              <div className="welcome-popup">
                <h3>Hey, {name}!</h3>
                <p>You are Registered Successfully.</p>
                <button className="submit-btn" onClick={handleCongratsClose}>
                  OK
                </button>
              </div>
            </div>
          )}
          {step !== "email" && (
            <button onClick={goBack} className="back-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          )}

          <h2 className="login-modal-title">
            {step === "email" && "Create an Account"}
            {step === "otp" && "Verify Your Email"}
            {step === "password" && "Set Up Your Profile"}
          </h2>
          <p className="login-modal-subtitle">
            {step === "email" && "Enter your email to get started."}
            {step === "otp" && `We sent a code to ${email}.`}
            {step === "password" && "Just one last step!"}
          </p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="email-signup-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? "Sending..." : "Continue"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="email-signup-form">
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <p className="otp-spam-note">
                Please Check Your Spam Folder Also for OTP.
              </p>
              <button type="button" onClick={handleResendOtp} className="resend-btn" disabled={timer > 0}>
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleSignup} className="email-signup-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input id="confirm-password" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EmailSignupModal;
