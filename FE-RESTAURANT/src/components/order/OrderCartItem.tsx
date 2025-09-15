import React, { useState } from 'react';
import { CartItemResponseDTO } from '../../interfaces/CartItemResponseDTO';
import { useEnhancedCart } from '../../context/EnhancedCartContext';
import { LoadingSpinner } from '../LoadingSpinner';

interface OrderCartItemProps {
  item: CartItemResponseDTO;
}

export const OrderCartItem: React.FC<OrderCartItemProps> = ({ item }) => {
  const { updateCartItem, removeItemFromCart, state } = useEnhancedCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateCartItem(item.id, { quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeItemFromCart(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start space-x-3">
        {/* Item Image */}
        <div className="flex-shrink-0">
          <img
            src={item.itemImage || '/images/default-dish.svg'}
            alt={item.itemName}
            className="w-12 h-12 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/default-dish.svg';
            }}
          />
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {item.itemName}
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {item.itemType === 'dish' ? 'Món ăn' : 'Combo'}
              </p>
              {item.specialInstructions && (
                <p className="text-xs text-gray-600 mt-1 italic">
                  Ghi chú: {item.specialInstructions}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving || state.loading}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Xóa khỏi giỏ hàng"
            >
              {isRemoving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || state.loading || item.quantity <= 1}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <span className="text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center">
                {isUpdating ? <LoadingSpinner size="sm" /> : item.quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || state.loading}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(item.finalPrice)}
              </div>
              {item.discountAmount > 0 && (
                <div className="text-xs text-green-600">
                  Tiết kiệm: {formatPrice(item.discountAmount)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};







