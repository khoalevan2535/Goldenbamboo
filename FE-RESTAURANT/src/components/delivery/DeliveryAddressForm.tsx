import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ghtkService, GHTKProvince, GHTKDistrict, GHTKWard } from '../../services/GHTKService';
import { branchService, Branch } from '../../services/BranchService';

export interface DeliveryAddress {
  id?: string;
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  branchId?: number;
  note?: string;
  isDefault?: boolean;
}

interface DeliveryAddressFormProps {
  initialData?: DeliveryAddress;
  onSubmit: (data: DeliveryAddress) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<DeliveryAddress>({
    recipientName: '',
    phone: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    branchId: undefined,
    note: '',
    isDefault: false,
    ...initialData
  });

  const [provinces, setProvinces] = useState<GHTKProvince[]>([]);
  const [districts, setDistricts] = useState<GHTKDistrict[]>([]);
  const [wards, setWards] = useState<GHTKWard[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState({
    provinces: false,
    districts: false,
    wards: false,
    branches: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (formData.province) {
      loadDistricts(formData.province);
    } else {
      setDistricts([]);
      setWards([]);
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
    }
  }, [formData.province]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.district) {
      loadWards(formData.district);
    } else {
      setWards([]);
      setFormData(prev => ({ ...prev, ward: '' }));
    }
  }, [formData.district]);

  const loadInitialData = async () => {
    setLoadingData(prev => ({ ...prev, provinces: true, branches: true }));
    
    try {
      const [provincesData, branchesData] = await Promise.all([
        ghtkService.getProvinces(),
        branchService.getBranchesForDelivery()
      ]);
      
      setProvinces(provincesData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Lỗi khi tải dữ liệu ban đầu');
    } finally {
      setLoadingData(prev => ({ ...prev, provinces: false, branches: false }));
    }
  };

  const loadDistricts = async (provinceId: string) => {
    setLoadingData(prev => ({ ...prev, districts: true }));
    try {
      const districtsData = await ghtkService.getDistricts(provinceId);
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Lỗi khi tải danh sách quận/huyện');
    } finally {
      setLoadingData(prev => ({ ...prev, districts: false }));
    }
  };

  const loadWards = async (districtId: string) => {
    setLoadingData(prev => ({ ...prev, wards: true }));
    try {
      const wardsData = await ghtkService.getWards(districtId);
      setWards(wardsData);
    } catch (error) {
      console.error('Error loading wards:', error);
      toast.error('Lỗi khi tải danh sách phường/xã');
    } finally {
      setLoadingData(prev => ({ ...prev, wards: false }));
    }
  };

  const handleInputChange = (field: keyof DeliveryAddress, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Vui lòng nhập tên người nhận';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ chi tiết';
    }

    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getProvinceName = (provinceId: string) => {
    return provinces.find(p => p.id === provinceId)?.name || '';
  };

  const getDistrictName = (districtId: string) => {
    return districts.find(d => d.id === districtId)?.name || '';
  };

  const getWardName = (wardId: string) => {
    return wards.find(w => w.id === wardId)?.name || '';
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-map-marker-alt me-2"></i>
          {initialData ? 'Chỉnh sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-user me-2 text-primary"></i>
                  Tên người nhận *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Nhập tên người nhận"
                  isInvalid={!!errors.recipientName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.recipientName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-phone me-2 text-primary"></i>
                  Số điện thoại *
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="fas fa-home me-2 text-primary"></i>
              Địa chỉ chi tiết *
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, hẻm...)"
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-building me-2 text-primary"></i>
                  Tỉnh/Thành phố *
                </Form.Label>
                <Form.Select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  isInvalid={!!errors.province}
                  disabled={loadingData.provinces}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </Form.Select>
                {loadingData.provinces && (
                  <div className="mt-2">
                    <Spinner size="sm" className="me-2" />
                    <small className="text-muted">Đang tải...</small>
                  </div>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.province}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-map me-2 text-primary"></i>
                  Quận/Huyện *
                </Form.Label>
                <Form.Select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  isInvalid={!!errors.district}
                  disabled={!formData.province || loadingData.districts}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Form.Select>
                {loadingData.districts && (
                  <div className="mt-2">
                    <Spinner size="sm" className="me-2" />
                    <small className="text-muted">Đang tải...</small>
                  </div>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.district}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-map-pin me-2 text-primary"></i>
                  Phường/Xã *
                </Form.Label>
                <Form.Select
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', e.target.value)}
                  isInvalid={!!errors.ward}
                  disabled={!formData.district || loadingData.wards}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </Form.Select>
                {loadingData.wards && (
                  <div className="mt-2">
                    <Spinner size="sm" className="me-2" />
                    <small className="text-muted">Đang tải...</small>
                  </div>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.ward}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="fas fa-store me-2 text-primary"></i>
              Chi nhánh
            </Form.Label>
            <Form.Select
              value={formData.branchId || ''}
              onChange={(e) => handleInputChange('branchId', e.target.value ? Number(e.target.value) : undefined)}
              disabled={loadingData.branches}
            >
              <option value="">Chọn chi nhánh</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.address}
                </option>
              ))}
            </Form.Select>
            {loadingData.branches && (
              <div className="mt-2">
                <Spinner size="sm" className="me-2" />
                <small className="text-muted">Đang tải...</small>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <i className="fas fa-sticky-note me-2 text-primary"></i>
              Ghi chú
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Ghi chú thêm về địa chỉ giao hàng..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="isDefault"
              label="Đặt làm địa chỉ mặc định"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            />
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="fas fa-times me-2"></i>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {initialData ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DeliveryAddressForm;