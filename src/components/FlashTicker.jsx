import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase-config';

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
        const flashQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(flashQuery);
        const result = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setItems(result.filter((item) => item.isFlash && getAttachmentUrl(item)));
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
