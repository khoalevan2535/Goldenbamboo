import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Spinner, Alert, Card, Row, Col, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { type BranchRequestDTO, type BranchResponseDTO } from '../../interfaces';
import { BranchService } from '../../services/BranchService';
import { BranchStatus, BranchStatusUtils } from '../../interfaces/enums/BranchStatus';

interface Props { mode: 'create' | 'edit' }

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: number;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

const initialForm: BranchRequestDTO = {
  name: '',
  address: '',
  phone: '',
  description: '',
  status: BranchStatus.OPEN,
  createdBy: 'admin',
};

const BranchForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<BranchRequestDTO>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Địa chỉ và tìm kiếm
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Bản đồ
  const [showMapModal, setShowMapModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Load branch data for edit mode
  useEffect(() => {
    const loadBranch = async () => {
      if (mode === 'edit' && id) {
        setLoading(true);
        try {
          const data = await BranchService.getById(Number(id));
          setForm({
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            description: data.description || '',
                         status: data.status || BranchStatus.OPEN,
            createdBy: 'admin',
          });
        } catch (e: any) {
          setError(e.message || 'Không thể tải dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    };
    loadBranch();
  }, [mode, id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Khởi tạo bản đồ
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Khởi tạo bản đồ với vị trí mặc định (TP.HCM)
    const map = L.map(mapRef.current).setView([10.8231, 106.6297], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Thêm marker mặc định (sẽ được cập nhật khi có vị trí hiện tại)
    const defaultMarker = L.marker([10.8231, 106.6297]).addTo(map);
    markerRef.current = defaultMarker;

    // Xử lý click trên bản đồ
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMapMarker(lat, lng);
    });
  };

  // Cập nhật marker trên bản đồ
  const updateMapMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Xóa marker cũ
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Thêm marker mới
    const newMarker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    markerRef.current = newMarker;

    // Cập nhật view của bản đồ để hiển thị vị trí mới
    mapInstanceRef.current.setView([lat, lng], 15);

    // Cập nhật tọa độ
    setLocationCoords({ lat, lng });

    // Reverse geocoding để lấy địa chỉ
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    )
      .then(response => response.json())
      .then(data => {
        const selectedAddress = data.display_name;
        setForm(prev => ({ ...prev, address: selectedAddress }));
        toast.success('Đã chọn địa chỉ từ bản đồ!');
      })
      .catch(error => {
        console.error('Error getting address:', error);
        toast.error('Lỗi khi lấy địa chỉ');
      });
  };

  // Lấy vị trí hiện tại
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapMarker(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Không thể lấy vị trí hiện tại');
        setIsGettingLocation(false);
      }
    );
  };

  // Mở modal bản đồ
  const openMapModal = () => {
    setShowMapModal(true);
    setTimeout(() => {
      initializeMap();
      // Tự động lấy vị trí hiện tại khi mở modal
      getCurrentLocation();
    }, 100);
  };

  // Đóng modal bản đồ
  const closeMapModal = () => {
    setShowMapModal(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = form.name ? form.name.trim() : '';
    const trimmedAddress = form.address ? form.address.trim() : '';
    const trimmedPhone = form.phone ? form.phone.trim() : '';

    if (!trimmedName) {
      toast.error('Tên chi nhánh không được để trống!');
      return;
    }

    // Tên chi nhánh validation
    if (trimmedName.length < 3) {
      toast.error('Tên chi nhánh phải có ít nhất 3 ký tự!');
      return;
    }

    if (trimmedName.length > 50) {
      toast.error('Tên chi nhánh không được quá 50 ký tự!');
      return;
    }

    const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]+/;
    if (specialCharRegex.test(trimmedName)) {
      toast.error('Tên chi nhánh không được chứa ký tự đặc biệt!');
      return;
    }

    const onlyNumbersRegex = /^\d+$/;
    if (onlyNumbersRegex.test(trimmedName)) {
      toast.error('Tên chi nhánh không thể chỉ chứa số!');
      return;
    }

    if (!trimmedAddress) {
      toast.error('Địa chỉ không được để trống!');
      return;
    }

    if (trimmedAddress.length < 10) {
      toast.error('Địa chỉ phải có ít nhất 10 ký tự!');
      return;
    }

    if (!trimmedPhone) {
      toast.error('Số điện thoại không được để trống!');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = trimmedPhone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Số điện thoại phải có 10-11 chữ số (ví dụ: 0123456789)!');
      return;
    }

    // Kiểm tra số điện thoại bắt đầu bằng 0
    if (!cleanPhone.startsWith('0')) {
      toast.error('Số điện thoại phải bắt đầu bằng số 0!');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...form,
        name: trimmedName,
        address: trimmedAddress,
        phone: trimmedPhone,
      };

      if (mode === 'create') {
        await BranchService.create(submitData);
        toast.success('Tạo chi nhánh thành công');
      } else if (id) {
        await BranchService.update(Number(id), submitData);
        toast.success('Cập nhật thành công');
      }
      
      navigate('/admin/branches');
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
    <>
    <Card className="p-4 shadow-sm">
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-0">{mode === 'create' ? 'Tạo chi nhánh mới' : 'Sửa chi nhánh'}</h4>
        <Button variant="outline-secondary" onClick={() => navigate('/admin/branches')}>
          <FaArrowLeft className="me-2" />Quay lại
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Tên chi nhánh</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên chi nhánh"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ chi nhánh</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  name="address"
                  value={form.address}
                  placeholder="Chọn địa chỉ từ bản đồ"
                  readOnly
                  className="flex-grow-1"
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openMapModal}
                >
                  🗺️ Chọn từ bản đồ
                </Button>
              </div>
              {locationCoords && (
                <small className="text-success mt-1 d-block">
                  📍 Tọa độ: {locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}
                </small>
              )}
              {!form.address && (
                <small className="text-muted mt-1 d-block">
                  💡 Click "Chọn từ bản đồ" để chọn địa chỉ chi nhánh
                </small>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                                     <Form.Select name="status" value={form.status} onChange={handleChange}>
                     <option value={BranchStatus.OPEN}>Mở cửa</option>
                     <option value={BranchStatus.INACTIVE}>Dừng hoạt động</option>
                     <option value={BranchStatus.MAINTENANCE}>Bảo trì</option>
                     <option value={BranchStatus.CLOSED}>Đóng cửa vĩnh viễn</option>
                   </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Mô tả chi nhánh (tùy chọn)"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <div className="bg-light p-3 rounded">
              <h6>📋 Hướng dẫn chọn địa chỉ</h6>
              <div className="text-muted small">
                <div className="mb-2">
                  <strong>🗺️ Chọn từ bản đồ:</strong><br/>
                  • Click "Chọn từ bản đồ" để mở modal bản đồ<br/>
                  • Tự động lấy vị trí hiện tại của bạn<br/>
                  • Click trực tiếp trên bản đồ để chọn vị trí<br/>
                  • Hệ thống sẽ lưu cả địa chỉ text và tọa độ<br/>
                  • Địa chỉ được khóa, chỉ có thể chọn từ bản đồ
                </div>
                <div className="border-top pt-2 mt-2">
                  <strong>📝 Lưu ý:</strong><br/>
                  • Tên chi nhánh không chứa ký tự đặc biệt<br/>
                  • Địa chỉ và số điện thoại là bắt buộc<br/>
                  • Trạng thái mặc định là "Mở cửa"
                </div>
              </div>
            </div>
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
    </Card>

    {/* Map Modal */}
    <Modal show={showMapModal} onHide={closeMapModal} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🗺️ Chọn địa chỉ chi nhánh trên bản đồ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Button
              variant="outline-success"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Đang lấy vị trí...
                </>
              ) : (
                '📍 Vị trí hiện tại'
              )}
            </Button>
            <small className="text-muted">
              💡 Click trên bản đồ để chọn vị trí chi nhánh
            </small>
          </div>
          <div className="alert alert-info py-2 mb-0">
            <small>
              <strong>Hướng dẫn:</strong> 
              • Hệ thống đã tự động lấy vị trí hiện tại của bạn<br/>
              • Click "📍 Vị trí hiện tại" để lấy lại vị trí GPS<br/>
              • Hoặc click trực tiếp trên bản đồ để chọn vị trí khác<br/>
              • Hệ thống sẽ tự động lấy địa chỉ và tọa độ chính xác
            </small>
          </div>
        </div>
        
        <div 
          ref={mapRef}
          style={{ height: '400px', width: '100%' }}
          className="border rounded"
        />
        
        {locationCoords && (
          <div className="mt-3 p-2 bg-light rounded">
            <strong>Địa chỉ đã chọn:</strong>
            <div className="text-muted">{form.address}</div>
            <small className="text-success">
              📍 Tọa độ: {locationCoords?.lat.toFixed(6)}, {locationCoords?.lng.toFixed(6)}
            </small>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeMapModal}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={closeMapModal}
          disabled={!locationCoords}
        >
          Xác nhận địa chỉ
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default BranchForm;
