import { type PaymentMethod } from './enums/PaymentMethod';

export interface PaymentRequestDTO {
  paymentMethod: PaymentMethod;
  cashReceived: number;
} 