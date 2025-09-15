import apiClient from '../utils/apiClient';

export interface VoucherUsageHistory {
  id: number;
  voucherId: number;
  voucherName: string;
  voucherCode: string;
  orderId: number;
  customerPhone?: string;
  customerName?: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherUsageHistoryFilters {
  voucherCode?: string;
  customerPhone?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class VoucherUsageHistoryService {
  // Lấy tất cả lịch sử sử dụng voucher với phân trang
  async getAllVoucherUsageHistory(
    page: number = 0,
    size: number = 10,
    filters?: VoucherUsageHistoryFilters
  ): Promise<PaginatedResponse<VoucherUsageHistory>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });

      if (filters?.voucherCode) params.append('voucherCode', filters.voucherCode);
      if (filters?.customerPhone) params.append('customerPhone', filters.customerPhone);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await apiClient.get(`/voucher-usage-history?${params}`);
      console.log('Raw API Response:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy lịch sử sử dụng voucher theo voucher ID
  async getVoucherUsageHistory(voucherId: number): Promise<VoucherUsageHistory[]> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/voucher/${voucherId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy lịch sử sử dụng voucher theo order ID
  async getVoucherUsageByOrderId(orderId: number): Promise<VoucherUsageHistory | null> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy lịch sử sử dụng voucher theo mã voucher
  async getVoucherUsageByCode(voucherCode: string): Promise<VoucherUsageHistory[]> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/code/${voucherCode}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy lịch sử sử dụng voucher theo số điện thoại khách hàng
  async getVoucherUsageByCustomerPhone(customerPhone: string): Promise<VoucherUsageHistory[]> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/customer/${customerPhone}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy lịch sử sử dụng voucher trong khoảng thời gian
  async getVoucherUsageByDateRange(startDate: string, endDate: string): Promise<VoucherUsageHistory[]> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy voucher được sử dụng nhiều nhất
  async getMostUsedVouchers(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/most-used-vouchers?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy khách hàng sử dụng voucher nhiều nhất
  async getMostActiveCustomers(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/most-active-customers?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Đếm số lần sử dụng voucher
  async getVoucherUsageCount(voucherId: number): Promise<number> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/voucher/${voucherId}/count`);
      return response.data.usageCount;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Đếm số lần sử dụng voucher theo mã
  async getVoucherUsageCountByCode(voucherCode: string): Promise<number> {
    try {
      const response = await apiClient.get(`/voucher-usage-history/code/${voucherCode}/count`);
      return response.data.usageCount;
    } catch (error: any) {
      console.error('❌ Voucher Usage History API error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export { VoucherUsageHistoryService };
export const voucherUsageHistoryService = new VoucherUsageHistoryService();

// Export individual methods for easier use
export const getAllVoucherUsageHistory = voucherUsageHistoryService.getAllVoucherUsageHistory.bind(voucherUsageHistoryService);
export const getVoucherUsageHistory = voucherUsageHistoryService.getVoucherUsageHistory.bind(voucherUsageHistoryService);
export const getVoucherUsageByOrderId = voucherUsageHistoryService.getVoucherUsageByOrderId.bind(voucherUsageHistoryService);
export const getVoucherUsageByCode = voucherUsageHistoryService.getVoucherUsageByCode.bind(voucherUsageHistoryService);
export const getVoucherUsageByCustomerPhone = voucherUsageHistoryService.getVoucherUsageByCustomerPhone.bind(voucherUsageHistoryService);
export const getVoucherUsageByDateRange = voucherUsageHistoryService.getVoucherUsageByDateRange.bind(voucherUsageHistoryService);
export const getMostUsedVouchers = voucherUsageHistoryService.getMostUsedVouchers.bind(voucherUsageHistoryService);
export const getMostActiveCustomers = voucherUsageHistoryService.getMostActiveCustomers.bind(voucherUsageHistoryService);
export const getVoucherUsageCount = voucherUsageHistoryService.getVoucherUsageCount.bind(voucherUsageHistoryService);
export const getVoucherUsageCountByCode = voucherUsageHistoryService.getVoucherUsageCountByCode.bind(voucherUsageHistoryService);
