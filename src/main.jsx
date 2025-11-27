import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ModalProvider } from './context/ModalContext';
import { ColorPaletteProvider } from './context/ColorContext.jsx'; // Use the new provider with .jsx
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap all providers around the App */}
    <UserProvider>
      <ModalProvider>
        <ColorPaletteProvider> {/* 2. Add the ColorProvider here */}
          <App />
        </ColorPaletteProvider>
      </ModalProvider>
    </UserProvider>
  </React.StrictMode>
);
