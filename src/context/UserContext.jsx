import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase-config';

// Create UserContext
export const UserContext = createContext(null);

// Helper: safely get user from localStorage
const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    return null;
  }
};

// Retry fetch helper (default retries = 1)
const fetchWithRetry = async (url, options = {}, retries = 1, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        if (response.headers.get("content-type")?.includes("text/html")) {
          throw new Error(`Backend returned HTML (route missing or server down).`);
        }
        throw new Error(`Backend responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed: ${err.message}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }

  console.error("Backend unreachable after retries.");
  return { authenticated: false };
};

export const UserProvider = ({ children }) => {
  const initialUser = getInitialUser();

  const [user, setUser] = useState(initialUser);
  const [username, setUsername] = useState(initialUser?.name || initialUser?.displayName || null);
  const [userEmail, setUserEmail] = useState(initialUser?.email || null);
  const [role, setRole] = useState(initialUser?.role || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [loading, setLoading] = useState(true);

  const authCheckRan = useRef(false); // StrictMode protection

  // Login
  const login = async (userData) => {
    if (!userData) return;

    // If customToken exists, sign in to Firebase Auth
    if (userData.customToken) {
      try {
        await signInWithCustomToken(auth, userData.customToken);
        console.log('✅ Successfully signed in to Firebase Auth');
      } catch (error) {
        console.error('❌ Error signing in to Firebase Auth:', error);
        // Continue with login even if Firebase Auth fails (for backward compatibility)
      }
    }

    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setUsername(userData.name || userData.displayName || null);
    setUserEmail(userData.email || null);
    setRole(userData.role || null);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = async () => {
    try {
      // Sign out from Firebase Auth
      try {
        await firebaseSignOut(auth);
        console.log('✅ Successfully signed out from Firebase Auth');
      } catch (error) {
        console.error('❌ Error signing out from Firebase Auth:', error);
      }

      // Sign out from backend session
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) console.warn("Backend logout: success=false");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setUsername(null);
      setUserEmail(null);
      setRole(null);
      setIsAuthenticated(false);
    }
  };

  // ⚡ FAST AUTH LOAD — no backend request on page load
  useEffect(() => {
    // User from localStorage already loaded
    // If user exists and has customToken, sign in to Firebase Auth
    if (initialUser?.customToken) {
      signInWithCustomToken(auth, initialUser.customToken)
        .then(() => {
          console.log('✅ Re-authenticated with Firebase Auth on page load');
        })
        .catch((error) => {
          console.error('❌ Error re-authenticating with Firebase Auth:', error);
          // If token is expired or invalid, try to get a new one from backend
          // For now, just continue - user can still use backend session
        });
    }
    setLoading(false);
  }, []);

  // Sync login/logout across tabs
  useEffect(() => {
    const handler = (event) => {
      if (event.key !== 'user') return;

      if (event.newValue) {
        const stored = JSON.parse(event.newValue);
        login(stored);
      } else {
        logout();
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Popup OAuth communication
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'authSuccess' && event.data.user) {
        login(event.data.user);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) return <div></div>;

  return (
    <UserContext.Provider
      value={{
        user,
        username,
        userEmail,
        role,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
