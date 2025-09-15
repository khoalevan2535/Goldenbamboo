// File: src/services/DishService.ts

import apiClient from "../utils/apiClient";
import { createEntityFormData, createEntityFormDataWithImageUrl } from "../utils/FormDataHelper"; // Tái sử dụng helper
import type { DishRequestDTO, DishResponseDTO, Page } from "../interfaces";
import { ItemAvailabilityStatus } from "../interfaces/enums/MenuItemStatus";

export interface DishSearchParams {
  name?: string;
  categoryId?: number;
  status?: string;
  page?: number;
  size?: number;
  branchId?: number;
}

export const DishService = {
  getAll: (params?: DishSearchParams): Promise<Page<DishResponseDTO>> => {
    return apiClient.get("/dishes", { params });
  },

  /**
   * Lấy danh sách món ăn cho Staff (không bao gồm DISCONTINUED)
   */
  getForStaff: (params?: DishSearchParams): Promise<Page<DishResponseDTO>> => {
    return apiClient.get("/dishes/staff", { params });
  },

  /**
   * Lấy danh sách món ăn cho client (có branchId)
   */
  getClientDishes: (branchId: number, params?: {
    categoryId?: number;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<Page<DishResponseDTO>> => {
    return apiClient.get("/api/client/menu/dishes", { 
      params: { 
        branchId, 
        ...params 
      } 
    });
  },

  /**
   * Lấy danh sách tất cả món ăn đã được duyệt và đang hoạt động
   * Dùng cho dropdown chọn món ăn trong tạo combo
   */
  getApprovedActive: (): Promise<DishResponseDTO[]> => {
    return apiClient.get("/dishes/approved-active");
  },

  /**
   * Lấy danh sách món ăn theo chi nhánh
   * API mới: thay thế cho hệ thống menu phức tạp
   */
  getByBranch: (branchId: number): Promise<DishResponseDTO[]> => {
    return apiClient.get(`/dishes/branch/${branchId}`);
  },

  /**
   * Lấy danh sách món ăn khả dụng cho việc tạo menu
   * Backend sẽ filter: status = ACTIVE, không bao gồm món đã có trong menu
   * Giúp giảm tải dữ liệu và tối ưu performance
   */
  getAvailableForMenu: (params?: {
    categoryId?: string;
    search?: string;
    page?: number;
    size?: number;
    excludeDishIds?: string[]; // Loại trừ các món đã có trong menu
  }): Promise<Page<DishResponseDTO>> => {
    return apiClient.get("/dishes/available-for-menu", { params });
  },

  /**
   * Lấy chi tiết món ăn theo ID
   */
  getById: (id: string): Promise<DishResponseDTO> => {
    return apiClient.get(`/dishes/${id}`);
  },

  create: (data: DishRequestDTO, image?: File): Promise<DishResponseDTO> => {
    // Extract imageUrl from data and create FormData
    const { image: imageUrl, ...dataWithoutImage } = data;
    const formData = createEntityFormDataWithImageUrl(dataWithoutImage, image, imageUrl); 
    
    // Debug logging removed
    
    return apiClient.post("/dishes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id: number, data: Partial<DishRequestDTO>, image?: File): Promise<DishResponseDTO> => {
    // Extract imageUrl from data and create FormData
    const { image: imageUrl, ...dataWithoutImage } = data;
    const formData = createEntityFormDataWithImageUrl(dataWithoutImage, image, imageUrl);
    return apiClient.put(`/dishes/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: number): Promise<void> => {
    return apiClient.delete(`/dishes/${id}`);
  },
  getDeletability: (id: number): Promise<{ deletable: boolean; reasons: Array<{ type: string; count: number }> }> => {
    return apiClient.get(`/dishes/${id}/deletability`);
  },
  updateAvailabilityStatus: (id: number, status: ItemAvailabilityStatus): Promise<DishResponseDTO> => {
    return apiClient.patch(`/dishes/${id}/availability-status`, { status });
  },
  updatePrice: (id: number, price: number): Promise<DishResponseDTO> => {
    return apiClient.patch(`/dishes/${id}/price`, { price });
  },

  /**
   * Cập nhật giá khuyến mãi cho món ăn
   */
  updatePromotionalPrice: (id: number, promotionalData: {
    promotionalPrice?: number;
    promotionalEndDate?: string;
  }): Promise<DishResponseDTO> => {
    return apiClient.patch(`/dishes/${id}/promotional-price`, promotionalData);
  },

  /**
   * Xóa giá khuyến mãi khỏi món ăn
   */
  removePromotionalPrice: (id: number): Promise<DishResponseDTO> => {
    return apiClient.patch(`/dishes/${id}/promotional-price/remove`);
  },

  /**
   * Xóa giảm giá khỏi món ăn
   */
  removeDiscount: (id: number): Promise<void> => {
    return apiClient.delete(`/dishes/${id}/discount`);
  },
};