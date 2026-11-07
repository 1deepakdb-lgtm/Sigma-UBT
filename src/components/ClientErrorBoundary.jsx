'use client';

import React from 'react';

export default class ClientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Client component render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #fecaca',
          padding: '32px 24px',
          margin: '24px auto',
          maxWidth: '680px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '24px'
          }}>
            ⚠
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#991b1b' }}>
            {this.props.fallbackTitle || 'Component Error Occurred'}
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh the page or restart the application.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              🔄 Refresh Page
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/admin'; }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

