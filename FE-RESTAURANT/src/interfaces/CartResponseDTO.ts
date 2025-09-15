export interface CartResponseDTO {
  id: number;
  accountId?: number;
  accountName?: string;
  sessionId?: string;
  branchId: number;
  branchName: string;
  totalAmount: number;
  totalItems: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  cartItems: CartItemResponseDTO[];
}







