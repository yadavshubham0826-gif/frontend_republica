import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SocialMediaSidebar from './SocialMediaSidebar';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isFallbackPage = location.pathname === '/load-error';

  if (isFallbackPage) {
    return children;
  }

  return (
    <>
      <Header />
      {children}
      <SocialMediaSidebar />
      <Footer />
    </>
  );
};

export default MainLayout;
