import apiClient from '../utils/apiClient';

export interface DiscountRequestDTO {
  code?: string; // nullable cho BRANCH_DISCOUNT, required cho CUSTOMER_VOUCHER
  name: string;
  newPrice: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'REPLACED' | 'SCHEDULED' | 'EXPIRING';
  description?: string;
  dishId?: number; // ID của món ăn (nullable)
  comboId?: number; // ID của combo (nullable)
  type?: 'BRANCH_DISCOUNT' | 'CUSTOMER_VOUCHER'; // Loại discount
}

export interface DiscountResponseDTO {
  id: number;
  code?: string; // nullable cho BRANCH_DISCOUNT
  name: string;
  newPrice: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'REPLACED' | 'SCHEDULED' | 'EXPIRING';
  description?: string;
  createdAt: string;
  updatedAt: string;
  dishId?: number; // ID của món ăn (nullable)
  comboId?: number; // ID của combo (nullable)
  type?: 'BRANCH_DISCOUNT' | 'CUSTOMER_VOUCHER'; // Loại discount
}

export interface ApplyDiscountRequestDTO {
  discountId: number;
  dishId?: number;
  comboId?: number;
}

class DiscountService {
  // Discount CRUD
  async createDiscount(data: DiscountRequestDTO): Promise<DiscountResponseDTO> {
    try {
      const response = await apiClient.post('/discounts', data);
      return response;
    } catch (error: any) {
      console.error('❌ Discount API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllDiscounts(): Promise<DiscountResponseDTO[]> {
    try {
      const response = await apiClient.get('/discounts');
      console.log('Raw Discounts API Response:', response); // Debug log
      console.log('Response type:', typeof response);
      console.log('Is Array:', Array.isArray(response));
      
      // apiClient tự động trả về response.data, nên response chính là array
      if (Array.isArray(response)) {
        console.log('✅ Returning response array with', response.length, 'items');
        return response;
      } else if (response && typeof response === 'object') {
        console.warn('⚠️ Response is object but not array:', response);
        return [];
      } else {
        console.warn('❌ Response is null, undefined, or unexpected type:', response);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Discount API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDiscountById(id: number): Promise<DiscountResponseDTO> {
    const response = await apiClient.get(`/discounts/${id}`);
    return response.data;
  }

  async getDiscountByCode(code: string): Promise<DiscountResponseDTO> {
    const response = await apiClient.get(`/discounts/code/${code}`);
    return response.data;
  }

  async updateDiscount(id: number, data: Partial<DiscountRequestDTO>): Promise<DiscountResponseDTO> {
    const response = await apiClient.put(`/discounts/${id}`, data);
    return response.data;
  }

  async deleteDiscount(id: number): Promise<void> {
    await apiClient.delete(`/discounts/${id}`);
  }

  // Apply discount to dish or combo
  async applyDiscount(data: ApplyDiscountRequestDTO): Promise<any> {
    const response = await apiClient.post('/discounts/apply', data);
    return response.data;
  }

  async removeDiscountFromDish(dishId: number): Promise<void> {
    await apiClient.delete(`/dishes/${dishId}/discount`);
  }

  async removeDiscountFromCombo(comboId: number): Promise<void> {
    await apiClient.delete(`/combos/${comboId}/discount`);
  }

  // Get active discounts
  async getActiveDiscounts(): Promise<DiscountResponseDTO[]> {
    const response = await apiClient.get('/discounts/active');
    return response.data;
  }

  // Get active discount for a specific dish
  async getActiveDiscountForDish(dishId: number): Promise<DiscountResponseDTO | null> {
    try {
      const response = await apiClient.get(`/discounts/dish/${dishId}/active`);
      return response;
    } catch (error: any) {
      console.error('❌ Discount API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get active discount for a specific combo
  async getActiveDiscountForCombo(comboId: number): Promise<DiscountResponseDTO | null> {
    try {
      const response = await apiClient.get(`/discounts/combo/${comboId}/active`);
      return response;
    } catch (error: any) {
      console.error('❌ Discount API error:', error.response?.data || error.message);
      throw error;
    }
  }


  // Voucher functions - temporarily hidden
  // async validateVoucher(voucherCode: string, dishId?: number, comboId?: number): Promise<any> {
  //   const response = await apiClient.post('/discounts/validate', {
  //     voucherCode,
  //     dishId,
  //     comboId
  //   });
  //   return response.data;
  // }

  // async applyVoucherToItem(voucherCode: string, dishId?: number, comboId?: number): Promise<any> {
  //   const response = await apiClient.post('/discounts/apply-voucher', {
  //     voucherCode,
  //     dishId,
  //     comboId
  //   });
  //   return response.data;
  // }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await apiClient.get('/discounts/health');
    return response.data;
  }

  // Test endpoints
  async testConnection(): Promise<any> {
    const response = await apiClient.get('/discounts/test');
    return response.data;
  }
}

export { DiscountService };
export const discountService = new DiscountService();

// Export individual methods for easier use
export const createDiscount = discountService.createDiscount.bind(discountService);
export const applyDiscount = discountService.applyDiscount.bind(discountService);
export const getAllDiscounts = discountService.getAllDiscounts.bind(discountService);
export const getDiscountById = discountService.getDiscountById.bind(discountService);
export const updateDiscount = discountService.updateDiscount.bind(discountService);
export const deleteDiscount = discountService.deleteDiscount.bind(discountService);
export const removeDiscountFromDish = discountService.removeDiscountFromDish.bind(discountService);
export const removeDiscountFromCombo = discountService.removeDiscountFromCombo.bind(discountService);
// export const validateVoucher = discountService.validateVoucher.bind(discountService);
// export const applyVoucherToItem = discountService.applyVoucherToItem.bind(discountService);
