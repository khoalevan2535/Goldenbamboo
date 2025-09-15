// File: src/hooks/useCategories.ts

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { CategoryService } from "../services/CategoryService";
import type { Page, CategoryResponseDTO, CategoryRequestDTO } from "../interfaces";
import { CategoryStatus } from "../interfaces/enums/CategoryStatus";

interface CategorySearchParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
}

export function useCategories(initialParams?: CategorySearchParams) {
  const [categoryPage, setCategoryPage] = useState<Page<CategoryResponseDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const updateParams = useCallback((newParams: CategorySearchParams | ((prev: CategorySearchParams | undefined) => CategorySearchParams)) => {
    setParams(newParams);
  }, []);

  const fetchCategories = useCallback(async (searchParams?: CategorySearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra role để sử dụng API phù hợp
      const userRoles = JSON.parse(localStorage.getItem('user') || '{}')?.roles || [];
      const isManager = userRoles.includes('ROLE_MANAGER');
      
      let data;
      if (isManager) {
        // Manager sử dụng API filter theo branch
        data = await CategoryService.getActiveCategoriesForManager();
      } else {
        // Admin sử dụng API lấy tất cả danh mục active
        data = await CategoryService.getAllActiveCategories();
      }
      
      setCategoryPage(data);
    } catch (err: any) {
      const errorMessage = err?.message || err || "Lỗi khi tải danh mục.";
      setError(errorMessage);
      // Tránh toast trùng với interceptor: chỉ toast khi không có response chuẩn
      if (!err?.status && !err?.code) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Tương tự, các hàm handle... cũng được cập nhật để dùng CategoryService
  const createCategory = async (categoryData: CategoryRequestDTO) => {
    try {
      await CategoryService.create(categoryData);
      // Kiểm tra role để hiển thị message phù hợp
      const userRoles = JSON.parse(localStorage.getItem('user') || '{}')?.roles || [];
      const isManager = userRoles.includes('ROLE_MANAGER');

      if (isManager) {
        toast.success("Đã gửi danh mục để chờ duyệt!");
      } else {
        toast.success("Tạo danh mục thành công!");
      }
      fetchCategories();
    } catch (err: any) {
      throw err;
    }
  };

  const updateCategory = async (id: string, categoryData: CategoryRequestDTO) => {
    try {
      await CategoryService.update(id, categoryData);
      toast.success("Cập nhật danh mục thành công!");
      fetchCategories();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await CategoryService.delete(id);
      toast.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (err: any) {
      throw err;
    }
  };

  const updateCategoryStatus = async (id: number, status: MenuItemStatus) => {
    try {
      await CategoryService.updateStatus(id, status);
      toast.success("Cập nhật trạng thái thành công!");
      fetchCategories();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    categoryPage,
    loading,
    error,
    setParams: updateParams,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus,
  };
}
