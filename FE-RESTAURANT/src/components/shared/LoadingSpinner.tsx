import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | undefined;
  className?: string;
}

export default function LoadingSpinner({ size, className }: LoadingSpinnerProps) {
  return (
    <div className={`d-flex justify-content-center align-items-center p-4 ${className || ''}`}>
      <Spinner animation="border" size={size} role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}
