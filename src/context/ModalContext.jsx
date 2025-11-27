import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const value = {
    showLogin,
    setShowLogin,
    showSignup,
    setShowSignup,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};