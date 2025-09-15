// File: src/services/ComboService.ts

import apiClient from "../utils/apiClient";
import { createEntityFormData } from "../utils/FormDataHelper";
import type { Page, ComboResponseDTO, ComboRequestDTO } from "../interfaces";
import { ItemAvailabilityStatus } from "../interfaces/enums/MenuItemStatus";

interface ComboSearchParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
  branchId?: number;
}

export const ComboService = {
  getAll: (params?: ComboSearchParams): Promise<Page<ComboResponseDTO>> => {
    return apiClient.get("/combos", { params });
  },

  /**
   * Lấy danh sách combo cho Staff (không bao gồm DISCONTINUED)
   */
  getForStaff: (params?: ComboSearchParams): Promise<Page<ComboResponseDTO>> => {
    return apiClient.get("/combos/staff", { params });
  },

  /**
   * Lấy danh sách combo cho client (có branchId)
   */
  getClientCombos: (branchId: number, params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<Page<ComboResponseDTO>> => {
    return apiClient.get("/api/client/menu/combos", { 
      params: { 
        branchId, 
        ...params 
      } 
    });
  },

  /**
   * Lấy danh sách combo theo chi nhánh
   * API mới: thay thế cho hệ thống menu phức tạp
   */
  getByBranch: (branchId: number): Promise<ComboResponseDTO[]> => {
    return apiClient.get(`/combos/branch/${branchId}`);
  },

  /**
   * Lấy danh sách combo khả dụng cho việc tạo menu
   * Backend sẽ filter: status = ACTIVE, không bao gồm combo đã có trong menu
   * Giúp giảm tải dữ liệu và tối ưu performance
   */
  getAvailableForMenu: (params?: {
    search?: string;
    page?: number;
    size?: number;
    excludeComboIds?: string[]; // Loại trừ các combo đã có trong menu
  }): Promise<Page<ComboResponseDTO>> => {
    return apiClient.get("/combos/available-for-menu", { params });
  },
  getById: (id: string): Promise<ComboResponseDTO> => {
    return apiClient.get(`/combos/${id}`);
  },
  create: (data: ComboRequestDTO, image?: File): Promise<ComboResponseDTO> => {
    const formData = new FormData();
    // Backend expects @RequestPart("combo") as JSON with proper Content-Type
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('combo', jsonBlob);
    if (image) {
      formData.append('image', image);
    }
    return apiClient.post("/combos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id: string, data: Partial<ComboRequestDTO>, image?: File): Promise<ComboResponseDTO> => {
    const formData = new FormData();
    // Backend expects @RequestPart("combo") as JSON with proper Content-Type
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('combo', jsonBlob);
    if (image) {
      formData.append('image', image);
    }
    return apiClient.put(`/combos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/combos/${id}`);
  },
  getDeletability: (id: string): Promise<{ deletable: boolean; reasons: Array<{ type: string; count: number }> }> => {
    return apiClient.get(`/combos/${id}/deletability`);
  },
  updateAvailabilityStatus: (id: string, status: ItemAvailabilityStatus): Promise<ComboResponseDTO> => {
    return apiClient.patch(`/combos/${id}/availability-status`, { status });
  },
  updatePrice: (id: string, price: number): Promise<ComboResponseDTO> => {
    return apiClient.patch(`/combos/${id}/price`, { price });
  },

  /**
   * Cập nhật giá khuyến mãi cho combo
   */
  updatePromotionalPrice: (id: number, promotionalData: {
    promotionalPrice?: number;
    promotionalEndDate?: string;
  }): Promise<ComboResponseDTO> => {
    return apiClient.patch(`/combos/${id}/promotional-price`, promotionalData);
  },

  /**
   * Xóa giá khuyến mãi khỏi combo
   */
  removePromotionalPrice: (id: number): Promise<ComboResponseDTO> => {
    return apiClient.patch(`/combos/${id}/promotional-price/remove`);
  },

  /**
   * Reset combo về trạng thái tự động (tắt manual override)
   */
  resetToAutomatic: (id: string): Promise<ComboResponseDTO> => {
    return apiClient.patch(`/combos/${id}/reset-availability`);
  },

  /**
   * Xóa giảm giá khỏi combo
   */
  removeDiscount: (id: number): Promise<void> => {
    return apiClient.delete(`/combos/${id}/discount`);
  },
};