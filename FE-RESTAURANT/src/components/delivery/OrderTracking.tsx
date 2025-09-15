import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GHTKResponseDTO } from '../../interfaces/DeliveryAddressDTO';
import { deliveryAddressService } from '../../services/DeliveryAddressService';

interface OrderTrackingProps {
  trackingNumber: string;
  onTrackingUpdate?: (trackingInfo: GHTKResponseDTO) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  trackingNumber,
  onTrackingUpdate
}) => {
  const [trackingInfo, setTrackingInfo] = useState<GHTKResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      trackOrder();
    }
  }, [trackingNumber]);

  const trackOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: GHTKResponseDTO = await deliveryAddressService.trackOrder(trackingNumber);
      
      if (response.success) {
        setTrackingInfo(response);
        onTrackingUpdate?.(response);
      } else {
        setError(response.message || 'Không thể theo dõi đơn hàng');
      }
    } catch (error: any) {
      console.error('Error tracking order:', error);
      setError('Không thể theo dõi đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'picking':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'Đã giao hàng';
      case 'shipping':
        return 'Đang giao hàng';
      case 'picking':
        return 'Đang lấy hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Đang theo dõi đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể theo dõi đơn hàng</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={trackOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Theo dõi đơn hàng</h3>
          <p className="text-sm text-gray-600">Mã vận đơn: {trackingNumber}</p>
        </div>
        <button
          onClick={trackOrder}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
        >
          Làm mới
        </button>
      </div>

      {trackingInfo.order && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trackingInfo.order.status)}`}>
                {getStatusText(trackingInfo.order.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Ngày tạo</p>
              <p className="text-sm font-medium text-gray-900">
                {trackingInfo.order.created ? new Date(trackingInfo.order.created).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>

          {trackingInfo.order.message && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Thông báo:</strong> {trackingInfo.order.message}
              </p>
            </div>
          )}

          {trackingInfo.order.partner_id && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Mã đối tác:</strong> {trackingInfo.order.partner_id}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
