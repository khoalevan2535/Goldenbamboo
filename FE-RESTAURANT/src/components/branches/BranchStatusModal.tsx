import React, { useState, useEffect, type FormEvent } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { type BranchResponseDTO } from "../../interfaces";
import { BranchStatus, BranchStatusUtils } from "../../interfaces/enums/BranchStatus";

interface BranchStatusModalProps {
  show: boolean;
  onHide: () => void;
  branch: BranchResponseDTO | null;
  onSubmit: (id: number, status: BranchStatus) => Promise<void>;
}

export function BranchStatusModal({ show, onHide, branch, onSubmit }: BranchStatusModalProps) {
  const [status, setStatus] = useState<BranchStatus>(BranchStatus.ACTIVE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch) {
      setStatus(branch.status);
    }
  }, [branch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!branch) return;

    setLoading(true);
    try {
      await onSubmit(branch.id, status);
      onHide();
    } catch (error) {
      // Lỗi đã được xử lý bởi service
    } finally {
      setLoading(false);
    }
  };

  if (!branch) return null;

  const getStatusVariant = (status: BranchStatus) => {
    return BranchStatusUtils.getStatusColor(status);
  };

  const getStatusLabel = (status: BranchStatus) => {
    return BranchStatusUtils.getDisplayName(status);
  };

  const currentStatusVariant = getStatusVariant(branch.status);
  const currentStatusLabel = getStatusLabel(branch.status);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa trạng thái chi nhánh</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <p>
              Bạn đang thay đổi trạng thái cho chi nhánh: <strong>{branch.name}</strong>
            </p>
            <p>
              Trạng thái hiện tại: <Badge bg={currentStatusVariant}>{currentStatusLabel}</Badge>
            </p>
          </div>
          <Form.Group>
            <Form.Label>Trạng thái mới</Form.Label>
                         <Form.Select 
               value={status} 
               onChange={(e) => setStatus(e.target.value as BranchStatus)}
             >
               <option value={BranchStatus.OPEN}>Mở cửa</option>
               <option value={BranchStatus.INACTIVE}>Dừng hoạt động</option>
               <option value={BranchStatus.MAINTENANCE}>Bảo trì</option>
               <option value={BranchStatus.CLOSED}>Đóng cửa vĩnh viễn</option>
             </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default BranchStatusModal;
