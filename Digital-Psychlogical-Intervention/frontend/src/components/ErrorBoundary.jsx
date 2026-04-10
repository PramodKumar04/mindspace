import React from 'react';

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.75rem',
  },
  message: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '2rem',
    color: '#fca5a5',
    fontSize: '0.8rem',
    textAlign: 'left',
    fontFamily: 'monospace',
    wordBreak: 'break-word',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryBtn: {
    padding: '11px 24px',
    borderRadius: '10px',
    border: 'none',
    background: '#6366f1',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  outlineBtn: {
    padding: '11px 24px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.page}>
          <div style={s.card}>
            <div style={s.icon}>⚠️</div>
            <h1 style={s.title}>Something went wrong</h1>
            <p style={s.message}>
              An unexpected error occurred. You can try again or return to the home page.
            </p>
            {this.state.error && (
              <div style={s.errorBox}>
                {this.state.error.message}
              </div>
            )}
            <div style={s.btnRow}>
              <button style={s.outlineBtn} onClick={this.handleReset}>
                Try again
              </button>
              <button style={s.primaryBtn} onClick={this.handleGoHome}>
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
