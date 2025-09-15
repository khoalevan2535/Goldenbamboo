import apiClient from '../utils/Api';

export const PaymentService = {
  // Lấy danh sách phương thức thanh toán
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/api/payment-methods');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to default payment methods if API fails
      return [
        {
          id: 'CASH',
          name: 'Thanh toán khi nhận hàng (COD)',
          description: 'Thanh toán bằng tiền mặt khi nhận hàng',
          icon: '💵'
        },
        {
          id: 'CARD',
          name: 'Thanh toán bằng thẻ',
          description: 'Visa, Mastercard, JCB',
          icon: '💳'
        },
        {
          id: 'BANK_TRANSFER',
          name: 'Chuyển khoản ngân hàng',
          description: 'Chuyển khoản qua ngân hàng',
          icon: '🏦'
        }
      ];
    }
  }
};
