import { useEffect } from 'react';

export const useHeaderOffset = () => {
  useEffect(() => {
    const applyHeaderOffset = () => {
      const header = document.querySelector('.site-header');
      const main = document.getElementById('main-content');
      
      if (header && main) {
        // Use requestAnimationFrame to ensure accurate measurement
        requestAnimationFrame(() => {
          const height = header.getBoundingClientRect().height;
          main.style.paddingTop = height + 'px';
        });
      }
    };

    // Apply immediately
    applyHeaderOffset();

    // Apply after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(applyHeaderOffset, 100);

    // Re-apply on resize
    window.addEventListener('resize', applyHeaderOffset);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', applyHeaderOffset);
    };
  }, []);
};










