import React, { useState } from 'react';
import { ClientMenuItemDTO } from '../../interfaces/ClientMenuItemDTO';
import { useEnhancedCart } from '../../context/EnhancedCartContext';
import { LoadingSpinner } from '../LoadingSpinner';
import { AddToCartNotification } from '../cart/AddToCartNotification';

interface OrderMenuItemProps {
  item: ClientMenuItemDTO;
  onAddToCart?: () => void;
}

export const OrderMenuItem: React.FC<OrderMenuItemProps> = ({ item, onAddToCart }) => {
  const { addItemToCart, getItemQuantity, isItemInCart, state } = useEnhancedCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = async () => {
    if (!state.branchId) {
      alert('Vui lòng chọn chi nhánh trước khi thêm món vào giỏ hàng');
      return;
    }

    setIsAdding(true);
    try {
      await addItemToCart({
        itemId: item.id,
        itemType: item.type,
        quantity: 1,
      });
      setShowNotification(true);
      onAddToCart?.();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert('Có lỗi xảy ra khi thêm món vào giỏ hàng');
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const currentQuantity = getItemQuantity(item.id, item.type);
  const isInCart = isItemInCart(item.id, item.type);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-32 bg-gray-100">
        <img
          src={item.imageUrl || '/images/default-dish.svg'}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-dish.svg';
          }}
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.type === 'combo' 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {item.type === 'combo' ? 'COMBO' : 'MÓN LẺ'}
          </span>
        </div>

        {/* Availability Status */}
        {!item.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
          {item.name}
        </h3>
        
        {item.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Category */}
        {item.categoryName && (
          <p className="text-xs text-gray-500 mb-2">
            {item.categoryName}
          </p>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-orange-600">
            {formatPrice(item.price)}
          </div>

          <div className="flex items-center space-x-1">
            {isInCart && currentQuantity > 0 && (
              <span className="text-xs text-gray-600 bg-gray-100 px-1 py-0.5 rounded">
                {currentQuantity}
              </span>
            )}
            
            <button
              onClick={handleAddToCart}
              disabled={!item.available || isAdding || state.loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isAdding ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-1">...</span>
                </>
              ) : (
                'Thêm'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart Notification */}
      <AddToCartNotification
        show={showNotification}
        itemName={item.name}
        quantity={1}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
};







