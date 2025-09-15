import React, { useState, useEffect } from "react";
import { ClientMenuService } from "../../services/ClientMenuService";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
// Removed AddToCartButtonClient import - no longer using cart localStorage
import WishlistButton from "./WishlistButton";
import { useWishlist } from "../../context/WishlistContext";
import "../../style/client/MenuItems.scss";

// Interface phù hợp với dữ liệu từ backend
interface MenuItemProps {
  item: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string; // Sử dụng imageUrl để nhất quán với backend
    status: boolean;
    categoryId: number;
  };
  branchId?: number; // Thêm branchId prop
}

const MenuItem: React.FC<MenuItemProps> = ({ item, branchId = 1 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToRecentlyViewed } = useWishlist();


  // Removed itemData - no longer using cart localStorage

  // Handle item click to add to recently viewed
  const handleItemClick = () => {
    addToRecentlyViewed({
      item_type: 'dish',
      item_id: item.id,
      branch_id: branchId,
      branch_name: `Chi nhánh ${branchId}`,
      name: item.name,
      image_url: item.imageUrl,
      unit_price: item.price,
      final_price: item.price
    });
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };



  return (
    <div
      className="menu-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
    >
      <div className="menu-image">
        <img
          src={getImageUrl(item.imageUrl)} // Sử dụng imageUrl
          alt={item.name}
          className={isHovered ? "scale-110" : "scale-100"}
          onError={handleImageError}
        />
        <div className={`overlay ${isHovered ? "opacity-30" : "opacity-0"}`} />
        {item.status && <div className="status-badge">Có sẵn</div>}
        
        {/* Wishlist Button */}
        <WishlistButton
          item={{
            item_type: 'dish',
            item_id: item.id,
            branch_id: branchId,
            branch_name: `Chi nhánh ${branchId}`,
            name: item.name,
            image_url: item.imageUrl,
            unit_price: item.price,
            final_price: item.price
          }}
          size="sm"
          className="floating"
        />
      </div>

      <div className="menu-content">
        <h3>{item.name}</h3>
        <p className="description">{item.description || "Món ăn ngon"}</p>
        <div className="menu-footer">
          <div className="price-section">
            <span className="price">{formatPrice(item.price)}</span>
          </div>
          <div className="action-section">
            {/* Removed AddToCartButtonClient - no longer using cart localStorage */}
            <button 
              className={`btn ${item.status ? "btn-primary" : "btn-secondary"}`}
              disabled={!item.status}
            >
              {item.status ? "Thêm vào giỏ" : "Hết hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;