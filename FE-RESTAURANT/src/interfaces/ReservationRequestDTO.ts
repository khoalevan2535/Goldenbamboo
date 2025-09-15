export interface ReservationRequestDTO {
  branchId: number;
  tableId: number;
  reservationTime: string;
  numberOfGuests: number;
  notes: string;
} 