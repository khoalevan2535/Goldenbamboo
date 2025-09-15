import React, { useState } from 'react';
import { useEnhancedCart } from '../../context/EnhancedCartContext';
import { cartOrderService } from '../../services/CartOrderService';
import { OrderRequestDTO } from '../../interfaces/OrderRequestDTO';
import { LoadingSpinner } from '../LoadingSpinner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderId: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { state, clearCart } = useEnhancedCart();
  const [formData, setFormData] = useState({
    customerPhone: '',
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'BANK_TRANSFER',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.cart) {
      setError('Giỏ hàng không tồn tại');
      return;
    }

    if (!formData.customerPhone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderRequest: OrderRequestDTO = {
        branchId: state.cart.branchId,
        customerPhone: formData.customerPhone.trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        tableId: 0, // Required field but not used for delivery orders
        totalAmount: state.cart.totalAmount,
        items: [], // Items will be taken from cart
      };

      const order = await cartOrderService.convertCartToOrder(state.cart.id, orderRequest);
      
      // Clear cart after successful order
      await clearCart();
      
      // Close modal and notify success
      onClose();
      onSuccess?.(order.id);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Đặt hàng</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          {state.cart && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Tóm tắt đơn hàng</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số món:</span>
                  <span>{state.cart.totalItems} món</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chi nhánh:</span>
                  <span>{state.cart.branchName}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-600">{formatPrice(state.cart.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={isSubmitting}
              >
                <option value="CASH">Tiền mặt</option>
                <option value="CARD">Thẻ</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Đang xử lý...</span>
                  </>
                ) : (
                  'Đặt hàng'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};







