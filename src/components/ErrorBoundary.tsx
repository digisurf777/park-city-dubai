import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetOnPropsChange?: any; // Use this to reset boundary on route changes
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  public componentDidUpdate(prevProps: Props) {
    // Reset error boundary when props change (e.g., route changes)
    if (this.state.hasError && prevProps.resetOnPropsChange !== this.props.resetOnPropsChange) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined
      });
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Store error info for detailed display
    this.setState({
      errorInfo
    });
    
    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Add crash reporting here if needed
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-2xl">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            
            {/* Show detailed error in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 mb-2">
                  <strong>Message:</strong> {this.state.error.message}
                </p>
                <p className="text-sm text-red-700 mb-2">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-sm font-medium text-red-800 cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="text-sm font-medium text-red-800 cursor-pointer">Component Stack</summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <p className="text-muted-foreground mb-6">
              {process.env.NODE_ENV === 'development' 
                ? 'Check the console and error details above for more information.'
                : 'An error occurred while loading the application. Please try again.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                }} 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}