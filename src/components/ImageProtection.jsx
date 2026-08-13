import { useEffect } from 'react';

const hasBackgroundImage = (element) => {
  if (!(element instanceof HTMLElement)) return false;
  const backgroundImage = window.getComputedStyle(element).backgroundImage;
  return Boolean(backgroundImage && backgroundImage !== 'none');
};

const isImageLikeElement = (target) => {
  if (!(target instanceof Element)) return false;

  const protectedElement = target.closest(
    'img, picture, .PhotoView__Photo, .album-card-image, .blog-preview-image-container'
  );

  if (protectedElement) return true;

  let current = target;
  while (current && current instanceof HTMLElement && current !== document.body) {
    if (hasBackgroundImage(current)) return true;
    current = current.parentElement;
  }

  return false;
};

const protectImages = () => {
  document.querySelectorAll('img').forEach((image) => {
    image.setAttribute('draggable', 'false');
    image.setAttribute('oncontextmenu', 'return false;');
  });
};

const ImageProtection = () => {
  useEffect(() => {
    protectImages();

    const observer = new MutationObserver(protectImages);
    observer.observe(document.body, { childList: true, subtree: true });

    const preventImageAction = (event) => {
      if (isImageLikeElement(event.target)) {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventImageAction, true);
    document.addEventListener('dragstart', preventImageAction, true);
    document.addEventListener('copy', preventImageAction, true);
    document.addEventListener('cut', preventImageAction, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('contextmenu', preventImageAction, true);
      document.removeEventListener('dragstart', preventImageAction, true);
      document.removeEventListener('copy', preventImageAction, true);
      document.removeEventListener('cut', preventImageAction, true);
    };
  }, []);

  return null;
};

export default ImageProtection;
