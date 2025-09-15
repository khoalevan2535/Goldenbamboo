import { type MenuItemStatus } from './enums/MenuItemStatus';

export interface DishRequestDTO {
  name: string;
  image?: string;
  description?: string;
  basePrice: number;
  categoryId: number;

  // Thêm các field discount
  discountPercentage?: number; // Phần trăm giảm giá (0-100)
  discountAmount?: number; // Số tiền giảm giá cố định
  discountStartDate?: string; // Ngày bắt đầu giảm giá
  discountEndDate?: string; // Ngày kết thúc giảm giá
  discountActive?: boolean; // Trạng thái giảm giá
} 