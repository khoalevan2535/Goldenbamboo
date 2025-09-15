import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

interface ImageUploadWithSpinnerProps {
  onImageSelect: (file: File) => void;
  onCloudinarySelect: () => void;
  disabled?: boolean;
  accept?: string;
}

export const ImageUploadWithSpinner: React.FC<ImageUploadWithSpinnerProps> = ({
  onImageSelect,
  onCloudinarySelect,
  disabled = false,
  accept = "image/*"
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Simulate upload delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        onImageSelect(file);
      } catch (error) {
        } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="d-flex gap-2 mb-2">
      <div className="position-relative flex-grow-1">
        <Form.Control 
          name="image" 
          type="file" 
          accept={accept} 
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        {isUploading && (
          <div 
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1
            }}
          >
            <Spinner animation="border" size="sm" />
          </div>
        )}
      </div>
      <Button 
        variant="outline-primary" 
        onClick={onCloudinarySelect}
        disabled={disabled || isUploading}
        type="button"
      >
        {isUploading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Đang xử lý...
          </>
        ) : (
          "Chọn từ Cloud"
        )}
      </Button>
    </div>
  );
};

