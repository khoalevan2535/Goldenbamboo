import apiClient from '../utils/apiClient';
import { type OrderRequestDTO } from '../interfaces/OrderRequestDTO';
import { type OrderResponseDTO } from '../interfaces/OrderResponseDTO';

const API_URL = '/staff/orders';

export const StaffOrderService = {
  // Tạo đơn hàng mới
  createOrder: async (orderData: OrderRequestDTO): Promise<OrderResponseDTO> => {
    try {
      console.log('Creating staff order with data:', orderData);
      const response = await apiClient.post<OrderResponseDTO>(API_URL, orderData);
      console.log('Staff order created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating staff order:', error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng hôm nay chưa thanh toán
  getTodayUnpaidOrders: async (branchId?: number): Promise<OrderResponseDTO[]> => {
    try {
      const params = branchId ? { branchId } : {};
      const response = await apiClient.get<OrderResponseDTO[]>(`${API_URL}/today-unpaid`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching today unpaid orders:', error);
      throw error;
    }
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (id: number): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.get<OrderResponseDTO>(`${API_URL}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  },

  // Thanh toán đơn hàng
  payOrder: async (id: number, paymentData: any): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.post<OrderResponseDTO>(`${API_URL}/${id}/pay`, paymentData);
      return response;
    } catch (error) {
      console.error('Error paying order:', error);
      throw error;
    }
  },

  // Thêm món vào đơn hàng
  addItemToOrder: async (orderId: number, itemData: any): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.post<OrderResponseDTO>(`${API_URL}/${orderId}/items`, itemData);
      return response;
    } catch (error) {
      console.error('Error adding item to order:', error);
      throw error;
    }
  },

  // Cập nhật món trong đơn hàng
  updateOrderItem: async (orderId: number, itemId: number, itemData: any): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.put<OrderResponseDTO>(`${API_URL}/${orderId}/items/${itemId}`, itemData);
      return response;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw error;
    }
  },

  // Xóa món khỏi đơn hàng
  removeOrderItem: async (orderId: number, itemId: number): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.delete<OrderResponseDTO>(`${API_URL}/${orderId}/items/${itemId}`);
      return response;
    } catch (error) {
      console.error('Error removing order item:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (id: number, status: string): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.put<OrderResponseDTO>(`${API_URL}/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng với phân trang và filter
  getOrders: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    date?: string;
  }): Promise<{
    orders: OrderResponseDTO[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> => {
    try {
      const response = await apiClient.get(`${API_URL}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Cập nhật thông tin đơn hàng
  updateOrder: async (id: number, updateData: {
    customerName?: string;
    customerPhone?: string | null;
    notes?: string | null;
    status?: string;
    tableId?: number | null;
  }): Promise<OrderResponseDTO> => {
    try {
      const response = await apiClient.put<OrderResponseDTO>(`${API_URL}/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
};
