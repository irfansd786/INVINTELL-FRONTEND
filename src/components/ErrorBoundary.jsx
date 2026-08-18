import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[INVINTELL ErrorBoundary] Component Error Captured:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #1E293B',
          margin: '20px',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} style={{ color: '#EF4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Something went wrong displaying this section</h2>
          <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '480px', marginBottom: '24px' }}>
            An unhandled runtime interface error occurred. Operations and database records remain safe.
          </p>
          <button 
            onClick={this.handleReload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <RefreshCw size={16} /> Reload Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
