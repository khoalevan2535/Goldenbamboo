import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface SessionExpiredModalProps {
  show: boolean;
  onConfirm: () => void;
  message?: string;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ 
  show, 
  onConfirm, 
  message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục." 
}) => {
  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header className="bg-warning text-dark">
        <Modal.Title>
          <i className="fas fa-exclamation-triangle me-2"></i>
          Phiên làm việc hết hạn
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <div className="mb-3">
          <i className="fas fa-clock fa-3x text-warning mb-3"></i>
          <p className="mb-0">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button 
          variant="primary" 
          onClick={onConfirm}
          className="px-4"
        >
          <i className="fas fa-sign-in-alt me-2"></i>
          Đăng nhập lại
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionExpiredModal;

