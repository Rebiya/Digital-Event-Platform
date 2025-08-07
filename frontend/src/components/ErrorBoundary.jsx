import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-800 rounded-lg">
          <div className="text-center text-white">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-sm">Something went wrong while rendering a participant.</div>
            <button 
              className="mt-2 px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 