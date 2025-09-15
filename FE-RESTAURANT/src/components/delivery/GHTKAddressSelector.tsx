import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ghtkService, GHTKProvince, GHTKDistrict, GHTKWard, GHTKAddress, GHTKDeliveryFee } from '../../services/GHTKService';
import './GHTKAddressSelector.scss';

interface GHTKAddressSelectorProps {
  onAddressSelect: (address: GHTKAddress, shippingFee?: number) => void;
  selectedAddress?: GHTKAddress;
  showShippingFee?: boolean;
  defaultRecipientName?: string;
  defaultPhoneNumber?: string;
}

const GHTKAddressSelector: React.FC<GHTKAddressSelectorProps> = ({
  onAddressSelect,
  selectedAddress,
  showShippingFee = true,
  defaultRecipientName = '',
  defaultPhoneNumber = ''
}) => {
  const [provinces, setProvinces] = useState<GHTKProvince[]>([]);
  const [districts, setDistricts] = useState<GHTKDistrict[]>([]);
  const [wards, setWards] = useState<GHTKWard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    distance?: number;
    estimatedTime?: string;
    totalFee?: number;
  }>({});

  // Form data
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [hamlet, setHamlet] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    loadProvinces();
  }, []);

  // Điền sẵn thông tin người nhận từ props
  useEffect(() => {
    if (defaultRecipientName && !recipientName) {
      setRecipientName(defaultRecipientName);
    }
    if (defaultPhoneNumber && !phoneNumber) {
      setPhoneNumber(defaultPhoneNumber);
    }
  }, [defaultRecipientName, defaultPhoneNumber, recipientName, phoneNumber]);

  useEffect(() => {
    if (selectedAddress) {
      setSelectedProvince(selectedAddress.province);
      setSelectedDistrict(selectedAddress.district);
      setSelectedWard(selectedAddress.ward);
      setAddress(selectedAddress.address);
      setHamlet(selectedAddress.hamlet || '');
      setRecipientName(selectedAddress.recipientName);
      setPhoneNumber(selectedAddress.phoneNumber);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
      setSelectedDistrict('');
      setSelectedWard('');
      setWards([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard && address && showShippingFee) {
      // Debounce để tránh gọi API liên tục
      const timeoutId = setTimeout(() => {
        calculateShippingFee();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedProvince, selectedDistrict, selectedWard, address, showShippingFee]);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const data = await ghtkService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('❌ GHTKAddressSelector: Error loading provinces:', error);
      toast.error('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceId: string) => {
    try {
      setLoading(true);
      const data = await ghtkService.getDistricts(provinceId);
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Không thể tải danh sách quận/huyện');
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (districtId: string) => {
    try {
      setLoading(true);
      const data = await ghtkService.getWards(districtId);
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
      toast.error('Không thể tải danh sách phường/xã');
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingFee = async () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard || !address) return;

    try {
      setLoadingFee(true);
      const addressData: GHTKAddress = {
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
        address: address,
        recipientName: recipientName,
        phoneNumber: phoneNumber
      };

      const feeData = await ghtkService.calculateDeliveryFee(addressData);
      setShippingFee(feeData.fee || 0);
      setDeliveryInfo({
        distance: feeData.distance,
        estimatedTime: feeData.estimated_delivery_time,
        totalFee: feeData.total_fee
      });
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      toast.error('Không thể tính phí vận chuyển');
    } finally {
      setLoadingFee(false);
    }
  };

  const handleAddressSelect = () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard || !address || !recipientName || !phoneNumber) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }

    const addressData: GHTKAddress = {
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      address: address,
      hamlet: hamlet,
      recipientName: recipientName,
      phoneNumber: phoneNumber
    };

    console.log('🏠 GHTKAddressSelector: Calling onAddressSelect with:', addressData);
    onAddressSelect(addressData);
  };

  const getProvinceName = (provinceId: string) => {
    return provinces.find(p => p.id === provinceId)?.name || provinceId;
  };

  const getDistrictName = (districtId: string) => {
    return districts.find(d => d.id === districtId)?.name || districtId;
  };

  const getWardName = (wardId: string) => {
    return wards.find(w => w.id === wardId)?.name || wardId;
  };

  // Debug log removed to prevent console spam

  return (
    <div className="ghtk-address-selector">
      {/* Header Section */}
      <div className="address-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="header-text">
            <h3 className="header-title">Địa chỉ giao hàng</h3>
            <p className="header-subtitle">
              Nhập địa chỉ để tính phí vận chuyển và thời gian giao hàng
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="address-form">
        {/* Recipient Info */}
        <div className="form-section">
          <h4 className="section-title">Thông tin người nhận</h4>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Tên người nhận <span className="required">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nhập tên người nhận"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Address Selection */}
        <div className="form-section">
          <h4 className="section-title">Địa chỉ giao hàng</h4>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Tỉnh/Thành phố <span className="required">*</span>
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {Array.isArray(provinces) && provinces.length > 0 ? (
                  provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải dữ liệu...</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Quận/Huyện <span className="required">*</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="form-select"
                disabled={!selectedProvince || loading}
              >
                <option value="">Chọn quận/huyện</option>
                {Array.isArray(districts) && districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Phường/Xã <span className="required">*</span>
              </label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="form-select"
                disabled={!selectedDistrict || loading}
              >
                <option value="">Chọn phường/xã</option>
                {Array.isArray(wards) && wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Địa chỉ chi tiết <span className="required">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường..."
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Thôn/Ấp/Xóm/Tổ (tùy chọn)
              </label>
              <input
                type="text"
                value={hamlet}
                onChange={(e) => setHamlet(e.target.value)}
                placeholder="Ví dụ: Tổ 1, Khu phố 2, Ấp 3... (không bắt buộc)"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Address Display */}
        {selectedProvince && selectedDistrict && selectedWard && address && (
          <div className="address-display">
            <div className="address-info">
              <h4>Địa chỉ giao hàng</h4>
              <p>
                {address}{hamlet ? `, ${hamlet}` : ''}, {getWardName(selectedWard)}, {getDistrictName(selectedDistrict)}, {getProvinceName(selectedProvince)}
              </p>
              {recipientName && phoneNumber && (
                <p>
                  Người nhận: {recipientName} - {phoneNumber}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shipping Fee Display */}
        {showShippingFee && selectedProvince && selectedDistrict && selectedWard && address && (
          <div className="address-display" style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)', borderColor: '#9ae6b4' }}>
            <div className="address-info">
              <h4 style={{ color: '#22543d' }}>💰 Phí vận chuyển GHTK</h4>
              {loadingFee ? (
                <p style={{ color: '#2f855a' }}>Đang tính phí...</p>
              ) : (
                <div>
                  <p style={{ color: '#22543d', fontSize: '16px', fontWeight: '600' }}>
                    {shippingFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                  {deliveryInfo.distance && (
                    <p style={{ color: '#2f855a', fontSize: '12px' }}>
                      📍 Khoảng cách: {deliveryInfo.distance}km
                    </p>
                  )}
                  {deliveryInfo.estimatedTime && (
                    <p style={{ color: '#2f855a', fontSize: '12px' }}>
                      ⏰ Thời gian: {deliveryInfo.estimatedTime}
                    </p>
                  )}
                  {deliveryInfo.totalFee && deliveryInfo.totalFee !== shippingFee && (
                    <p style={{ color: '#2f855a', fontSize: '12px' }}>
                      💰 Tổng phí: {deliveryInfo.totalFee.toLocaleString('vi-VN')} VNĐ
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nút chọn địa chỉ */}
        <div className="flex justify-end">
          <button
            onClick={handleAddressSelect}
            disabled={!selectedProvince || !selectedDistrict || !selectedWard || !address || !recipientName || !phoneNumber}
            className="use-address-btn"
          >
            Sử dụng địa chỉ này
          </button>
        </div>
      </div>
    </div>
  );
};

export default GHTKAddressSelector;
