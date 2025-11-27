import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

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

// Retry fetch helper
const fetchWithRetry = async (url, options = {}, retries = 5, delay = 1000) => {
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
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [loading, setLoading] = useState(true);

  const authCheckRan = useRef(false); // StrictMode protection

  // Login
  const login = (userData) => {
    if (!userData) return;

    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // AUTH CHECK (run once)
  useEffect(() => {
    if (authCheckRan.current) return;
    authCheckRan.current = true;

    const checkAuth = async () => {
      console.log("Checking backend authentication…");

      const data = await fetchWithRetry(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/check`,
        { credentials: 'include' },
        5,
        1000
      );

      if (data.authenticated && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        console.log("Authenticated:", data.user.email);
      } else {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        console.log("Not authenticated.");
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sync login/logout across tabs
  useEffect(() => {
    const handler = (event) => {
      if (event.key !== 'user') return;

      if (event.newValue) {
        login(JSON.parse(event.newValue));
      } else {
        setUser(null);
        setIsAuthenticated(false);
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
        username: user?.name || user?.displayName || null,
        userEmail: user?.email || null,
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
