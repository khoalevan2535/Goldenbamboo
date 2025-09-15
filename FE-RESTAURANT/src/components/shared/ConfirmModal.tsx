// src/components/shared/ConfirmModal.tsx
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';

interface ConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  requiresConfirmation?: boolean;
  confirmText?: string;
  confirmVariant?: string;
  loading?: boolean;
}

export function ConfirmModal({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  requiresConfirmation = false,
  confirmText = 'Xác nhận',
  confirmVariant = 'danger',
  loading = false
}: ConfirmModalProps) {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (!show) {
      setConfirmationText('');
    }
  }, [show]);

  const isConfirmationValid = !requiresConfirmation || confirmationText === 'delete';

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {requiresConfirmation && (
          <Form.Group>
            <Form.Label>Để xác nhận, vui lòng nhập 'delete' vào ô bên dưới.</Form.Label>
            <Form.Control
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
            />
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Hủy
        </Button>
        <Button 
          variant={confirmVariant as any} 
          onClick={onConfirm} 
          disabled={!isConfirmationValid || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xử lý...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}