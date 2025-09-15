import { useState, useEffect, type FormEvent } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { type DishResponseDTO } from "../../interfaces/DishResponseDTO";
import { type CategoryResponseDTO } from "../../interfaces/CategoryResponseDTO";
import { CloudinaryImagePicker } from "../shared/CloudinaryImagePicker";
import { SafeImage } from "../shared/SafeImage";
import { ImageUploadWithSpinner } from "../shared/ImageUploadWithSpinner";

interface DishModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any, image?: File | null) => Promise<void>;
  dishToEdit?: DishResponseDTO | null;
  categories: CategoryResponseDTO[];
}

const initialFormData: any = {
  name: "",
  description: "",
  basePrice: 0,
  categoryId: "", // Empty string instead of 0
  image: null, // file object
  imageUrl: "", // URL from cloudinary
};

export function DishModal({ show, onHide, onSubmit, dishToEdit, categories }: DishModalProps) {
  const [formData, setFormData] = useState<any>(initialFormData);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloudinaryPicker, setShowCloudinaryPicker] = useState(false);

  useEffect(() => {
    if (show) {
      if (dishToEdit) {
        setFormData({
          name: dishToEdit.name || "",
          description: dishToEdit.description || "",
          basePrice: dishToEdit.basePrice || 0,
          categoryId: dishToEdit.categoryId || "",
          image: null, // khi edit chưa chọn file mới
          imageUrl: dishToEdit.image || "", // URL từ cloudinary
        });
        setPreviewImage(dishToEdit.image || null);
      } else {
        setFormData(initialFormData);
        setPreviewImage(null);
      }
    }
  }, [dishToEdit, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "categoryId" || name === "basePrice" ? Number(value) : value,
    }));
  };

  const handleImageSelect = (file: File) => {
    setFormData((prev: any) => ({ ...prev, image: file, imageUrl: "" }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCloudinarySelect = (imageUrl: string) => {
    setFormData((prev: any) => ({ ...prev, imageUrl, image: null }));
    setPreviewImage(imageUrl);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name ? formData.name.trim() : "";
    if (!trimmedName) {
      toast.error("Tên món ăn không được để trống!");
      return;
    }
    // Đồng bộ regex ký tự đặc biệt với modal Chi nhánh
    const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]+/;
    if (specialCharRegex.test(trimmedName)) {
      toast.error("Tên món ăn không được chứa ký tự đặc biệt!");
      return;
    }
    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(trimmedName)) {
      toast.error("Tên món ăn không thể chỉ chứa số!");
      return;
    }
    if (!formData.basePrice || formData.basePrice <= 5000) {
      toast.error("Giá món ăn phải là số > 5000!");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure categoryId is a number and exclude image field
      const { image, imageUrl, ...formDataWithoutImage } = formData;
      const submitData = {
        ...formDataWithoutImage,
        name: trimmedName,
        categoryId: parseInt(formData.categoryId),
        basePrice: parseFloat(formData.basePrice),
      };

      // If we have a Cloudinary URL, send it directly
      if (imageUrl) {
        const finalSubmitData = { ...submitData, image: imageUrl };
        await onSubmit(finalSubmitData, null); // No file upload needed
      } else if (image) {
        // If we have a file, send the file
        await onSubmit(submitData, image);
      } else {
        // No image provided
        await onSubmit(submitData, null);
      }
      
      onHide();
    } catch (err) {
      } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{dishToEdit ? "Chỉnh Sửa Món Ăn" : "Thêm Món Ăn Mới"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên món ăn</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên món ăn" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả món ăn (không bắt buộc)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <ImageUploadWithSpinner
                onImageSelect={handleImageSelect}
                onCloudinarySelect={() => setShowCloudinaryPicker(true)}
                disabled={isSubmitting}
              />
              {previewImage && (
                <div className="mt-2">
                  <SafeImage src={previewImage} alt="Preview" style={{ maxHeight: "120px" }} showSpinner={false} />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá (VNĐ)</Form.Label>
              <Form.Control name="basePrice" type="number" value={formData.basePrice} onChange={handleChange} placeholder="Nhập giá cơ sở" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                <option value="" disabled>
                  -- Chọn danh mục --
                </option>
                {categories
                  .filter((cat) => cat.status === "ACTIVE")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <CloudinaryImagePicker
        show={showCloudinaryPicker}
        onHide={() => setShowCloudinaryPicker(false)}
        onSelect={handleCloudinarySelect}
        title="Chọn ảnh từ Cloudinary"
      />
    </>
  );
}
