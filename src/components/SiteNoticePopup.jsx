import { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DOMPurify from 'dompurify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://frontend-republica.onrender.com';

const SiteNoticePopup = () => {
  const [notices, setNotices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotices = useCallback(async ({ openIfPresent = false } = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`);
      if (!response.ok) {
        throw new Error('Failed to load notices.');
      }
      const items = await response.json();
      const list = Array.isArray(items) ? items : [];
      setNotices(list);

      if (list.length === 0) {
        setIsOpen(false);
        return;
      }

      if (openIfPresent) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Unable to load site notice:', error);
    }
  }, []);

  useEffect(() => {
    loadNotices({ openIfPresent: true });
    const handleUpdate = () => loadNotices({ openIfPresent: false });
    window.addEventListener('site-notice-updated', handleUpdate);
    return () => window.removeEventListener('site-notice-updated', handleUpdate);
  }, [loadNotices]);

  if (!isOpen || notices.length === 0) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop site-notice-backdrop" role="dialog" aria-modal="true" aria-labelledby="site-notice-title">
      <div className="modal-content site-notice-popup">
        <button className="close-modal-btn" onClick={() => setIsOpen(false)} aria-label="Close notice">
          &times;
        </button>
        <p className="site-notice-kicker">Notice</p>
        {notices.map((notice, index) => (
          <article key={notice.id} className={index > 0 ? 'site-notice-item site-notice-item-follow' : 'site-notice-item'}>
            <h2 id={index === 0 ? 'site-notice-title' : undefined} className="modal-title">{notice.title}</h2>
            {notice.photo?.url && (
              <div className="site-notice-image-wrap">
                <img className="site-notice-image" src={notice.photo.url} alt={notice.title} />
              </div>
            )}
            {notice.body && (
              <div
                className="site-notice-body"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.body) }}
              />
            )}
            {notice.linkUrl && (
              <a
                className="site-notice-link"
                href={notice.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open link
              </a>
            )}
          </article>
        ))}
        <div className="modal-actions">
          <button type="button" className="modal-button modal-primary-btn" onClick={() => setIsOpen(false)}>
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SiteNoticePopup;
