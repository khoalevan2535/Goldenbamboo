export interface OrderItemRequestDTO {
  id?: number;                    // ID của order item (cho update)
  orderId?: number;               // ID của order
  
  // Có thể là dishId hoặc comboId (không bắt buộc cả hai)
  dishId?: number;                // ID của dish
  comboId?: number;               // ID của combo
  
  // Legacy field - giữ lại để tương thích
  menuDishId?: number;            // ID của món ăn trong menu
  
  quantity: number;               // Số lượng (bắt buộc, >= 1)
  
  // Ghi chú đặc biệt cho món ăn (ít cay, không đá, thêm topping...)
  specialInstructions?: string;
  
  // Giá của món ăn tại thời điểm đặt (có thể thay đổi)
  unitPrice?: number;
  
  // Thông tin khuyến mãi cho món ăn cụ thể
  discountId?: number;
  
  // Phần trăm giảm giá cho món này
  discountPercentage?: number;
  
  // Ghi chú cho món
  note?: string;
} 