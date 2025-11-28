import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AuthCallback = () => {
  const location = useLocation();
  const { login } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userDataParam = params.get('user');

    if (userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        login(userData);
        // Safely close the window if it was opened as a popup
        if (window.opener) {
          window.close();
        } else {
          // If not a popup, redirect to home or dashboard
          window.location.href = '/'; 
        }
      } catch (error) {
        console.error('Error parsing user data from URL:', error);
        // Redirect to an error page or home
        window.location.href = '/login?error=auth_failed';
      }
    } else {
      console.error('No user data found in callback URL.');
      // Redirect to an error page or home
      window.location.href = '/login?error=no_user_data';
    }
  }, [location, login]);

  return (
    <div>
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
