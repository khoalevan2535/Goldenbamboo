import { useState, useEffect, type FormEvent } from "react";
import { BranchStatus, BranchStatusUtils } from "../../interfaces/enums/BranchStatus";
import { Modal, Button, Form } from "react-bootstrap";

interface StatusUpdateModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (newStatus: BranchStatus) => void;
  branch: Branch | null;
}

export function StatusUpdateModal({ show, onHide, onSubmit, branch }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<BranchStatus>(BranchStatus.OPEN);

  useEffect(() => {
    if (branch) {
      setSelectedStatus(branch.status);
    }
  }, [branch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(selectedStatus);
    onHide();
  };

  if (!branch) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Đổi trạng thái</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>
            Chi nhánh: <strong>{branch.name}</strong>
          </p>
          <Form.Group>
            <Form.Label>Chọn trạng thái mới</Form.Label>
                         <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as BranchStatus)}>
               <option value={BranchStatus.OPEN}>Mở cửa</option>
               <option value={BranchStatus.INACTIVE}>Dừng hoạt động</option>
               <option value={BranchStatus.MAINTENANCE}>Bảo trì</option>
               <option value={BranchStatus.CLOSED}>Đóng cửa vĩnh viễn</option>
             </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
