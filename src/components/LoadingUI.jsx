import './LoadingUI.css';

const UNIVERSAL_LOADING_TEXT = '"Advancing political understanding..."';

const LoadingUI = ({
  detail,
  variant = 'inline',
  size = 'md',
  progress,
  className = '',
}) => {
  const hasProgress = typeof progress === 'number';
  const safeProgress = hasProgress ? Math.min(100, Math.max(0, progress)) : 0;
  const classes = ['loading-ui', `loading-ui--${variant}`, `loading-ui--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" aria-busy="true">
      <div className="loading-ui__mark" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className="loading-ui__square"></span>
        ))}
      </div>
      <div className="loading-ui__content">
        <p className="loading-ui__text">{UNIVERSAL_LOADING_TEXT}</p>
        {detail && <p className="loading-ui__detail">{detail}</p>}
        {hasProgress && (
          <div className="loading-ui__progress" aria-hidden="true">
            <span style={{ width: `${safeProgress}%` }}></span>
          </div>
        )}
      </div>
      <span className="sr-only">
        {hasProgress ? `${UNIVERSAL_LOADING_TEXT} ${Math.round(safeProgress)}% complete` : UNIVERSAL_LOADING_TEXT}
      </span>
    </div>
  );
};

export default LoadingUI;
