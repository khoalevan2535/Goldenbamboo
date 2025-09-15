import apiClient from '../utils/apiClient';
import { GHTKAddress } from './GHTKService';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  type: 'dish' | 'combo';
}

export interface CreateOrderRequest {
  items: OrderItem[];
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryAddress: GHTKAddress;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'VNPAY' | 'COD';
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  message: string;
  paymentUrl?: string;
  ghtkOrderId?: string;
}

class OrderService {
  /**
   * Tạo đơn hàng và xử lý thanh toán
   */
  async createOrderWithPayment(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('🚀 Creating order with payment:', orderData);
      
      const response = await apiClient.post('/client/orders/create-with-payment', orderData);
      
      console.log('✅ Order creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  }

  /**
   * Xác nhận thanh toán thành công và tạo đơn GHTK
   */
  async confirmPaymentAndCreateGHTKOrder(orderId: string): Promise<CreateOrderResponse> {
    try {
      console.log('🚀 Confirming payment and creating GHTK order for:', orderId);
      
      const response = await apiClient.post(`/client/orders/${orderId}/confirm-payment`);
      
      console.log('✅ Payment confirmation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error confirming payment:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
    }
  }

  /**
   * Lấy thông tin đơn hàng
   */
  async getOrder(orderId: string) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response;
    } catch (error: any) {
      console.error('Error getting order:', error);
      throw new Error('Không thể lấy thông tin đơn hàng');
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: string, reason?: string) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
      return response;
    } catch (error: any) {
      console.error('Error canceling order:', error);
      throw new Error('Không thể hủy đơn hàng');
    }
  }
}

export const orderService = new OrderService();