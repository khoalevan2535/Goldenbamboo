import React, { useState, useEffect, type FormEvent } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { type CategoryResponseDTO } from "../../interfaces";
import { CategoryStatus, getCategoryStatusDisplayName, getCategoryStatusColor } from "../../interfaces/enums/CategoryStatus";

interface CategoryOperationalModalProps {
  show: boolean;
  onHide: () => void;
  category: CategoryResponseDTO | null;
  onSubmit: (id: string, status: CategoryStatus) => Promise<void>;
}

export function CategoryOperationalModal({ show, onHide, category, onSubmit }: CategoryOperationalModalProps) {
  const [status, setStatus] = useState<CategoryStatus>(CategoryStatus.ACTIVE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setStatus(category.status);
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    try {
      await onSubmit(category.id.toString(), status);
      onHide();
    } catch (error) {
      // Lỗi đã được xử lý bởi service
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  const currentStatus = getCategoryStatusDisplayName(category.status);
  const statusVariant = getCategoryStatusColor(category.status);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa trạng thái hoạt động</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <p>
              Bạn đang thay đổi trạng thái hoạt động cho danh mục: <strong>{category.name}</strong>
            </p>
            <p>
              Trạng thái hiện tại: <Badge bg={statusVariant}>{currentStatus}</Badge>
            </p>
          </div>
          <Form.Group>
            <Form.Label>Trạng thái mới</Form.Label>
            <Form.Select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as CategoryStatus)}
            >
              <option value={CategoryStatus.ACTIVE}>Đang hoạt động</option>
              <option value={CategoryStatus.INACTIVE}>Ngừng hoạt động</option>
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

export default CategoryOperationalModal;
