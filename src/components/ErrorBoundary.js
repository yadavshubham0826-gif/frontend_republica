import React from 'react';
import { createFailurePath, FALLBACK_ERROR_MESSAGE } from '../utils/failureRoute';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    if (window.location.pathname !== '/load-error') {
      window.location.assign(createFailurePath(error?.message || FALLBACK_ERROR_MESSAGE));
    }
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { style: { padding: '20px', textAlign: 'center' } },
        React.createElement('h1', null, 'Something went wrong.'),
        React.createElement('p', null, this.state.error?.message || FALLBACK_ERROR_MESSAGE)
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
