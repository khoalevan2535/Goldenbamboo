export interface ReservationDetailResponseDTO {
  id: number;
  quantity: number;
  menuItemId: number;
  menuItemName: string;
  dishId?: number;
  comboId?: number;
} 