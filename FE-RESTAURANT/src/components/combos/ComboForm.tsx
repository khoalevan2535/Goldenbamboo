import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';

import { type ComboRequestDTO, type ComboResponseDTO, type DishResponseDTO } from '../../interfaces';
import { ComboService } from '../../services/ComboService';
import { DishService } from '../../services/DishService';
import { CloudinaryImagePicker } from '../shared/CloudinaryImagePicker';
import { SafeImage } from '../shared/SafeImage';
import { ImageUploadWithSpinner } from '../shared/ImageUploadWithSpinner';

interface Props { mode: 'create' | 'edit' }

const initialForm: any = {
  name: '',
  description: '',
  basePrice: 0,
  comboItems: [],
  image: null,
  imageUrl: '',
};

const ComboForm: React.FC<Props> = ({ mode }) => {
  console.log('ComboForm rendering with mode:', mode);
  const navigate = useNavigate();
  const { role } = useAuth();
  const { id } = useParams<{ id: string }>();
  console.log('ComboForm - role:', role, 'id:', id);

  const [form, setForm] = useState<any>(initialForm);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dishes, setDishes] = useState<DishResponseDTO[]>([]);
  const [showCloudinaryPicker, setShowCloudinaryPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [baselinePrice, setBaselinePrice] = useState(0);

  // Load dishes
  useEffect(() => {
    const loadDishes = async () => {
      try {
        console.log('ComboForm - Loading dishes...');
        // Lấy tất cả món ăn (bao gồm cả hết hàng) để hiển thị trong combo
        const response = await DishService.getAll({ size: 1000 }); // Lấy tối đa 1000 món
        console.log('ComboForm - Dishes loaded:', response.content);
        setDishes(response.content);
      } catch (e: any) {
        console.error('ComboForm - Error loading dishes:', e);
        setError('Không thể tải danh sách món ăn');
      }
    };
    loadDishes();
  }, []);

  // Load combo data for edit mode
  useEffect(() => {
    const loadCombo = async () => {
      if (mode === 'edit' && id) {
        console.log('ComboForm - Loading combo for edit, id:', id);
        setLoading(true);
        try {
          const data = await ComboService.getById(id);
          console.log('ComboForm - Combo loaded:', data);
          setForm({
            name: data.name || '',
            description: data.description || '',
            basePrice: data.basePrice || 0,
            comboItems: data.comboDishes?.map(d => ({
              dishId: String(d.dishId),
              quantity: d.quantity || 1,
              price: d.basePrice || 0, // Lấy từ response
            })) || [],
            image: null,
            imageUrl: data.image || '',
          });
          setPreviewImage(data.image || null);
          
          // Calculate baseline price from dish prices
          const sum = (data.comboDishes || []).reduce((acc, item) => {
            return acc + (item.basePrice || 0) * (item.quantity || 1);
          }, 0);
          setBaselinePrice(sum);
        } catch (e: any) {
          console.error('ComboForm - Error loading combo:', e);
          
          // Nếu lỗi 500 hoặc combo không tồn tại, hiển thị form trống với thông báo
          if (e.statusCode === 500 || e.statusCode === 404) {
            setError(`Combo với ID ${id} không tồn tại hoặc có lỗi từ server. Bạn có thể tạo combo mới.`);
            toast.warning(`Combo với ID ${id} không tồn tại. Chuyển sang chế độ tạo mới.`);
            
            // Chuyển sang chế độ create
            navigate('/manager/combos/create');
            return;
          }
          
          setError(e.message || 'Không thể tải dữ liệu');
          toast.error('Không thể tải thông tin combo');
        } finally {
          setLoading(false);
        }
      }
    };
    loadCombo();
  }, [mode, id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: name === 'basePrice' ? Number(value) : value,
    }));
  };

  const handleImageSelect = (file: File) => {
    setForm((prev: any) => ({ ...prev, image: file, imageUrl: '' }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCloudinarySelect = (imageUrl: string) => {
    console.log('ComboForm - Cloudinary image selected:', imageUrl);
    try {
      setForm((prev: any) => ({ ...prev, imageUrl, image: null }));
      setPreviewImage(imageUrl);
      console.log('ComboForm - Cloudinary selection successful');
    } catch (error) {
      console.error('ComboForm - Error in handleCloudinarySelect:', error);
    }
  };

  const handleSelectDish = (dishId: number, checked: boolean) => {
    setForm((prev: any) => {
      const dishIdStr = String(dishId);
      if (checked) {
        if (prev.comboItems.some((d: any) => d.dishId === dishIdStr)) return prev;
        const dish = dishes.find((ds) => String(ds.id) === dishIdStr);
        const newComboItems = [...prev.comboItems, { 
          dishId: dishIdStr, 
          quantity: 1, 
          price: dish?.basePrice ?? 0
        }];
        const newBaseline = newComboItems.reduce((sum: number, item: any) => 
          sum + item.price * (item.quantity ?? 1), 0);
        setBaselinePrice(newBaseline);
        return { ...prev, comboItems: newComboItems };
      } else {
        const newComboItems = prev.comboItems.filter((d: any) => d.dishId !== dishIdStr);
        const newBaseline = newComboItems.reduce((sum: number, item: any) => 
          sum + item.price * (item.quantity ?? 1), 0);
        setBaselinePrice(newBaseline);
        return { ...prev, comboItems: newComboItems };
      }
    });
  };

  const handleChangeQuantity = (dishId: number, quantity: number) => {
    setForm((prev: any) => {
      const newComboItems = prev.comboItems.map((d: any) => 
        d.dishId === String(dishId) ? { ...d, quantity } : d);
      const newBaseline = newComboItems.reduce((sum: number, item: any) => 
        sum + item.price * (item.quantity ?? 1), 0);
      setBaselinePrice(newBaseline);
      return { ...prev, comboItems: newComboItems };
    });
  };

  const handleRemoveDish = (dishId: string) => {
    setForm((prev: any) => {
      const newComboItems = prev.comboItems.filter((d: any) => d.dishId !== dishId);
      const newBaseline = newComboItems.reduce((sum: number, item: any) => 
        sum + item.price * (item.quantity ?? 1), 0);
      setBaselinePrice(newBaseline);
      return { ...prev, comboItems: newComboItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = form.name ? form.name.trim() : '';
    if (!trimmedName) {
      toast.error('Tên combo không được để trống!');
      return;
    }

    const specialCharRegex = /[!@#$%^*()_+=\[\]{};':"|,.<>?]+/;
    if (specialCharRegex.test(trimmedName)) {
      toast.error('Tên combo không được chứa ký tự đặc biệt!');
      return;
    }

    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(trimmedName)) {
      toast.error('Tên combo không thể chỉ chứa số!');
      return;
    }

    if (!form.basePrice || form.basePrice <= 5000) {
      toast.error('Giá combo phải là số > 5000!');
      return;
    }

    if (!form.comboItems || form.comboItems.length < 2) {
      toast.error('Combo phải có ít nhất 2 món ăn!');
      return;
    }

    // Kiểm tra món ăn không khả dụng
    const unavailableDishes = form.comboItems.filter((item: any) => {
      const dish = dishes.find(d => d.id === item.dishId);
      return dish && dish.availabilityStatus !== 'AVAILABLE';
    });

    if (unavailableDishes.length > 0) {
      const discontinuedDishes = unavailableDishes.filter((item: any) => {
        const dish = dishes.find(d => d.id === item.dishId);
        return dish && dish.availabilityStatus === 'DISCONTINUED';
      });
      
      const outOfStockDishes = unavailableDishes.filter((item: any) => {
        const dish = dishes.find(d => d.id === item.dishId);
        return dish && dish.availabilityStatus === 'OUT_OF_STOCK';
      });

      if (discontinuedDishes.length > 0) {
        const discontinuedDishNames = discontinuedDishes.map((item: any) => {
          const dish = dishes.find(d => d.id === item.dishId);
          return dish?.name;
        }).join(', ');
        toast.warning(`Combo sẽ được tạo nhưng sẽ tự động chuyển sang "Ngừng bán" vì có món ăn ngừng bán: ${discontinuedDishNames}`);
      } else if (outOfStockDishes.length > 0) {
        const outOfStockDishNames = outOfStockDishes.map((item: any) => {
          const dish = dishes.find(d => d.id === item.dishId);
          return dish?.name;
        }).join(', ');
        toast.warning(`Combo sẽ được tạo nhưng sẽ tự động chuyển sang "Hết hàng" vì có món ăn hết hàng: ${outOfStockDishNames}`);
      }
    }

    setSaving(true);
    try {
      const submitData = {
        name: trimmedName,
        description: form.description || '',
        basePrice: parseFloat(form.basePrice),
        comboItems: form.comboItems,
      };

      if (mode === 'create') {
        if (form.imageUrl) {
          await ComboService.create({ ...submitData, image: form.imageUrl });
        } else if (form.image) {
          await ComboService.create(submitData, form.image);
        } else {
          await ComboService.create(submitData);
        }
        // Thông báo thành công với thông tin về trạng thái
        if (unavailableDishes.length > 0) {
          const discontinuedDishes = unavailableDishes.filter((item: any) => {
            const dish = dishes.find(d => d.id === item.dishId);
            return dish && dish.availabilityStatus === 'DISCONTINUED';
          });
          
          if (discontinuedDishes.length > 0) {
            toast.success('Tạo combo thành công! Combo đã được tự động chuyển sang "Ngừng bán" vì có món ăn ngừng bán.');
          } else {
            toast.success('Tạo combo thành công! Combo đã được tự động chuyển sang "Hết hàng" vì có món ăn hết hàng.');
          }
        } else {
          toast.success('Tạo combo thành công!');
        }
      } else if (id) {
        if (form.imageUrl) {
          await ComboService.update(Number(id), { ...submitData, image: form.imageUrl });
        } else if (form.image) {
          await ComboService.update(Number(id), submitData, form.image);
        } else {
          await ComboService.update(Number(id), submitData);
        }
        // Thông báo thành công với thông tin về trạng thái
        if (unavailableDishes.length > 0) {
          const discontinuedDishes = unavailableDishes.filter((item: any) => {
            const dish = dishes.find(d => d.id === item.dishId);
            return dish && dish.availabilityStatus === 'DISCONTINUED';
          });
          
          if (discontinuedDishes.length > 0) {
            toast.success('Cập nhật combo thành công! Combo đã được tự động chuyển sang "Ngừng bán" vì có món ăn ngừng bán.');
          } else {
            toast.success('Cập nhật combo thành công! Combo đã được tự động chuyển sang "Hết hàng" vì có món ăn hết hàng.');
          }
        } else {
          toast.success('Cập nhật combo thành công!');
        }
      }
      
      const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
      navigate(`${basePath}/combos`);
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra');
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !form.comboItems.some((item: any) => item.dishId === String(dish.id))
  );

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
        <h4 className="mb-0">{mode === 'create' ? 'Tạo combo mới' : 'Sửa combo'}</h4>
        <Button variant="outline-secondary" onClick={() => {
          const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
          navigate(`${basePath}/combos`);
        }}>
          <FaArrowLeft className="me-2" />Quay lại
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Tên combo</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên combo"
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
                placeholder="Mô tả combo (không bắt buộc)"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá combo (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleChange}
                    placeholder="Nhập giá combo"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tổng giá gốc</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${baselinePrice.toLocaleString('vi-VN')} ₫`}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <ImageUploadWithSpinner
                onImageSelect={handleImageSelect}
                onCloudinarySelect={() => {
                  console.log('ComboForm - Opening Cloudinary picker...');
                  setShowCloudinaryPicker(true);
                }}
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

        <Row>
          <Col md={6}>
            <h5>Chọn món ăn</h5>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Tìm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            
            {/* Chú thích màu sắc */}
            <div className="mb-3">
              <small className="text-muted">Chú thích:</small>
              <div className="d-flex flex-wrap gap-2 mt-1">
                <Badge bg="success" className="small">Còn hàng</Badge>
                <Badge bg="warning" className="small">Hết hàng</Badge>
                <Badge bg="danger" className="small">Ngừng bán</Badge>
              </div>
            </div>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '10px' }}>
              {filteredDishes.length === 0 ? (
                <p className="text-muted mb-0">Không có món ăn nào để chọn</p>
              ) : (
                filteredDishes.map(dish => {
                  const isAvailable = dish.availabilityStatus === 'AVAILABLE';
                  const isOutOfStock = dish.availabilityStatus === 'OUT_OF_STOCK';
                  const isDiscontinued = dish.availabilityStatus === 'DISCONTINUED';
                  
                  return (
                    <div 
                      key={dish.id} 
                      className={`d-flex align-items-center mb-2 p-2 rounded ${
                        isAvailable ? 'bg-light-success' : 
                        isOutOfStock ? 'bg-light-warning' : 
                        isDiscontinued ? 'bg-light-danger' : 'bg-light-secondary'
                      }`}
                      style={{
                        backgroundColor: isAvailable ? '#d4edda' : 
                                       isOutOfStock ? '#fff3cd' : 
                                       isDiscontinued ? '#f8d7da' : '#e2e3e5',
                        border: `1px solid ${
                          isAvailable ? '#c3e6cb' : 
                          isOutOfStock ? '#ffeaa7' : 
                          isDiscontinued ? '#f5c6cb' : '#d6d8db'
                        }`
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        id={`dish-${dish.id}`}
                        onChange={(e) => handleSelectDish(dish.id, e.target.checked)}
                      />
                      <div className="ms-2 flex-grow-1">
                        <label htmlFor={`dish-${dish.id}`} className="mb-0 fw-medium">
                          {dish.name}
                        </label>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small">
                            {dish.basePrice?.toLocaleString('vi-VN')} ₫
                          </span>
                          <Badge 
                            bg={isAvailable ? 'success' : 
                                isOutOfStock ? 'warning' : 
                                isDiscontinued ? 'danger' : 'secondary'}
                            className="small"
                          >
                            {isAvailable ? 'Còn hàng' : 
                             isOutOfStock ? 'Hết hàng' : 
                             isDiscontinued ? 'Ngừng bán' : 'Không xác định'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Col>

          <Col md={6}>
            <h5>Món đã chọn</h5>
            {form.comboItems.length === 0 ? (
              <p className="text-muted">Chưa có món nào được chọn</p>
            ) : (
              <>
                {/* Cảnh báo về món ăn không khả dụng */}
                {form.comboItems.some((item: any) => {
                  const dish = dishes.find(d => String(d.id) === item.dishId);
                  return dish && dish.availabilityStatus !== 'AVAILABLE';
                }) && (
                  <Alert variant="warning" className="mb-3">
                    <strong>⚠️ Cảnh báo:</strong> Combo có món ăn không khả dụng. 
                    Combo sẽ được tạo nhưng sẽ tự động chuyển sang "Hết hàng".
                  </Alert>
                )}
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Món</th>
                    <th>Trạng thái</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.comboItems.map((item: any) => {
                    const dish = dishes.find(d => String(d.id) === item.dishId);
                    return (
                      <tr key={item.dishId}>
                        <td>{dish?.name || 'N/A'}</td>
                        <td>
                          {dish?.availabilityStatus === 'AVAILABLE' ? (
                            <Badge bg="success">Còn hàng</Badge>
                          ) : dish?.availabilityStatus === 'OUT_OF_STOCK' ? (
                            <Badge bg="warning">Hết hàng</Badge>
                          ) : dish?.availabilityStatus === 'DISCONTINUED' ? (
                            <Badge bg="danger">Ngừng bán</Badge>
                          ) : (
                            <Badge bg="secondary">Không xác định</Badge>
                          )}
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleChangeQuantity(Number(item.dishId), Number(e.target.value))}
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveDish(item.dishId)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              </>
            )}
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-3">
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
        onHide={() => {
          console.log('ComboForm - Closing Cloudinary picker...');
          setShowCloudinaryPicker(false);
        }}
        onSelect={handleCloudinarySelect}
        title="Chọn ảnh từ Cloudinary"
      />
    </Card>
  );
};

export default ComboForm;
