import { type OrderItemRequestDTO } from './OrderItemRequestDTO';

export interface OrderRequestDTO {
  tableId?: number | null;        // ID bàn (bắt buộc)

  customerName?: string;          // Tên khách hàng
  customerPhone?: string;         // Số điện thoại khách hàng
  customerEmail?: string;         // Email khách hàng
  address?: string;               // Địa chỉ giao hàng
  notes?: string;                 // Ghi chú đơn hàng

  // Danh sách món ăn/đồ uống
  items: OrderItemRequestDTO[];

  // Thông tin khuyến mãi cho cả đơn hàng
  discountId?: number;
  
  // Ghi chú đặc biệt cho đơn hàng
  specialInstructions?: string;

  // Thông tin giao hàng
  deliveryType?: "pickup" | "delivery";
  deliveryAddressId?: number;
  shippingFee?: number;

  // Legacy fields - giữ lại để tương thích
  description?: string;
  prepay?: number;
} 