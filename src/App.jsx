import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "./context/UserContext";
import { ColorPaletteProvider } from "./context/ColorContext.jsx";
import MainLayout from "./components/MainLayout";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import AlbumDetail from "./pages/AlbumDetail";
import Gallery from "./pages/Gallery";
import Academics from "./pages/Academics";
import Contact from "./pages/Contact";
import Janmat from "./pages/Janmat";
import LatestJanmat from "./pages/LatestJanmat";
import AdminMessages from "./components/AdminMessages";
import Notifications from "./pages/Notifications.jsx";
import CreateAccount from "./pages/CreateAccount.jsx";
import AuthCallback from "./pages/AuthCallback.jsx"; // Import the new AuthCallback component
import LoadError from "./pages/LoadError.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { createFailurePath } from "./utils/failureRoute";

import { ModalProvider } from "./context/ModalContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const NotFoundRedirect = () => {
  const location = useLocation();
  const attemptedUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={createFailurePath("Page not found.", attemptedUrl)} replace />;
};

function App() {
  const googleClientId = import.meta.env.GOOGLE_CLIENT_ID; // Read from .env

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <MainLayout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/album/:albumId" element={<AlbumDetail />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/janmat" element={<Janmat />} />
              <Route path="/admin-messages" element={<AdminMessages />} />
              <Route path="/latest-janmat" element={<LatestJanmat />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/load-error" element={<LoadError />} />
              <Route path="*" element={<NotFoundRedirect />} />
            </Routes>
          </ErrorBoundary>
        </MainLayout>
      </Router>
      <Analytics />
    </GoogleOAuthProvider>
  );
}

export default App;
