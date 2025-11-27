// LoginButton.jsx
import React from "react";

const LoginButton = ({ onLoginClick }) => {
  // This component no longer manages modals or auth state.
  // It only tells the Header to open the login modal.
  return (
    <>
      <button className="login-btn" onClick={onLoginClick}>
        Login
      </button>
    </>
  );
};

export default LoginButton;
