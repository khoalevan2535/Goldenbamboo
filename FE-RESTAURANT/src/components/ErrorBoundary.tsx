import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';
import { ExclamationTriangle, ArrowClockwise, House } from 'react-bootstrap-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
    
    // Log specific JSON parsing errors
    if (error.message.includes('Unexpected token') || 
        error.message.includes('<!doctype') ||
        error.message.includes('is not valid JSON')) {
      console.error('JSON Parsing Error - Backend may be returning HTML instead of JSON');
      console.error('Backend URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080/api');
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <Card className="shadow-lg border-0" style={{ maxWidth: '600px' }}>
            <Card.Body className="text-center p-5">
              <ExclamationTriangle size={64} className="text-danger mb-4" />
              
              {this.state.error?.message.includes('Unexpected token') || 
               this.state.error?.message.includes('<!doctype') ||
               this.state.error?.message.includes('is not valid JSON') ? (
                <>
                  <h2 className="text-warning mb-3">🔌 Backend Connection Error</h2>
                  <Alert variant="warning" className="text-start">
                    <Alert.Heading>Backend Server Issue:</Alert.Heading>
                    <p className="mb-2">
                      The backend server may be down or returning invalid data.
                    </p>
                    <p className="mb-0">
                      <strong>Backend URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}
                    </p>
                  </Alert>
                </>
              ) : (
                <>
                  <h2 className="text-danger mb-3">Oops! Có lỗi xảy ra</h2>
                  <Alert variant="danger" className="text-start">
                    <Alert.Heading>Chi tiết lỗi:</Alert.Heading>
                    <p className="mb-0">
                      <strong>{this.state.error?.name}:</strong> {this.state.error?.message}
                    </p>
                  </Alert>
                </>
              )}

              <div className="mb-4">
                <p className="text-muted">
                  Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ kỹ thuật.
                </p>
              </div>

              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  variant="primary" 
                  onClick={this.handleRetry}
                  className="px-4"
                >
                  <ArrowClockwise className="me-2" />
                  Thử lại
                </Button>
                
                <Button 
                  variant="outline-primary" 
                  onClick={this.handleReload}
                  className="px-4"
                >
                  Tải lại trang
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={this.handleGoHome}
                  className="px-4"
                >
                  <House className="me-2" />
                  Về trang chủ
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="text-muted cursor-pointer">
                    Chi tiết kỹ thuật (Development)
                  </summary>
                  <pre className="text-start mt-3 p-3 bg-light border rounded small">
                    {this.state.error && this.state.error.stack}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: string) => {
    // You can integrate with error reporting service here
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo);
    }
  }, []);

  return handleError;
};




