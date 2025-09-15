export interface TableHistoryDTO {
  id: number;
  tableId: number;
  tableName: string;
  action: string;
  userId?: number;
  userName?: string;
  orderId?: number;
  reservationId?: number;
  notes?: string;
  createdAt: string;
}
