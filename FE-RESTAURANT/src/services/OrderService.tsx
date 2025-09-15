import apiClient from '../utils/Api';
// Removed cartStoreClient import - no longer using cart localStorage

// Interface cho thông tin đơn hàng
export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  note?: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  branchId: number;
  tableId?: number;
  accountId?: number;
  items: OrderItemRequest[];
  totalAmount: number;
  totalDiscount: number;
  orderType?: 'ONLINE' | 'COUNTER'; // Phân biệt order online vs tại quầy
}

// Interface cho item trong đơn hàng
export interface OrderItemRequest {
  name: string;
  price: number;
  quantity: number;
  dishId?: number;
  comboId?: number;
  discountPercentage?: number;
}

// Interface cho response đơn hàng
export interface OrderResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  note?: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELED';
  totalAmount: number;
  totalDiscount: number;
  branchId: number;
  branchName: string;
  tableId?: number;
  accountId?: number;
  orderDate: string;
  items: OrderItemResponse[];
}

// Interface cho item response
export interface OrderItemResponse {
  id: number;
  name: string;
  price: number;
  quantity: number;
  dishId?: number;
  comboId?: number;
  discountPercentage?: number;
  totalPrice: number;
}

// Interface cho thông tin thanh toán
export interface PaymentInfo {
  orderId: number;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  transactionId?: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export const OrderService = {
  // Tạo đơn hàng mới
  createOrder: async (orderData: OrderRequest): Promise<OrderResponse> => {
    try {
      const response = await apiClient.post<OrderResponse>('/api/client/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Lấy thông tin đơn hàng theo ID
  getOrderById: async (orderId: number): Promise<OrderResponse> => {
    try {
      const response = await apiClient.get<OrderResponse>(`/api/client/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng của user
  getUserOrders: async (accountId: number): Promise<OrderResponse[]> => {
    try {
      const response = await apiClient.get<OrderResponse[]>(`/api/client/orders/user/${accountId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Lấy tất cả đơn hàng (cho admin)
  getAll: async (): Promise<OrderResponse[]> => {
    try {
      const response = await apiClient.get<OrderResponse[]>('/api/orders');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Tạo đơn hàng từ giỏ hàng
  createOrderFromCart: async (
    cartItems: any[],
    customerInfo: { name: string; phone: string; email?: string; address: string; note?: string; },
    paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER',
    branchId: number,
    accountId?: number
  ): Promise<OrderResponse> => {
    try {
      // Tính tổng tiền và giảm giá
      const totalAmount = cartItems.reduce((sum, item) => {
        const itemTotal = item.unit_price * item.qty;
        const discountAmount = itemTotal * ((item.discount_percentage || 0) / 100);
        return sum + itemTotal - discountAmount;
      }, 0);

      const totalDiscount = cartItems.reduce((sum, item) => {
        const itemTotal = item.unit_price * item.qty;
        const discountAmount = itemTotal * ((item.discount_percentage || 0) / 100);
        return sum + discountAmount;
      }, 0);

      // Chuyển đổi cart items thành order items
      const orderItems: OrderItemRequest[] = cartItems.map(item => ({
        name: item.name,
        price: item.unit_price,
        quantity: item.qty,
        dishId: item.item_type === 'dish' ? item.item_id : undefined,
        comboId: item.item_type === 'combo' ? item.item_id : undefined,
        discountPercentage: item.discount_percentage || 0,
      }));

      const orderData: OrderRequest = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        customerAddress: customerInfo.address,
        note: customerInfo.note,
        paymentMethod,
        branchId,
        accountId,
        items: orderItems,
        totalAmount,
        totalDiscount,
      };

      const response = await apiClient.post<OrderResponse>('/api/client/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }
  },

  // Ước tính thời gian giao hàng
  estimateDeliveryTime: async (branchId: number): Promise<number> => {
    try {
      const response = await apiClient.get<number>(`/api/client/orders/estimate-delivery/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error estimating delivery time:', error);
      return 30; // Mặc định 30 phút
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (orderId: number, status: string): Promise<OrderResponse> => {
    try {
      const response = await apiClient.patch<OrderResponse>(`/api/client/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/client/orders/${orderId}`);
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  },

  // Xử lý thanh toán
  processPayment: async (orderId: number, paymentInfo: PaymentInfo): Promise<PaymentInfo> => {
    try {
      const response = await apiClient.post<PaymentInfo>(`/api/client/orders/${orderId}/payment`, paymentInfo);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
}; 