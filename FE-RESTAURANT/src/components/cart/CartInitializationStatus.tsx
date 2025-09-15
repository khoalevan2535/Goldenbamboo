import React from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

interface CartInitializationStatusProps {
  isInitialized: boolean;
  isLoading: boolean;
  error?: string | null;
}

export const CartInitializationStatus: React.FC<CartInitializationStatusProps> = ({
  isInitialized,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-blue-700">Đang khởi tạo giỏ hàng...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-700">Lỗi khởi tạo giỏ hàng: {error}</span>
        </div>
      </div>
    );
  }

  if (isInitialized) {
    return (
      <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-700">Giỏ hàng đã sẵn sàng</span>
        </div>
      </div>
    );
  }

  return null;
};







