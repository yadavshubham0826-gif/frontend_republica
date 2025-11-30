import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./LoginModal.css"; // Reuse styles from LoginModal

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("request"); // 'request', 'reset'

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: 'include', // Add this line
      }); 

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setMessage(data.message);
      setTimeout(() => {
        setMessage("");
      }, 10000);
      setStep("reset"); // Move to password reset step

    } catch (err) {
      setError(err.message || "An error occurred.");
    }
    finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset password.");

      setMessage("Password has been reset successfully! You can now log in.");
      setTimeout(() => onClose(), 2000); // Close modal after a delay
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    }
    finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          ×
        </button>
        <div className="login-modal-content">
          <h2 className="login-modal-title">Forgot Password</h2>
          {step === "request" && (
            <p className="login-modal-subtitle">
              Enter your email to receive a password reset OTP.
            </p>
          )}
          {step === "reset" && (
            <>
              <p className="login-modal-subtitle">
                An OTP has been sent to <strong>{email}</strong>. Enter the OTP and your new password.
              </p>
              <p style={{ color: 'red', fontSize: '0.9em' }}>
                Sometimes Mails go to Spam Folder. Please Check Your Spam Folder.
              </p>
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {step === "request" && (
            <form onSubmit={handleSendOtp} className="email-login-form">
              <div className="form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="email-login-form">
              <div className="form-group">
                <label htmlFor="otp">Enter 6-Digit OTP</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="login-footer-text">
            Remembered your password?{" "}
            <a
              href="#"
              className="login-link"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ForgotPasswordModal;