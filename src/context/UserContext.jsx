import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

// Create UserContext
export const UserContext = createContext(null);

// Helper: safely get user from localStorage
const getInitialUser = () => {
  const storedUser = localStorage.getItem('user');
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

// Retry fetch helper
const fetchWithRetry = async (url, options = {}, retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error("Backend not ready");
      return await response.json();
    } catch (err) {
      console.log(`Attempt ${i + 1} failed: ${err.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  console.error("Backend unreachable after retries.");
  return { authenticated: false };
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getInitialUser());
  const [loading, setLoading] = useState(true);
  const authCheckEffectRan = useRef(false); // Prevent double-run in Strict Mode

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
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        console.log("Backend logout successful.");
      } else {
        console.warn("Backend logout: success=false");
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      console.log("Client-side logout complete.");
    }
  };

  // AUTH CHECK — RUN ONCE, RETRY 5 TIMES
  useEffect(() => {
    if (authCheckEffectRan.current) return; // block second StrictMode run
    authCheckEffectRan.current = true;

    const checkAuthStatus = async () => {
      console.log("Checking auth status with backend (5 retries)...");

      const data = await fetchWithRetry(
        '/api/auth/check', // Use the proxied path
        { credentials: 'include' },
        5,
        1000
      );

      if (data.authenticated && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        console.log("User authenticated:", data.user.email);
      } else {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        console.log("User NOT authenticated.");
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'user') {
        if (event.newValue) {
          login(JSON.parse(event.newValue));
        } else {
          logout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Popup OAuth communication
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'authSuccess' && event.data.user) {
        console.log("Popup auth success:", event.data.user);
        login(event.data.user);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loading) {
    return <div></div>;
  }

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
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
