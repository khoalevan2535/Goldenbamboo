export interface CartRequestDTO {
  branchId: number;
  accountId?: number;
  sessionId?: string;
  itemId: number;
  itemType: 'dish' | 'combo';
  quantity: number;
  specialInstructions?: string;
}







