import { useEffect, useRef } from 'react';

export const useScrollFadeIn = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      threshold = 0.1,
      rootMargin = '0px 0px -100px 0px',
      delay = 0,
      duration = 0.6
    } = options;

    // Set initial styles
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `opacity ${duration}s ease-out, transform ${duration}s ease-out`;
    element.style.transitionDelay = `${delay}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.addEventListener('transitionend', () => {
              entry.target.style.transform = '';
            }, { once: true });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return elementRef;
};










