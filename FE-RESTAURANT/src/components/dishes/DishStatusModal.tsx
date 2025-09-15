import { useState, useEffect, type FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { ItemAvailabilityStatus } from '../../interfaces/enums/MenuItemStatus';

interface DishStatusModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (id: string, newStatus: ItemAvailabilityStatus) => void;
  dish: any | null; // Changed from Dish to any as Dish interface is removed
}

export function DishStatusModal({ show, onHide, onSubmit, dish }: DishStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ItemAvailabilityStatus>(ItemAvailabilityStatus.AVAILABLE);

  useEffect(() => {
    if (dish?.availabilityStatus) {
      setSelectedStatus(dish.availabilityStatus);
    }
  }, [dish]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (dish && dish.id) {
      onSubmit(dish.id, selectedStatus);
    }
    onHide();
  };

  if (!dish) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Đổi trạng thái món ăn</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>Món ăn: <strong>{dish.name}</strong></p>
          <Form.Group>
            <Form.Label>Chọn trạng thái mới</Form.Label>
            <Form.Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ItemAvailabilityStatus)}
            >
              {[
                { v: ItemAvailabilityStatus.AVAILABLE, l: 'Còn hàng' },
                { v: ItemAvailabilityStatus.OUT_OF_STOCK, l: 'Hết hàng' },
                { v: ItemAvailabilityStatus.DISCONTINUED, l: 'Ngừng bán' },
              ].map(s => (
                <option key={s.v} value={s.v}>{s.l}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Hủy</Button>
          <Button variant="primary" type="submit">Lưu thay đổi</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}