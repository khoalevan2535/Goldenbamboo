import apiClient from '../utils/apiClient';

export interface VNPayRequest {
  amount: number;
  orderInfo: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl?: string;
  cancelUrl?: string;
  orderId?: string;
}

export interface VNPayResponse {
  success: boolean;
  message: string;
  paymentUrl?: string;
  orderId?: string;
  transactionId?: string;
}

export const VNPayService = {
  createPaymentUrl: async (request: VNPayRequest): Promise<VNPayResponse> => {
    try {
      console.log('Sending VNPay request:', request); // Debug log
      const response = await apiClient.post('/payment/vnpay/create-payment-url', request);
      console.log('VNPay API response:', response); // Debug log
      console.log('Response type:', typeof response);
      
      // apiClient interceptor returns response.data directly, not the full response object
      // So 'response' here is already the data object
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Check if the API returned an error (only if success is explicitly false)
      if (response.success === false) {
        throw new Error(response.message || 'API returned error');
      }
      
      return response;
    } catch (error) {
      console.error('Error creating VNPay payment URL:', error);
      
      // Return error response instead of throwing
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi kết nối API',
        paymentUrl: undefined,
        orderId: undefined,
        transactionId: undefined
      };
    }
  },

  handlePaymentReturn: async (params: Record<string, string>): Promise<any> => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/payment/vnpay/return?${queryString}`);
      
      console.log('🔍 VNPayService.handlePaymentReturn response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', response ? Object.keys(response) : 'response is null/undefined');
      
      // apiClient interceptor returns response.data directly, not the full response object
      // So 'response' here is already the data object
      return response;
    } catch (error) {
      console.error('Error handling VNPay return:', error);
      throw error;
    }
  }
};
