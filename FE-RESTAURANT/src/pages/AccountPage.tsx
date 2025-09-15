import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Custom debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
import { AuthService } from '../services/AuthService';
import { loadAvatarFromStorage } from '../utils/avatarUtils';
import { useAuth } from '../hooks/useAuth';
import styles from '../style/AccountPage.module.scss';

// Thêm Leaflet cho bản đồ
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AccountPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // đổi mật khẩu
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [changing, setChanging] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);
  const [cpSuccess, setCpSuccess] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // đặt mật khẩu cho OAuth2
  const [showSetPwd, setShowSetPwd] = useState(false);
  const [setting, setSetting] = useState(false);
  const [spError, setSpError] = useState<string | null>(null);
  const [spSuccess, setSpSuccess] = useState<string | null>(null);
  const [setPassword, setSetPassword] = useState("");
  const [confirmSetPassword, setConfirmSetPassword] = useState("");

  // Địa chỉ
  const [address, setAddress] = useState("");
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Modal bản đồ
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocationInModal, setIsGettingLocationInModal] = useState(false);
  
  // Bản đồ
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // input ẩn để chọn file avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Xử lý đăng nhập Google
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await AuthService.getMe();
        
        // Lấy avatar từ localStorage sử dụng utility function
        const avatarUrl = loadAvatarFromStorage(res.accountId || 'default');
        if (avatarUrl) {
          res.avatarUrl = avatarUrl;
          console.log('AccountPage: Avatar loaded from storage:', avatarUrl);
        } else if (res.avatarUrl) {
          console.log('AccountPage: Using avatar from API:', res.avatarUrl);
        }
        
        setProfile(res);
        setAddress(res.address || "");
      } catch (e: any) {
        setError(e?.message || "Không thể tải thông tin tài khoản.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Lắng nghe sự kiện cập nhật avatar từ header
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setProfile((prev: any) => ({ ...prev, avatarUrl: event.detail.avatarUrl }));
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Khởi tạo bản đồ khi modal mở
  useEffect(() => {
    if (showMapModal) {
      // Delay để đảm bảo modal đã render
      setTimeout(() => {
        initializeMap();
        // Tự động lấy vị trí hiện tại khi mở modal
        getCurrentLocation();
      }, 100);
    } else {
      destroyMap();
    }
  }, [showMapModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      await AuthService.updateMe({
        name: profile.name,
        phone: profile.phone,
        address: address,
        latitude: currentLat || locationCoords?.lat,
        longitude: currentLng || locationCoords?.lng
      });
      setSuccess("Cập nhật thành công!");
      toast.success("Cập nhật thông tin thành công!");
    } catch (e: any) {
      const errorMsg = e?.message || "Cập nhật thất bại.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        console.log('=== AVATAR UPLOAD DEBUG ===');
        console.log('File selected:', file.name, file.size, file.type);
        
        const response = await AuthService.uploadAvatar(file);
        console.log('Upload response:', response);
        
        const newAvatarUrl = response.avatarUrl;
        console.log('New avatar URL:', newAvatarUrl);
        
        setProfile({ ...profile, avatarUrl: newAvatarUrl });
        
        // Cập nhật avatar trong localStorage theo từng tài khoản
        const avatarKey = `userAvatar_${user?.accountId || 'default'}`;
        localStorage.setItem(avatarKey, newAvatarUrl);
        console.log('Avatar saved to localStorage with key:', avatarKey);
        
        // Trigger event để header cập nhật avatar
        const avatarEvent = new CustomEvent('avatarUpdated', { 
          detail: { 
            avatarUrl: newAvatarUrl,
            accountId: user?.accountId 
          } 
        });
        window.dispatchEvent(avatarEvent);
        console.log('Avatar update event dispatched with accountId:', user?.accountId);
        
        toast.success('Cập nhật avatar thành công!');
        console.log('=== END AVATAR UPLOAD DEBUG ===');
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        toast.error(error?.message || 'Lỗi khi cập nhật avatar');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChanging(true);
    setCpError(null);
    setCpSuccess(null);
    try {
      if (newPassword !== confirmNewPassword)
        throw new Error("Xác nhận mật khẩu không khớp.");
      await AuthService.changePassword({ currentPassword, newPassword });
      setCpSuccess("Đổi mật khẩu thành công.");
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setShowChangePwd(false), 1200);
    } catch (e: any) {
      const errorMsg = e?.message || "Đổi mật khẩu thất bại.";
      setCpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setChanging(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetting(true);
    setSpError(null);
    setSpSuccess(null);
    try {
      if (setPassword !== confirmSetPassword)
        throw new Error("Xác nhận mật khẩu không khớp.");
      if (setPassword.length < 6)
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
      await AuthService.setPassword({ newPassword: setPassword });
      setSpSuccess("Đặt mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng email và mật khẩu.");
      toast.success("Đặt mật khẩu thành công!");
      setSetPassword("");
      setConfirmSetPassword("");
      setTimeout(() => setShowSetPwd(false), 2000);
    } catch (e: any) {
      const errorMsg = e?.message || "Đặt mật khẩu thất bại.";
      setSpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSetting(false);
    }
  };

  // Hàm tìm kiếm địa chỉ đơn giản
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
    setLocationCoords({ lat, lng });
    setSearchQuery(selectedAddress);
    setShowSuggestions(false);
    
    // Cập nhật marker trên bản đồ
    updateMapMarker(lat, lng);
    
    toast.success('Đã chọn địa chỉ từ bản đồ!');
  };



  // Hàm format địa chỉ đơn giản - chỉ cần đúng là được
  const formatVietnameseAddress = (addressData: any) => {
    if (!addressData.address) return addressData.display_name;
    
    const address = addressData.address;
    const parts = [];
    
    // Số nhà
    if (address.house_number) {
      parts.push(address.house_number);
    }
    
    // Tên đường/hẻm
    if (address.road) {
      parts.push(address.road);
    }
    
    // Phường/xã
    if (address.suburb || address.neighbourhood) {
      parts.push(address.suburb || address.neighbourhood);
    }
    
    // Quận/huyện
    if (address.city_district || address.county) {
      parts.push(address.city_district || address.county);
    }
    
    // Thành phố/tỉnh
    if (address.city || address.town) {
      parts.push(address.city || address.town);
    }
    
    return parts.join(', ');
  };

  // Hàm xác nhận vị trí
  const confirmLocation = () => {
    if (searchQuery) {
      setAddress(searchQuery);
      setShowMapModal(false);
      destroyMap();
      toast.success('Đã chọn địa chỉ!');
    } else {
      toast.error('Vui lòng chọn một địa chỉ');
    }
  };

  // Lưu tọa độ khi lấy được vị trí
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  // Hàm lấy vị trí hiện tại
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocationInModal(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Lưu tọa độ
          setCurrentLat(latitude);
          setCurrentLng(longitude);
          setLocationCoords({ lat: latitude, lng: longitude });
          
          // Cập nhật bản đồ đến vị trí hiện tại với zoom cao hơn để chính xác hơn
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 19);
          }
          
          // Cập nhật marker
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          }

          // Reverse geocoding để lấy địa chỉ với độ chính xác cao
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=19&addressdetails=1&extratags=1&namedetails=1&accept-language=vi`
          )
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                // Format địa chỉ theo chuẩn Việt Nam
                const formattedAddress = formatVietnameseAddress(data);
                setSearchQuery(formattedAddress);
                
                // KHÔNG tự động xác nhận - chờ user click "Xác nhận địa chỉ"
                toast.success('Đã lấy vị trí hiện tại! Vui lòng xác nhận địa chỉ.');
              }
              setIsGettingLocationInModal(false);
            })
            .catch(error => {
              console.error('Reverse geocoding error:', error);
              setIsGettingLocationInModal(false);
              toast.error('Không thể lấy địa chỉ từ tọa độ');
            });
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsGettingLocationInModal(false);
          toast.error('Không thể lấy vị trí hiện tại');
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000
        }
      );
    } else {
      toast.error('Trình duyệt không hỗ trợ định vị');
    }
  };

  // Hàm khởi tạo bản đồ
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Tọa độ mặc định (Hà Nội)
    const defaultLat = 21.0285;
    const defaultLng = 105.8542;

    // Khởi tạo bản đồ
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
    mapInstanceRef.current = map;

    // Thêm tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Thêm marker mặc định
    const marker = L.marker([defaultLat, defaultLng]).addTo(map);
    markerRef.current = marker;

    // Xử lý sự kiện click trên bản đồ
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Lưu tọa độ
      setCurrentLat(lat);
      setCurrentLng(lng);
      setLocationCoords({ lat, lng });
      
      // Cập nhật marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      // Reverse geocoding để lấy địa chỉ
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
        .then(response => response.json())
        .then(data => {
          if (data.display_name) {
            const formattedAddress = formatVietnameseAddress(data);
            setSearchQuery(formattedAddress);
          }
          toast.success('Đã chọn vị trí trên bản đồ!');
        })
        .catch(error => {
          console.error('Error reverse geocoding:', error);
          toast.error('Lỗi khi lấy địa chỉ');
        });
    });
  };

  // Hàm hủy bản đồ
  const destroyMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  };

  // Hàm cập nhật vị trí marker trên bản đồ
  const updateMapMarker = (lat: number, lng: number) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Alert variant="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  const getUserRoleDisplay = () => {
    if (profile?.roles?.includes('ROLE_ADMIN')) return 'Quản trị viên';
    if (profile?.roles?.includes('ROLE_MANAGER')) return 'Quản lý';
    if (profile?.roles?.includes('ROLE_STAFF')) return 'Nhân viên';
    return 'Khách hàng';
  };

  const getUserRoleBadge = () => {
    if (profile?.roles?.includes('ROLE_ADMIN')) {
      return <Badge className={`${styles['badge-modern']} bg-danger`}>
        <i className="fas fa-shield-alt me-1"></i>Quản trị viên
      </Badge>;
    }
    if (profile?.roles?.includes('ROLE_MANAGER')) {
      return <Badge className={`${styles['badge-modern']} bg-warning`}>
        <i className="fas fa-chart-line me-1"></i>Quản lý
      </Badge>;
    }
    if (profile?.roles?.includes('ROLE_STAFF')) {
      return <Badge className={`${styles['badge-modern']} bg-info`}>
        <i className="fas fa-user-tie me-1"></i>Nhân viên
      </Badge>;
    }
    return <Badge className={`${styles['badge-modern']} bg-success`}>
      <i className="fas fa-user me-1"></i>Khách hàng
    </Badge>;
  };

  return (
    <div className={styles['account-page-wrapper']}>
      <Container fluid>
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
          {/* Header Section */}
          <div className="text-center mb-5">
            <h1 className={`display-5 fw-bold ${styles['text-gradient']} mb-3`}>
              <i className="fas fa-user-circle me-3"></i>
              Hồ sơ cá nhân
            </h1>
            <p className="text-muted fs-5">
              Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
            </p>
            {profile?.roles && (
              <div className="mt-3">
                {getUserRoleBadge()}
              </div>
            )}
          </div>

          {success && (
            <div className="alert alert-success border-0 shadow-sm" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          {/* Google Login Section - Hiển thị khi chưa đăng nhập */}
          {!isAuthenticated && (
            <Card className={`${styles['card-modern']} mb-5`}>
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <i className="fab fa-google text-danger" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="fw-bold mb-3">Đăng nhập nhanh với Google</h4>
                <p className="text-muted mb-4 fs-5">
                  Đăng nhập hoặc đăng ký tài khoản mới bằng Google để sử dụng đầy đủ tính năng
                </p>
                <Button 
                  variant="outline-danger" 
                  size="lg"
                  onClick={handleGoogleLogin}
                  className="px-5 py-3 fs-5 rounded-pill shadow-sm"
                >
                  <i className="fab fa-google me-2"></i>
                  Đăng nhập với Google
                </Button>
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Bảo mật và nhanh chóng
                  </small>
                </div>
              </div>
            </Card>
          )}

          <div className="row">
            {/* Left Column - Avatar & Basic Info */}
            <div className="col-lg-4 mb-4">
              <Card className={`${styles['card-modern']} h-100`}>
                <div className="card-body text-center p-4">
                  {/* Avatar Section */}
                  <div className="position-relative d-inline-block mb-4">
                    <div className={styles['avatar-container']}>
                      <img
                        src={profile?.avatarUrl || "/default-avatar.png"}
                        alt="avatar"
                        className={styles['avatar-image']}
                        onClick={isUploadingAvatar ? undefined : handleAvatarClick}
                        style={{
                          opacity: isUploadingAvatar ? 0.6 : 1,
                          cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      
                      {/* Loading overlay */}
                      {isUploadingAvatar && (
                        <div 
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            borderRadius: '50%',
                            cursor: 'not-allowed'
                          }}
                        >
                          <div className="text-center">
                            <div className="spinner-border text-light mb-2" role="status" style={{width: '2rem', height: '2rem'}}>
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="text-light" style={{fontSize: '0.8rem'}}>Đang tải lên...</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      {!isUploadingAvatar && (
                        <div className={styles['avatar-overlay']} onClick={handleAvatarClick}>
                          <i className="fas fa-camera"></i>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="d-none"
                      onChange={handleAvatarChange}
                    />
                    
                    {/* Upload status text */}
                    <div className="text-muted mt-2" style={{fontSize: '0.85rem'}}>
                      <i className="fas fa-info-circle me-1"></i>
                      {isUploadingAvatar ? 'Đang tải lên avatar...' : 'Click vào avatar để thay đổi'}
                    </div>
                  </div>

                  {/* User Info */}
                  <h4 className="fw-bold mb-2">{profile?.name || 'Chưa có tên'}</h4>
                  <p className="text-muted mb-3">{profile?.email || 'Chưa có email'}</p>
                </div>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div className="col-lg-8">
              <Card className={styles['card-modern']}>
                <div className="card-header bg-transparent border-0 py-4">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-edit me-2 text-primary"></i>
                    Thông tin cá nhân
                  </h5>
                </div>
                <div className="card-body p-4">
                  <Form onSubmit={handleSubmit}>
                    {/* Họ và tên */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted mb-2">
                        <i className="fas fa-user me-2 text-primary"></i>
                        Họ và tên
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập họ và tên của bạn"
                        value={profile?.name || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        className={`${styles['form-control-lg']} border-0 bg-light`}
                      />
                    </Form.Group>

                    {/* Email - chỉ hiển thị nếu có */}
                    {profile?.email && (
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-muted mb-2">
                          <i className="fas fa-envelope me-2 text-primary"></i>
                          Email
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.email}
                          disabled
                          readOnly
                          className={`${styles['form-control-lg']} border-0 bg-light`}
                        />
                      </Form.Group>
                    )}

                    {/* Số điện thoại */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted mb-2">
                        <i className="fas fa-phone me-2 text-primary"></i>
                        Số điện thoại
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={profile?.phone || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className={`${styles['form-control-lg']} border-0 bg-light`}
                      />
                    </Form.Group>

                    {/* Địa chỉ */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        Địa chỉ
                      </Form.Label>
                      <div className={styles['location-card']}>
                        <div className={styles['location-info']}>
                          <div className={styles['location-icon']}>
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div className={styles['location-details']}>
                            <div className={styles['location-address']}>
                              {address || 'Chưa có địa chỉ'}
                            </div>
                            {locationCoords && (
                              <div className={styles['location-coords']}>
                                <i className="fas fa-coordinates me-1"></i>
                                {locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons for Location */}
                        <div className="d-flex gap-2 mt-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowMapModal(true)}
                            className={styles['btn-modern']}
                          >
                            <i className="fas fa-map me-1"></i>
                            Chọn từ bản đồ
                          </Button>
                        </div>
                      </div>
                    </Form.Group>

                    {/* Vai trò - chỉ hiển thị nếu có và không phải USER */}

                     {profile?.role && profile.role !== 'ROLE_USER' && (

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-muted mb-2">
                          <i className="fas fa-user-tag me-2 text-primary"></i>
                          Vai trò
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={getUserRoleDisplay()}
                          disabled
                          readOnly
                          className={`${styles['form-control-lg']} border-0 bg-light`}
                        />
                      </Form.Group>
                    )}

                    {/* Chi nhánh - chỉ hiển thị nếu có và không phải USER */}
                    {(profile?.branchName || profile?.branch) && 

                      profile?.role && 
                      profile.role !== 'ROLE_USER' && (

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-muted mb-2">
                          <i className="fas fa-building me-2 text-primary"></i>
                          Chi nhánh
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.branchName || profile.branch}
                          disabled
                          readOnly
                          className={`${styles['form-control-lg']} border-0 bg-light`}
                        />
                      </Form.Group>
                    )}

                    {/* Action Buttons */}
                    <div className={styles['action-buttons']}>
                      <Button 
                        type="submit" 
                        disabled={saving} 
                        className={`${styles['btn-modern']} ${styles['btn-primary-modern']}`}
                      >
                        {saving ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline-secondary"
                        onClick={() => {
                          // Kiểm tra nếu tài khoản chưa có password (OAuth2)
                          if (!profile?.password || profile.password === null) {
                            setShowSetPwd(true);
                          } else {
                            setShowChangePwd(true);
                          }
                        }}
                        className={`${styles['btn-modern']} ${styles['btn-outline-modern']}`}
                      >
                        <i className="fas fa-key me-2"></i>
                        {(!profile?.password || profile.password === null) ? "Đặt mật khẩu" : "Đổi mật khẩu"}
                      </Button>

                    </div>
                  </Form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      <Modal
        show={showChangePwd}
        onHide={() => setShowChangePwd(false)}
        centered
        className="modal-modern"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <i className="fas fa-key me-2 text-primary"></i>
            Đổi mật khẩu
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePassword}>
          <Modal.Body className="p-4">
            {cpSuccess && <Alert variant="success">{cpSuccess}</Alert>}
            {cpError && <Alert variant="danger">{cpError}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles['form-control-lg']}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles['form-control-lg']}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={styles['form-control-lg']}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="secondary" 
              onClick={() => setShowChangePwd(false)}
              className={styles['btn-modern']}
            >
              Hủy
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={changing}
              className={`${styles['btn-modern']} ${styles['btn-primary-modern']}`}
            >
              {changing ? "Đang đổi..." : "Đổi mật khẩu"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal đặt mật khẩu cho OAuth2 */}
      <Modal
        show={showSetPwd}
        onHide={() => setShowSetPwd(false)}
        centered
        className="modal-modern"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <i className="fas fa-key me-2 text-primary"></i>
            Đặt mật khẩu
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSetPassword}>
          <Modal.Body className="p-4">
            {spSuccess && <Alert variant="success">{spSuccess}</Alert>}
            {spError && <Alert variant="danger">{spError}</Alert>}
            
            <div className="alert alert-info border-0 mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Thông báo:</strong> Tài khoản của bạn hiện tại chỉ có thể đăng nhập bằng Google. 
              Đặt mật khẩu để có thể đăng nhập bằng email và mật khẩu.
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={setPassword}
                onChange={(e) => setSetPassword(e.target.value)}
                className={styles['form-control-lg']}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={confirmSetPassword}
                onChange={(e) => setConfirmSetPassword(e.target.value)}
                className={styles['form-control-lg']}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="secondary" 
              onClick={() => setShowSetPwd(false)}
              className={styles['btn-modern']}
            >
              Hủy
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={setting}
              className={`${styles['btn-modern']} ${styles['btn-primary-modern']}`}
            >
              {setting ? "Đang đặt..." : "Đặt mật khẩu"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Google Maps */}
      <Modal
        show={showMapModal}
        onHide={() => {
          setShowMapModal(false);
          destroyMap();
        }}
        size="xl"
        centered
        className="modal-modern"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <i className="fas fa-map-marked-alt me-2 text-primary"></i>
            Chọn địa chỉ từ bản đồ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row">
               {/* Nút lấy vị trí hiện tại */}
               <div className="d-grid gap-2 mb-3">
                 <Button 
                   variant="outline-primary"
                   disabled={isGettingLocationInModal}
                   onClick={() => {
                     if (navigator.geolocation) {
                       setIsGettingLocationInModal(true);
                       navigator.geolocation.getCurrentPosition(
                         (position) => {
                           const { latitude, longitude } = position.coords;
                           
                           // Cập nhật bản đồ đến vị trí hiện tại
                           if (mapInstanceRef.current) {
                             mapInstanceRef.current.setView([latitude, longitude], 15);
                           }
                           
                           if (markerRef.current) {
                             markerRef.current.setLatLng([latitude, longitude]);
                           }

                           // Reverse geocoding để lấy địa chỉ
                           fetch(
                             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                           )
                             .then(response => response.json())
                             .then(data => {
                               setSearchQuery(data.display_name);
                               setLocationCoords({ lat: latitude, lng: longitude });
                               toast.success('Đã lấy vị trí hiện tại của bạn!');
                             })
                             .catch(error => {
                               console.error('Error reverse geocoding:', error);
                               toast.error('Lỗi khi lấy địa chỉ');
                             })
                             .finally(() => {
                               setIsGettingLocationInModal(false);
                             });
                         },
                         (error) => {
                           console.error('Error getting current location:', error);
                           toast.error('Không thể lấy vị trí hiện tại');
                           setIsGettingLocationInModal(false);
                         },
                         {
                           enableHighAccuracy: true,
                           timeout: 10000,
                           maximumAge: 60000
                         }
                       );
                     } else {
                       toast.error('Trình duyệt không hỗ trợ định vị');
                     }
                   }}
                   className={styles['btn-modern']}
                 >
                   {isGettingLocationInModal ? (
                     <>
                       <i className="fas fa-spinner fa-spin me-2"></i>
                       Đang lấy...
                     </>
                   ) : (
                     <>
                       <i className="fas fa-crosshairs me-2"></i>
                       Lấy vị trí hiện tại
                     </>
                   )}
                 </Button>
               </div>

               {/* Nút xác nhận */}
               <div className="d-grid gap-2">
                 <Button 
                   variant="success"
                   onClick={confirmLocation}
                   className={styles['btn-modern']}
                 >
                   <i className="fas fa-check me-2"></i>
                   Xác nhận địa chỉ
                 </Button>
               </div>

            {/* Cột phải - Bản đồ */}
            <div className="col-md-8">
              <div 
                ref={mapRef} 
                style={{ 
                  height: '400px', 
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowMapModal(false);
              destroyMap();
            }}
            className={styles['btn-modern']}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default AccountPage;
