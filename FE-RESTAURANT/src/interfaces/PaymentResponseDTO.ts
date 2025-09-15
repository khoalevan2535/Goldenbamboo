import type { OrderResponseDTO } from './OrderResponseDTO';

export interface PaymentResponseDTO {
  order: OrderResponseDTO;
  changeDue: number;
} 