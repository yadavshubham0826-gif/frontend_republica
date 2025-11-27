import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SocialMediaSidebar from './SocialMediaSidebar';

const MainLayout = ({ children }) => {
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