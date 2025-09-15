import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DeliveryAddressResponseDTO, GHTKResponseDTO } from '../../interfaces/DeliveryAddressDTO';
import { deliveryAddressService } from '../../services/DeliveryAddressService';
import DeliveryAddressList from './DeliveryAddressList';

interface DeliveryAddressSelectorProps {
  onAddressSelect: (address: DeliveryAddressResponseDTO, shippingFee?: number) => void;
  selectedAddressId?: number;
  showShippingFee?: boolean;
}

const DeliveryAddressSelector: React.FC<DeliveryAddressSelectorProps> = ({
  onAddressSelect,
  selectedAddressId,
  showShippingFee = true
}) => {
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddressResponseDTO | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    if (selectedAddressId && selectedAddress) {
      calculateShippingFee();
    }
  }, [selectedAddressId, selectedAddress]);

  const calculateShippingFee = async () => {
    if (!selectedAddress || !showShippingFee) return;

    try {
      setLoadingFee(true);
      const response: GHTKResponseDTO = await deliveryAddressService.calculateShippingFee(selectedAddress.id);
      
      if (response.success && response.fee) {
        setShippingFee(response.fee.fee || 0);
        onAddressSelect(selectedAddress, response.fee.fee || 0);
      } else {
        console.error('Failed to calculate shipping fee:', response.message);
        toast.error('Không thể tính phí vận chuyển');
      }
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      toast.error('Không thể tính phí vận chuyển');
    } finally {
      setLoadingFee(false);
    }
  };

  const handleAddressSelect = (address: DeliveryAddressResponseDTO) => {
    setSelectedAddress(address);
    
    if (showShippingFee) {
      calculateShippingFee();
    } else {
      onAddressSelect(address);
    }
  };

  return (
    <div className="delivery-address-selector">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn địa chỉ giao hàng</h3>
        <p className="text-sm text-gray-600">
          Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới
        </p>
      </div>

      <DeliveryAddressList
        onSelectAddress={handleAddressSelect}
        selectedAddressId={selectedAddressId}
        showActions={true}
      />

      {selectedAddress && showShippingFee && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">Phí vận chuyển</h4>
              <p className="text-sm text-gray-600">
                Địa chỉ: {selectedAddress.shortAddress}
              </p>
            </div>
            <div className="text-right">
              {loadingFee ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Đang tính...</span>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {shippingFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                  <p className="text-xs text-gray-500">Giao Hàng Tiết Kiệm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAddress && (
        <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Đã chọn địa chỉ giao hàng
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {selectedAddress.recipientName} - {selectedAddress.phoneNumber}
          </p>
          <p className="text-sm text-green-600">
            {selectedAddress.fullAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressSelector;
