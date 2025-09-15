import { type OrderItemResponseDTO } from './OrderItemResponseDTO';
import { type OrderStatus } from './enums/OrderStatus';
import { type PaymentMethod } from './enums/PaymentMethod';

export interface OrderResponseDTO {
  id: number;
  orderDate: string;
  paymentMethod?: PaymentMethod;
  prepay?: number;
  status: OrderStatus;
  description?: string;
  notes?: string;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
  accountId?: number;
  accountName?: string;
  branchId: number;
  branchName: string;
  tableId: number | null;
  tableName: string;

  orderDetails: OrderDetailResponseDTO[];
} 