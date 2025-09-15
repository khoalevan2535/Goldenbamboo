import { type ReservationStatus } from './enums/ReservationStatus';

export interface ReservationResponseDTO {
  id: number;
  reservationTime: string;
  numberOfGuests: number;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  tableName: string;
  branchName: string;
} 