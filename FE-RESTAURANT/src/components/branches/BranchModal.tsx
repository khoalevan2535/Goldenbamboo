import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import debounce from 'lodash/debounce';
import { BranchStatus, BranchStatusUtils } from '../../interfaces/enums/BranchStatus';
import { type BranchRequestDTO, type BranchResponseDTO } from '../../interfaces';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: number;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Dữ liệu đầu vào cho Modal
interface BranchModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (branchData: BranchRequestDTO) => void;
  branchToEdit?: BranchResponseDTO | null;
}

// Dữ liệu mặc định cho form
const defaultFormData = { name: '', address: '', phone: '', status: BranchStatus.OPEN };

export function BranchModal({ show, onHide, onSubmit, branchToEdit }: BranchModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<BranchStatus>(BranchStatus.OPEN);
  const [description, setDescription] = useState('');
  
  // Địa chỉ và tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Bản đồ
  const [showMapModal, setShowMapModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (branchToEdit) {
      setName(branchToEdit.name);
      setAddress(branchToEdit.address);
      setSearchQuery(branchToEdit.address);
      setPhone(branchToEdit.phone);
      setStatus(branchToEdit.status);
      setDescription(branchToEdit.description || '');
      // Note: latitude/longitude sẽ được lấy từ tìm kiếm địa chỉ
    } else {
      setName('');
      setAddress('');
      setSearchQuery('');
      setPhone('');
      setStatus(BranchStatus.OPEN);
      setDescription('');
      setLocationCoords(null);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [branchToEdit, show]);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.position-relative')) {
        setShowSuggestions(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  // Hàm tìm kiếm địa chỉ
  const handleSearchAddress = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=vn`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching address:', error);
      toast.error('Lỗi khi tìm kiếm địa chỉ');
    } finally {
      setIsSearching(false);
    }
  }, 500);

  // Hàm chọn địa chỉ từ kết quả tìm kiếm
  const handleSelectAddress = (result: any) => {
    const selectedAddress = result.display_name;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setAddress(selectedAddress);
    setSearchQuery(selectedAddress);
    setLocationCoords({ lat, lng });
    setShowSuggestions(false);
    
    toast.success('Đã chọn địa chỉ!');
  };

  // Hàm format địa chỉ
  const formatVietnameseAddress = (addressData: any) => {
    if (!addressData.address) return addressData.display_name;
    
    const address = addressData.address;
    const parts = [];
    
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
    if (address.city_district || address.county) parts.push(address.city_district || address.county);
    if (address.city || address.town) parts.push(address.city || address.town);
    
    return parts.length > 0 ? parts.join(', ') : addressData.display_name;
  };

  // Khởi tạo bản đồ
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([10.8231, 106.6297], 13); // TP.HCM
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Thêm marker mặc định
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

    // Cập nhật tọa độ
    setLocationCoords({ lat, lng });

    // Reverse geocoding để lấy địa chỉ
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    )
      .then(response => response.json())
      .then(data => {
        const selectedAddress = data.display_name;
        setAddress(selectedAddress);
        setSearchQuery(selectedAddress);
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error('Tên chi nhánh không được để trống!');
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

    if (!trimmedPhone) {
      toast.error('Số điện thoại không được để trống!');
      return;
    }

    onSubmit({
      name: trimmedName,
      address: trimmedAddress,
      phone: trimmedPhone,
      description,
      status,
      createdBy: 'admin', // Placeholder for dynamic user data
      // Note: latitude/longitude sẽ được xử lý ở backend nếu cần
    });
    onHide();
  };

  return (
    <>
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{branchToEdit ? 'Sửa Chi nhánh' : 'Thêm Chi nhánh mới'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên chi nhánh</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên chi nhánh"
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  setAddress(query);
                  setShowSuggestions(true);
                  handleSearchAddress(query);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Nhập địa chỉ chi nhánh hoặc tìm kiếm..."
                autoComplete="off"
              />
              
              {/* Dropdown suggestions */}
              {showSuggestions && searchResults.length > 0 && (
                <div 
                  className="position-absolute w-100 bg-white border rounded shadow-sm"
                  style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
                >
                  <ListGroup variant="flush">
                    {searchResults.map((result, index) => (
                      <ListGroup.Item
                        key={index}
                        action
                        onClick={() => handleSelectAddress(result)}
                        className="py-2"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="fw-bold">{formatVietnameseAddress(result)}</div>
                        <small className="text-muted">{result.display_name}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
              
              {isSearching && (
                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Đang tìm kiếm...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-2 d-flex justify-content-between align-items-center">
              {locationCoords && (
                <small className="text-success">
                  📍 Tọa độ: {locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}
                </small>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={openMapModal}
                className="ms-auto"
              >
                🗺️ Mở bản đồ
              </Button>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi nhánh (không bắt buộc)"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Trạng thái</Form.Label>
                         <Form.Select value={status} onChange={(e) => setStatus(e.target.value as BranchStatus)}>
               <option value={BranchStatus.OPEN}>Mở cửa</option>
               <option value={BranchStatus.INACTIVE}>Dừng hoạt động</option>
               <option value={BranchStatus.MAINTENANCE}>Bảo trì</option>
               <option value={BranchStatus.CLOSED}>Đóng cửa vĩnh viễn</option>
             </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Hủy</Button>
          <Button variant="primary" type="submit">Lưu</Button>
        </Modal.Footer>
      </Form>
    </Modal>

    {/* Map Modal */}
    <Modal show={showMapModal} onHide={closeMapModal} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🗺️ Chọn địa chỉ trên bản đồ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <Button
            variant="outline-success"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="me-2"
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
            Click trên bản đồ để chọn địa chỉ
          </small>
        </div>
        
        <div 
          ref={mapRef}
          style={{ height: '400px', width: '100%' }}
          className="border rounded"
        />
        
        {locationCoords && (
          <div className="mt-3 p-2 bg-light rounded">
            <strong>Địa chỉ đã chọn:</strong>
            <div className="text-muted">{address}</div>
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
}