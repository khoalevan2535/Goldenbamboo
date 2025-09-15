import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | 'lg';
  message?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  message = 'Đang tải...',
  overlay = false,
  fullScreen = false,
  className = ''
}) => {
  const containerClass = fullScreen 
    ? 'd-flex justify-content-center align-items-center min-vh-100'
    : 'd-flex justify-content-center align-items-center p-4';

  const overlayStyle = overlay ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  } : {};

  const content = (
    <div className="text-center">
      <Spinner 
        animation="border" 
        variant="primary" 
        size={size}
        className="mb-3"
      />
      {message && (
        <div className="text-muted">
          {message}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div style={overlayStyle}>
        {content}
      </div>
    );
  }

  return (
    <Container className={`${containerClass} ${className}`}>
      {content}
    </Container>
  );
};

// Skeleon loader component
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  height?: string;
  className?: string;
}> = ({ 
  lines = 3, 
  height = '20px',
  className = ''
}) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className="bg-gray-200 rounded mb-2"
        style={{ 
          height,
          width: index === lines - 1 ? '75%' : '100%'
        }}
      />
    ))}
  </div>
);

// Page loading wrapper
export const PageLoader: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode;
  message?: string;
}> = ({ loading, children, message }) => {
  if (loading) {
    return <LoadingSpinner fullScreen message={message} />;
  }
  
  return <>{children}</>;
};





