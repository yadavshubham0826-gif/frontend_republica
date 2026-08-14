import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://frontend-republica.onrender.com';

const getAttachmentUrl = (item) => {
  if (item.attachmentType === 'url') return item.linkUrl;
  if (item.attachmentType === 'pdf') return item.document?.url;
  if (item.attachmentType === 'image') return item.photo?.url;
  return '';
};

const FlashTicker = () => {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadFlashItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/flash`);
        const result = await response.json();
        if (response.ok) setItems(result.filter((item) => getAttachmentUrl(item)));
      } catch (error) {
        console.error('Unable to load flash messages:', error);
      }
    };

    loadFlashItems();
  }, []);

  useEffect(() => {
    if (isPaused || items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused, items.length]);

  const activeItem = useMemo(() => items[activeIndex], [items, activeIndex]);
  if (!activeItem) return null;

  const move = (direction) => {
    setActiveIndex((index) => (index + direction + items.length) % items.length);
  };

  const openItem = () => {
    const url = getAttachmentUrl(activeItem);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="flash-ticker" aria-label="Latest news">
      <div className="flash-ticker-label">Latest News</div>
      <button type="button" className="flash-ticker-message" onClick={openItem} title="Open in a new tab">
        {activeItem.title}
      </button>
      <div className="flash-ticker-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous message">‹</button>
        <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? 'Play messages' : 'Pause messages'}>
          {isPaused ? '▶' : 'Ⅱ'}
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Next message">›</button>
      </div>
    </section>
  );
};

export default FlashTicker;
