export interface OrderDetailResponseDTO {
  id: number;
  quantity: number;
  price: number;
  name: string;
  discountPercentage?: number;
  menuItemId: number;
  menuItemName: string;
  orderId: number;
  dishId?: number;
  comboId?: number;
  createdAt: string;
  updatedAt: string;
} 