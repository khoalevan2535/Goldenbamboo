export interface CartItemResponseDTO {
  id: number;
  cartId: number;
  itemId: number;
  itemName: string;
  itemImage?: string;
  itemType: 'dish' | 'combo';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  discountId?: number;
  discountName?: string;
  discountType?: string;
  discountValue?: number;
}







