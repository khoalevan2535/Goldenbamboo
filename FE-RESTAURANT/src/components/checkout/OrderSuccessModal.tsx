import React from 'react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  totalAmount: number;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderId,
  totalAmount,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đặt hàng thành công!
          </h3>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold text-orange-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="text-sm text-gray-500 mb-6">
            <p>• Đơn hàng sẽ được xử lý trong vòng 15-30 phút</p>
            <p>• Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã cung cấp</p>
            <p>• Thời gian giao hàng dự kiến: 30-45 phút</p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};







