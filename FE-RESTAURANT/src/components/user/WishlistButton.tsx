import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../../style/client/WishlistButton.scss';

interface WishlistButtonProps {
  item: {
    item_type: 'dish' | 'combo';
    item_id: number;
    branch_id: number;
    branch_name: string;
    name: string;
    image_url: string;
    unit_price: number;
    discount_value?: number;
    discount_percentage?: number;
    final_price: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  item,
  size = 'md',
  showText = false,
  className = ''
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const itemId = `${item.item_type}-${item.item_id}-${item.branch_id}`;
  const isInWishlistItem = isInWishlist(itemId);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);

    try {
      if (isInWishlistItem) {
        removeFromWishlist(itemId);
        toast.success(`Đã xóa "${item.name}" khỏi danh sách yêu thích`, {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        addToWishlist(item);
        toast.success(`Đã thêm "${item.name}" vào danh sách yêu thích`, {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại', {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'wishlist-btn-sm';
      case 'lg':
        return 'wishlist-btn-lg';
      default:
        return 'wishlist-btn-md';
    }
  };

  return (
    <button
      className={`wishlist-button ${getSizeClasses()} ${isInWishlistItem ? 'in-wishlist' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
      onClick={handleToggleWishlist}
      title={isInWishlistItem ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      aria-label={isInWishlistItem ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isInWishlistItem ? (
        <FaHeart className="wishlist-icon filled" />
      ) : (
        <FaRegHeart className="wishlist-icon outline" />
      )}
      {showText && (
        <span className="wishlist-text">
          {isInWishlistItem ? 'Đã yêu thích' : 'Yêu thích'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;






