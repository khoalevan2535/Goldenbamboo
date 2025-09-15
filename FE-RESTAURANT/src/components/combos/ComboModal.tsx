import { useState, useEffect, type FormEvent } from "react";
import { toast } from "react-toastify";
import type { ComboRequestDTO } from "../../interfaces/ComboRequestDTO";
import type { ComboResponseDTO } from "../../interfaces/ComboResponseDTO";
import { Modal, Button, Form, Table, Row, Col, Spinner, Badge } from "react-bootstrap";
import "./ComboModal.css";
import { useDishes } from "../../hooks/useDishes";
import { type DishResponseDTO } from "../../interfaces/DishResponseDTO";
import { CloudinaryImagePicker } from "../shared/CloudinaryImagePicker";
import { SafeImage } from "../shared/SafeImage";
import { ImageUploadWithSpinner } from "../shared/ImageUploadWithSpinner";

interface ComboModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: ComboRequestDTO, image?: File) => Promise<void>;
  comboToEdit: ComboResponseDTO | null;
}

const initialFormData: ComboRequestDTO = {
  name: "",
  description: "",
  image: null,
  basePrice: 0,
  comboItems: [],
};

export function ComboModal({ show, onHide, onSubmit, comboToEdit }: ComboModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ComboRequestDTO>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(""); // URL from cloudinary
  const [baselinePrice, setBaselinePrice] = useState<number>(0); // Tổng giá các món đã chọn
  const [showCloudinaryPicker, setShowCloudinaryPicker] = useState(false);

  const { dishPage, loading, fetchDishes } = useDishes();
  const dishes = dishPage?.content || [];
  
  // Kiểm tra xem có món ngừng hoạt động nào được chọn không
  const hasInactiveDishes = formData.comboItems.some(item => {
    const dish = dishes.find(d => String(d.id) === item.dishId);
    return dish && dish.operationalStatus !== 'ACTIVE';
  });
  const [dishKeyword, setDishKeyword] = useState('');

  useEffect(() => {
    if (show) {
      // Không filter theo status để hiển thị tất cả dishes (bao gồm cả ngừng hoạt động)
      fetchDishes({ name: dishKeyword });
    }
  }, [show, fetchDishes, dishKeyword]);

  useEffect(() => {
    if (show) {
      if (comboToEdit) {
        if (dishes.length > 0 && !loading) {
          // Có dishes và không loading - có thể set form data
          setFormData({
            name: comboToEdit.name,
            description: comboToEdit.description,
            image: null,
            basePrice: comboToEdit.basePrice,
            comboItems:
              comboToEdit.comboDishes?.map((d) => {
                const dish = dishes.find((ds) => String(ds.id) === String(d.dishId));
                return {
                  dishId: String(d.dishId),
                  quantity: d.quantity || 1,
                  price: dish?.basePrice ?? 0,
                };
              }) ?? [],
          });
          setPreviewUrl(comboToEdit.image || "");
          setImageUrl(comboToEdit.image || "");
          setImageFile(null);
          // Tính baseline theo danh sách món
          const sum = (comboToEdit.comboDishes ?? []).reduce((acc, item) => {
            const dish = dishes.find((ds) => String(ds.id) === String(item.dishId));
            const price = dish?.basePrice ?? 0;
            const qty = item.quantity ?? 1;
            return acc + price * qty;
          }, 0);
          setBaselinePrice(sum);
        }
        // Nếu đang loading hoặc chưa có dishes, chờ useEffect tiếp theo
      } else {
        // Không có comboToEdit - reset form
        setFormData(initialFormData);
        setPreviewUrl("");
        setImageUrl("");
        setImageFile(null);
        setBaselinePrice(0);
      }
      setError(null);
    }
  }, [show, comboToEdit, dishes, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "basePrice" ? Number(value) : value }));
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(""); // Clear cloudinary URL when file is selected
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCloudinarySelect = (selectedImageUrl: string) => {
    setImageUrl(selectedImageUrl);
    setImageFile(null); // Clear file when cloudinary URL is selected
    setPreviewUrl(selectedImageUrl);
  };

  const handleSelectDish = (dishId: number, checked: boolean) => {
    setFormData((prev) => {
      const dishIdStr = String(dishId);
      if (checked) {
        if (prev.comboItems.some((d) => d.dishId === dishIdStr)) return prev;
        const dish = dishes.find((ds) => String(ds.id) === dishIdStr);
        const newComboItems = [...prev.comboItems, { dishId: dishIdStr, quantity: 1, price: dish?.basePrice ?? 0 }];
        const newBaseline = newComboItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
        setBaselinePrice(newBaseline);
        return { ...prev, comboItems: newComboItems };
      } else {
        const newComboItems = prev.comboItems.filter((d) => d.dishId !== dishIdStr);
        const newBaseline = newComboItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
        setBaselinePrice(newBaseline);
        return { ...prev, comboItems: newComboItems };
      }
    });
  };

  const handleChangeQuantity = (dishId: number, quantity: number) => {
    setFormData((prev) => {
      const newComboItems = prev.comboItems.map((d) => (d.dishId === String(dishId) ? { ...d, quantity } : d));
      const newBaseline = newComboItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
      setBaselinePrice(newBaseline);
      return { ...prev, comboItems: newComboItems };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name ? formData.name.trim() : "";
    if (!trimmedName) {
      setError("Tên combo không được để trống!");
      toast.error("Tên combo không được để trống!");
      return;
    }
    // Đồng bộ regex ký tự đặc biệt với modal Chi nhánh/Món ăn
    const specialCharRegex = /[!@#$%^*()_+=\[\]{};':"|,.<>?]+/;
    if (specialCharRegex.test(trimmedName)) {
      setError("Tên combo không được chứa ký tự đặc biệt!");
      toast.error("Tên combo không được chứa ký tự đặc biệt!");
      return;
    }
    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(trimmedName)) {
      setError("Tên combo không thể chỉ chứa số!");
      toast.error("Tên combo không thể chỉ chứa số!");
      return;
    }
    if (!formData.basePrice || formData.basePrice <= 5000) {
      setError("Giá combo phải là số > 5000!");
      toast.error("Giá combo phải là số > 5000!");
      return;
    }
    if (!formData.comboItems || formData.comboItems.length < 2) {
      setError("Combo phải có ít nhất 2 món ăn!");
      toast.error("Combo phải có ít nhất 2 món ăn!");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      // If we have a Cloudinary URL, send it directly
      if (imageUrl) {
        const submitData = { ...formData, image: imageUrl };
        await onSubmit(submitData, undefined); // No file upload needed
      } else {
        // If we have a file, send the file
        await onSubmit(formData, imageFile || undefined);
      }
      
      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Modal show={show} onHide={onHide} centered size="xl" dialogClassName="combo-modal-xl">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{comboToEdit ? "Sửa Combo" : "Thêm Combo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={5} className="border-end">
              <Form.Group className="mb-3">
                <Form.Label>Tên Combo</Form.Label>
                <Form.Control name="name" value={formData.name} onChange={handleChange} autoFocus placeholder="Nhập tên combo" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả combo (không bắt buộc)"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ảnh Combo</Form.Label>
                {previewUrl && (
                  <div className="mb-2">
                    <SafeImage src={previewUrl} alt="Preview" thumbnail style={{ maxHeight: 150 }} showSpinner={false} />
                  </div>
                )}
                <ImageUploadWithSpinner
                  onImageSelect={handleImageSelect}
                  onCloudinarySelect={() => setShowCloudinaryPicker(true)}
                  disabled={isSubmitting}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Giá bán combo (VNĐ)
                  {baselinePrice > 0 && (
                    <span className="ms-2 text-muted" style={{ fontSize: 12 }}>
                      Giá món: {baselinePrice.toLocaleString('vi-VN')} ₫
                    </span>
                  )}
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    name="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="Nhập giá cơ sở"
                    style={{ maxWidth: 220 }}
                  />
                  {baselinePrice > 0 && formData.basePrice > 0 && (
                    (() => {
                      const delta = formData.basePrice - baselinePrice;
                      const pct = Math.round((delta / baselinePrice) * 1000) / 10; // 1 chữ số thập phân
                      const sign = pct > 0 ? '+' : '';
                      const color = pct > 0 ? '#d9534f' : pct < 0 ? '#5cb85c' : '#6c757d';
                      return (
                        <span style={{ color }}>
                          {sign}{pct}%
                        </span>
                      );
                    })()
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={7}>
              <Form.Group className="mb-2">
                <Form.Label>Chọn món cho combo</Form.Label>
                <Form.Control
                  placeholder="Tìm kiếm món theo tên..."
                  value={dishKeyword}
                  onChange={(e) => setDishKeyword(e.target.value)}
                />
                <small className="text-muted">
                  Có thể chọn cả món đang hoạt động và món ngừng hoạt động
                </small>
              </Form.Group>
              {loading ? (
                <div>Đang tải danh sách món...</div>
              ) : (
                <div style={{ maxHeight: 320, overflow: 'auto' }}>
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Tên món</th>
                        <th>Trạng thái</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dishes.map((dish: DishResponseDTO) => {
                        const selected = formData.comboItems.some((d) => d.dishId === String(dish.id));
                        const quantity = formData.comboItems.find((d) => d.dishId === String(dish.id))?.quantity || 1;
                        return (
                          <tr key={dish.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => handleSelectDish(Number(dish.id), e.target.checked)}
                              />
                            </td>
                            <td>{dish.name}</td>
                            <td>
                              <Badge bg={dish.operationalStatus === 'ACTIVE' ? 'success' : 'secondary'}>
                                {dish.operationalStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                              </Badge>
                            </td>
                            <td>{dish.basePrice?.toLocaleString("vi-VN")} ₫</td>
                            <td>
                              <Form.Control
                                type="number"
                                min={1}
                                value={quantity}
                                disabled={!selected}
                                style={{ width: 70 }}
                                onChange={(e) => handleChangeQuantity(Number(dish.id), Number(e.target.value))}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
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
