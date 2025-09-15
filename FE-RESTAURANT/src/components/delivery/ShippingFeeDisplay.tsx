import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DeliveryAddressResponseDTO, GHTKResponseDTO } from '../../interfaces/DeliveryAddressDTO';
import { deliveryAddressService } from '../../services/DeliveryAddressService';

interface ShippingFeeDisplayProps {
  deliveryAddress: DeliveryAddressResponseDTO;
  weight?: number; // Weight in grams
  value?: number; // Value in VND
  onFeeCalculated?: (fee: number) => void;
}

const ShippingFeeDisplay: React.FC<ShippingFeeDisplayProps> = ({
  deliveryAddress,
  weight = 1000, // Default 1kg
  value = 100000, // Default 100k VND
  onFeeCalculated
}) => {
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deliveryAddress) {
      calculateShippingFee();
    }
  }, [deliveryAddress, weight, value]);

  const calculateShippingFee = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: GHTKResponseDTO = await deliveryAddressService.calculateShippingFee(deliveryAddress.id);
      
      if (response.success && response.fee) {
        const fee = response.fee.fee || 0;
        setShippingFee(fee);
        onFeeCalculated?.(fee);
      } else {
        setError(response.message || 'Không thể tính phí vận chuyển');
        setShippingFee(0);
        onFeeCalculated?.(0);
      }
    } catch (error: any) {
      console.error('Error calculating shipping fee:', error);
      setError('Không thể tính phí vận chuyển');
      setShippingFee(0);
      onFeeCalculated?.(0);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Phí vận chuyển</h4>
            <p className="text-sm text-gray-600">
              Địa chỉ: {deliveryAddress.shortAddress}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Đang tính...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-red-900">Lỗi tính phí vận chuyển</h4>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-sm text-red-600">
              Địa chỉ: {deliveryAddress.shortAddress}
            </p>
          </div>
          <button
            onClick={calculateShippingFee}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-green-900">Phí vận chuyển</h4>
          <p className="text-sm text-green-700">
            Địa chỉ: {deliveryAddress.shortAddress}
          </p>
          <p className="text-xs text-green-600">
            Giao Hàng Tiết Kiệm
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-green-900">
            {formatPrice(shippingFee)}
          </p>
          <p className="text-xs text-green-600">
            {weight}g - {formatPrice(value)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingFeeDisplay;
