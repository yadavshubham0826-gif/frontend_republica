import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AuthCallback = () => {
  const location = useLocation();
  const { login } = useUser();

  useEffect(() => {
    // Get params from both React Router location and window.location (fallback)
    const routerParams = new URLSearchParams(location.search);
    const windowParams = new URLSearchParams(window.location.search);
    const userDataParam = routerParams.get('user') || windowParams.get('user');

    const isPopup = window.opener && !window.opener.closed;
    
    console.log('🔵 AuthCallback: Received callback', { 
      userDataParam: userDataParam ? 'exists' : 'missing',
      fullUrl: window.location.href,
      isPopup,
      routerSearch: location.search,
      windowSearch: window.location.search
    });

    const sendMessageToParent = (type, data) => {
      if (isPopup) {
        console.log(`📤 AuthCallback: Sending ${type} message to parent window`);
        try {
          window.opener.postMessage(
            { type, ...data },
            window.location.origin
          );
          // Give a moment for the message to be sent, then close
          setTimeout(() => {
            if (window.opener && !window.opener.closed) {
              window.close();
            }
          }, 200);
        } catch (error) {
          console.error('❌ Error sending message to parent:', error);
        }
      }
    };

    if (userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        console.log('✅ AuthCallback: Parsed user data', { id: userData.id, email: userData.email, name: userData.name });
        
        // If this is a popup window, send message to parent and close
        if (isPopup) {
          sendMessageToParent('authSuccess', { user: userData });
        } else {
          // If not a popup, login directly and redirect
          console.log('🔐 AuthCallback: Not a popup, logging in directly');
          login(userData);
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      } catch (error) {
        console.error('❌ AuthCallback: Error parsing user data:', error);
        sendMessageToParent('authError', { error: 'Failed to parse user data' });
        if (!isPopup) {
          window.location.href = '/login?error=auth_failed';
        }
      }
    } else {
      console.error('❌ AuthCallback: No user data found in callback URL.');
      sendMessageToParent('authError', { error: 'No user data received' });
      if (!isPopup) {
        window.location.href = '/login?error=no_user_data';
      }
    }
  }, [location, login]);

  return (
    <div>
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
