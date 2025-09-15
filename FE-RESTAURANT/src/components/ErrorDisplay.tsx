import React from 'react';
import { Alert, Button, Collapse } from 'react-bootstrap';
import { ExclamationTriangle, InfoCircle, ArrowClockwise } from 'react-bootstrap-icons';
import { analyzeError, getErrorIcon, getErrorSuggestions } from '../utils/errorUtils';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  if (!error) return null;

  const errorInfo = analyzeError(error);
  const suggestions = getErrorSuggestions(error);

  const getVariant = () => {
    switch (errorInfo.type) {
      case 'network': return 'danger';
      case 'timeout': return 'warning';
      case 'cancelled': return 'secondary';
      case 'server': return 'warning';
      case 'auth': return 'danger';
      default: return 'danger';
    }
  };

  const getIcon = () => {
    switch (errorInfo.type) {
      case 'network': return <ExclamationTriangle size={20} />;
      case 'timeout': return <ExclamationTriangle size={20} />;
      case 'cancelled': return <InfoCircle size={20} />;
      case 'server': return <ExclamationTriangle size={20} />;
      case 'auth': return <ExclamationTriangle size={20} />;
      default: return <ExclamationTriangle size={20} />;
    }
  };

  return (
    <div className={className}>
      <Alert variant={getVariant()} className="mb-3">
        <div className="d-flex align-items-start">
          <div className="me-3 mt-1">
            {getIcon()}
          </div>
          <div className="flex-grow-1">
            <Alert.Heading className="h6 mb-2">
              {getErrorIcon(errorInfo.type)} {errorInfo.userMessage}
            </Alert.Heading>
            
            {showDetails && (
              <p className="mb-2 text-muted small">
                <strong>Technical details:</strong> {errorInfo.message}
              </p>
            )}

            {suggestions.length > 0 && (
              <>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 mb-2"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  {showSuggestions ? 'Hide' : 'Show'} suggestions
                </Button>
                
                <Collapse in={showSuggestions}>
                  <div>
                    <ul className="mb-2 small">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </Collapse>
              </>
            )}

            <div className="d-flex gap-2 mt-2">
              {errorInfo.canRetry && onRetry && (
                <Button size="sm" variant="outline-primary" onClick={onRetry}>
                  <ArrowClockwise className="me-1" />
                  Try Again
                </Button>
              )}
              
              {onDismiss && (
                <Button size="sm" variant="outline-secondary" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}

              {errorInfo.type === 'network' && (
                <Button 
                  size="sm" 
                  variant="outline-info"
                  onClick={() => {
                    const message = 'To start the backend server:\n\n' +
                      '1. Open a new terminal\n' +
                      '2. cd ../RESTAURANT\n' +
                      '3. mvn spring-boot:run\n\n' +
                      'Wait for "Started RestaurantApplication" message';
                    alert(message);
                  }}
                >
                  Start Backend Guide
                </Button>
              )}
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default ErrorDisplay;
