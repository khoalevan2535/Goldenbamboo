export interface OrderDetailRequestDTO {
  dishId?: number;
  comboId?: number;
  quantity: number;
  price: number;
  name: string;
  discountPercentage?: number;
} 