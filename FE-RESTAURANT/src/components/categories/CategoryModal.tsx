import { useState, useEffect, type FormEvent } from "react";
import { type CategoryResponseDTO, type CategoryRequestDTO } from "../../interfaces";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

interface CategoryModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (categoryData: CategoryRequestDTO) => Promise<void>;
  categoryToEdit?: CategoryResponseDTO | null;
}

const initialFormState: CategoryRequestDTO = {
  name: "",
  description: "",
};

export function CategoryModal({ show, onHide, onSubmit, categoryToEdit }: CategoryModalProps) {
  // ✅ Gom state của form vào một object duy nhất
  const [formData, setFormData] = useState<CategoryRequestDTO>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        description: categoryToEdit.description,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [categoryToEdit, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error("Tên danh mục không được để trống!");
      return;
    }
    // ... các validation khác giữ nguyên ...

    setIsSaving(true);
    // ✅ Loại bỏ trường createdBy không hợp lệ
    await onSubmit({ name: trimmedName, description: formData.description });
    setIsSaving(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{categoryToEdit ? "Sửa Danh mục" : "Thêm Danh mục mới"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="categoryName" className="mb-3">
            <Form.Label>Tên danh mục</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên danh mục"
              autoFocus
            />
          </Form.Group>
          <Form.Group controlId="categoryDescription">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              name="description"
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả cho danh mục"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// ✅ Thêm export default để import dễ dàng hơn
export default CategoryModal;
