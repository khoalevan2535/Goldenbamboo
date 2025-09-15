import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { type StaffRequestDTO } from '../../interfaces/StaffRequestDTO';

interface StaffModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (staffData: StaffRequestDTO) => void;
  staffToEdit?: StaffRequestDTO | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({ show, onHide, onSubmit, staffToEdit }) => {
  const [formData, setFormData] = useState<StaffRequestDTO>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (staffToEdit) {
      setFormData(staffToEdit);
    } else {
      setFormData({ name: '', email: '', phone: '' });
    }
  }, [staffToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{staffToEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Tên nhân viên</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên nhân viên"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
