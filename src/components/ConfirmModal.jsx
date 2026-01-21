import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  loadingText = 'Processing...',
  showProgress = false,
  progress = 0,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="confirm-modal-content">
        <button className="close-modal-btn" onClick={onClose} aria-label="Close" disabled={loading}>
          ×
        </button>
        <h2 className="modal-title">{title}</h2>
        <div className="confirm-modal-body">{children}</div>
        
        {showProgress && loading && (
          <div className="progress-bar-container" style={{ margin: '1rem 0' }}>
            <p>{loadingText} {progress.toFixed(0)}%</p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
        
        <div className="confirm-modal-actions">
          <button className="modal-button modal-secondary-btn" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button className="modal-button modal-primary-btn" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>{loadingText}</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;