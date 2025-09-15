// File: src/services/CategoryService.ts

import apiClient from "../utils/apiClient";
import type { Page, CategoryResponseDTO, CategoryRequestDTO } from "../interfaces";
import { CategoryStatus } from "../interfaces/enums/CategoryStatus";

// Interface này có thể giữ ở đây hoặc chuyển vào file interfaces chung nếu cần
interface CategorySearchParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const CategoryService = {
  /**
   * Lấy danh sách danh mục có phân trang và tìm kiếm.
   */
  getAll: (params?: CategorySearchParams): Promise<Page<CategoryResponseDTO>> => {
    return apiClient.get("/categories", { params });
  },

  /**
   * Lấy danh sách danh mục cho client (có branchId)
   */
  getClientCategories: (branchId: number): Promise<CategoryResponseDTO[]> => {
    return apiClient.get("/api/client/menu/categories", { 
      params: { branch_id: branchId } 
    });
  },

  /**
   * Lấy danh sách danh mục đang hoạt động cho manager (tự động filter theo branch của manager)
   */
  getActiveCategoriesForManager: (): Promise<Page<CategoryResponseDTO>> => {
    return apiClient.get("/categories", { 
      params: { 
        status: 'ACTIVE',
        page: 0,
        size: 1000 // Lấy tất cả danh mục active
      } 
    });
  },

  /**
   * Lấy tất cả danh mục đang hoạt động cho admin (không phân trang)
   */
  getAllActiveCategories: (): Promise<Page<CategoryResponseDTO>> => {
    return apiClient.get("/categories", { 
      params: { 
        status: 'ACTIVE',
        page: 0,
        size: 1000 // Lấy tất cả danh mục active
      } 
    });
  },

  /**
   * Tạo một danh mục mới.
   */
  create: (data: CategoryRequestDTO): Promise<CategoryResponseDTO> => {
    return apiClient.post("/categories", data);
  },

  /**
   * Cập nhật thông tin một danh mục theo ID.
   */
  update: (id: string, data: CategoryRequestDTO): Promise<CategoryResponseDTO> => {
    return apiClient.put(`/categories/${id}`, data);
  },

  /**
   * Xóa một danh mục theo ID.
   */
  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/categories/${id}`);
  },
 
  /**
   * Lấy chi tiết danh mục theo ID
   */
  getById: (id: string): Promise<CategoryResponseDTO> => {
    return apiClient.get(`/categories/${id}`);
  },

  /**
   * Kiểm tra khả năng xóa danh mục.
   */
  getDeletability: (id: string): Promise<{ deletable: boolean; reasons: Array<{ type: string; count: number }> }> => {
    return apiClient.get(`/categories/${id}/deletability`);
  },

  /**
   * Cập nhật trạng thái của một danh mục.
   */
  updateStatus: (id: string, status: CategoryStatus): Promise<CategoryResponseDTO> => {
    return apiClient.patch(`/categories/${id}/status?status=${status}`);
  },
};
