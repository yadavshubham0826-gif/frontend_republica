import React from 'react';
import ReactDOM from 'react-dom';
import './ConfirmModal.css';
import LoadingUI from './LoadingUI';

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
          <LoadingUI
            text={loadingText}
            detail={`${progress.toFixed(0)}% complete`}
            progress={progress}
            variant="card"
            size="sm"
            className="confirm-modal-loader"
          />
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
