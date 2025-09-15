import React, { useState, useEffect } from "react";
import { ClientMenuService } from "../../services/ClientMenuService";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
// Removed AddToCartButtonClient import - no longer using cart localStorage
import "../../style/client/ComboItems.scss";

interface ComboItemData {
  id: number;
  name: string;
  description: string;
  imageUrl: string; // Sử dụng imageUrl để nhất quán với backend
  price: number;
  status: boolean;
  comboDishes: {
    id: number;
    comboId: number;
    comboName: string;
    dishId: number;
    dishName: string;
  }[];
}

interface ComboItemProps {
  combo: ComboItemData;
  branchId?: number; // Thêm branchId prop
}

const ComboItem: React.FC<ComboItemProps> = ({ combo, branchId = 1 }) => {


  // Removed itemData - no longer using cart localStorage

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };



  return (
    <div className="combo-card" title={`Combo: ${combo.name}`}>
      <div className="combo-image">
        <img
          src={getImageUrl(combo.imageUrl)} // Sử dụng imageUrl
          alt={combo.name}
          loading="lazy"
          className="hover-zoom"
          onError={handleImageError}
        />
        <div className="badge">Combo</div>

      </div>

      <div className="combo-content">
        <h3>{combo.name}</h3>
        <p className="description">{combo.description}</p>

        <div className="dishes">
          <h4>Bao gồm:</h4>
          <ul>
            {combo.comboDishes.slice(0, 3).map((dish) => (
              <li key={dish.id}>
                <span className="dot"></span>
                {dish.dishName}
              </li>
            ))}
            {combo.comboDishes.length > 3 && (
              <li className="more">
                +{combo.comboDishes.length - 3} món khác...
              </li>
            )}
          </ul>
        </div>

        <div className="combo-footer">
          <div className="price-section">
            <span className="price">{formatPrice(combo.price)}</span>
          </div>
          <div className="action-section">
            {/* Removed AddToCartButtonClient - no longer using cart localStorage */}
            <button 
              className={`btn ${combo.status ? "btn-primary" : "btn-secondary"}`}
              disabled={!combo.status}
              aria-label={`Thêm combo ${combo.name} vào giỏ hàng`}
            >
              {combo.status ? "Thêm vào giỏ" : "Hết hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboItem;
