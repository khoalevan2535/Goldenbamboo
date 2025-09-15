import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';

import { type DishRequestDTO, type DishResponseDTO, type CategoryResponseDTO } from '../../interfaces';
import { DishService } from '../../services/DishService';
import { useCategoriesForManager } from '../../hooks/useCategoriesForManager';
import { CloudinaryImagePicker } from '../shared/CloudinaryImagePicker';
import { SafeImage } from '../shared/SafeImage';
import { ImageUploadWithSpinner } from '../shared/ImageUploadWithSpinner';

interface Props { mode: 'create' | 'edit' }

const initialForm: any = {
  name: '',
  description: '',
  basePrice: 0,
  categoryId: '',
  image: null,
  imageUrl: '',
};

const DishForm: React.FC<Props> = ({ mode }) => {
  console.log('DishForm rendering with mode:', mode);
  const navigate = useNavigate();
  const { role } = useAuth();
  const { id } = useParams<{ id: string }>();
  console.log('DishForm - role:', role, 'id:', id);

  const [form, setForm] = useState<any>(initialForm);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCloudinaryPicker, setShowCloudinaryPicker] = useState(false);

  // Load categories using hook
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategoriesForManager();

  // Load dish data for edit mode
  useEffect(() => {
    const loadDish = async () => {
      if (mode === 'edit' && id) {
        console.log('DishForm - Loading dish for edit, id:', id);
        setLoading(true);
        try {
          const data = await DishService.getById(id);
          console.log('DishForm - Dish loaded:', data);
          setForm({
            name: data.name || '',
            description: data.description || '',
            basePrice: data.basePrice || 0,
            categoryId: data.categoryId || '',
            image: null,
            imageUrl: data.image || '',
          });
          setPreviewImage(data.image || null);
        } catch (e: any) {
          console.error('DishForm - Error loading dish:', e);
          setError(e.message || 'Không thể tải dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    };
    loadDish();
  }, [mode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: name === 'categoryId' || name === 'basePrice' ? Number(value) : value,
    }));
  };

  const handleImageSelect = (file: File) => {
    setForm((prev: any) => ({ ...prev, image: file, imageUrl: '' }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCloudinarySelect = (imageUrl: string) => {
    setForm((prev: any) => ({ ...prev, imageUrl, image: null }));
    setPreviewImage(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = form.name ? form.name.trim() : '';
    if (!trimmedName) {
      toast.error('Tên món ăn không được để trống!');
      return;
    }

    const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]+/;
    if (specialCharRegex.test(trimmedName)) {
      toast.error('Tên món ăn không được chứa ký tự đặc biệt!');
      return;
    }

    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(trimmedName)) {
      toast.error('Tên món ăn không thể chỉ chứa số!');
      return;
    }

    if (!form.basePrice || form.basePrice <= 5000) {
      toast.error('Giá món ăn phải là số > 5000!');
      return;
    }

    if (!form.categoryId) {
      toast.error('Vui lòng chọn danh mục!');
      return;
    }

    setSaving(true);
    try {
      const { image, imageUrl, ...formDataWithoutImage } = form;
      const submitData = {
        ...formDataWithoutImage,
        name: trimmedName,
        categoryId: parseInt(form.categoryId),
        basePrice: parseFloat(form.basePrice),
      };

      if (mode === 'create') {
        if (imageUrl) {
          await DishService.create({ ...submitData, image: imageUrl });
        } else if (image) {
          await DishService.create(submitData, image);
        } else {
          await DishService.create(submitData);
        }
        toast.success('Tạo món ăn thành công');
      } else if (id) {
        if (imageUrl) {
          await DishService.update(Number(id), { ...submitData, image: imageUrl });
        } else if (image) {
          await DishService.update(Number(id), submitData, image);
        } else {
          await DishService.update(Number(id), submitData);
        }
        toast.success('Cập nhật thành công');
      }
      
      const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
      navigate(`${basePath}/dishes`);
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra');
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="p-4 shadow-sm">
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-0">{mode === 'create' ? 'Tạo món ăn mới' : 'Sửa món ăn'}</h4>
        <Button variant="outline-secondary" onClick={() => {
          const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
          navigate(`${basePath}/dishes`);
        }}>
          <FaArrowLeft className="me-2" />Quay lại
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {categoriesError && <Alert variant="warning" onClose={() => {}} dismissible>{categoriesError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Tên món ăn</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên món ăn"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Mô tả món ăn (không bắt buộc)"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleChange}
                    placeholder="Nhập giá cơ sở"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select 
                    name="categoryId" 
                    value={form.categoryId} 
                    onChange={handleChange}
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? 'Đang tải danh mục...' : '-- Chọn danh mục --'}
                    </option>
                    {categories
                      .filter((cat) => cat.status === 'ACTIVE')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <ImageUploadWithSpinner
                onImageSelect={handleImageSelect}
                onCloudinarySelect={() => setShowCloudinaryPicker(true)}
                disabled={saving}
              />
              {previewImage && (
                <div className="mt-2">
                  <SafeImage 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }} 
                    showSpinner={false} 
                  />
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-secondary" onClick={() => setForm(initialForm)} disabled={saving}>
            <FaTimes className="me-2" />Đặt lại
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <><Spinner size="sm" animation="border" className="me-2"/>Đang lưu...</>
            ) : (
              <><FaSave className="me-2"/>Lưu</>
            )}
          </Button>
        </div>
      </Form>

      <CloudinaryImagePicker
        show={showCloudinaryPicker}
        onHide={() => setShowCloudinaryPicker(false)}
        onSelect={handleCloudinarySelect}
        title="Chọn ảnh từ Cloudinary"
      />
    </Card>
  );
};

export default DishForm;
