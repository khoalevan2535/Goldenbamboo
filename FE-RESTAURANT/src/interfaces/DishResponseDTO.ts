import { type ItemAvailabilityStatus } from "./enums/MenuItemStatus";

export interface DishResponseDTO {
  id: string;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  availabilityStatus: ItemAvailabilityStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  categoryId: number;
  categoryName: string;
  inUse?: boolean;

  // Discount entity relationship
  discount?: {
    id: number;
    code: string;
    name: string;
    newPrice: number;
    startDate: string;
    endDate: string;
    status: string;
    description?: string;
  };

  // Thêm field tính toán giá sau giảm
  finalPrice?: number; // Giá cuối cùng sau khi áp dụng giảm giá
} 