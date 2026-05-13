import { useSearchParams } from 'react-router-dom';
import { FALLBACK_ERROR_MESSAGE } from '../utils/failureRoute';
import '../styles/LoadError.css';

const LoadError = () => {
  const [searchParams] = useSearchParams();
  const attemptedUrl = searchParams.get('url') || window.location.pathname;
  const cause = searchParams.get('cause') || FALLBACK_ERROR_MESSAGE;
  const devMailUrl = `mailto:10shubhamyadav@gmail.com?subject=${encodeURIComponent('Website load error')}&body=${encodeURIComponent(
    `Hello Dev,\n\nA page failed to load.\n\nDestination URL: ${attemptedUrl}\nCause: ${cause}\n\nIMPORTANT: Please attach a screenshot of the problem before sending this email.\n\nPlease check this when possible.`
  )}`;

  return (
    <main id="main-content" className="load-error-page">
      <section className="load-error-panel" aria-labelledby="load-error-title">
        <p className="load-error-kicker">Page could not be loaded</p>
        <h1 id="load-error-title">Something interrupted this request.</h1>

        <div className="load-error-info">
          <span>Destination URL</span>
          <code>{attemptedUrl}</code>
        </div>

        <div className="load-error-info">
          <span>Cause</span>
          <p>{cause}</p>
        </div>

        <div className="load-error-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.assign(attemptedUrl)}>
            Try Again
          </button>
          <a href={devMailUrl} className="btn load-error-dev-btn">
            Contact the Dev
          </a>
        </div>
      </section>
    </main>
  );
};

export default LoadError;
