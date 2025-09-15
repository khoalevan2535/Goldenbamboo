import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { type DishResponseDTO, type Page } from "../interfaces";
import { DishService } from "../services/DishService";
import { ItemAvailabilityStatus } from "../interfaces/enums/MenuItemStatus";
import { getApiErrorMessage } from "../utils/error";

interface SearchParams {
  name?: string;
  categoryId?: number;
  status?: string;
  page?: number;
  size?: number;
}

export function useDishes() {
  const [dishPage, setDishPage] = useState<Page<DishResponseDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchDishes = useCallback(
    async (params?: SearchParams) => {
      try {
        setLoading(true);
        const response = await DishService.getAll({
          ...params,
          page: currentPage,
          size: pageSize,
        });
        setDishPage(response);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        const errorMessage = getApiErrorMessage(err);
        toast.error(errorMessage);
        setDishPage(null);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  const fetchDishesForStaff = useCallback(
    async (params?: SearchParams & { branchId?: number }) => {
      try {
        setLoading(true);
        const response = await DishService.getForStaff({
          ...params,
          page: params?.page ?? currentPage,
          size: params?.size ?? pageSize,
        });
        setDishPage(response);
      } catch (err) {
        console.error('Error fetching dishes for staff:', err);
        const errorMessage = getApiErrorMessage(err);
        toast.error(errorMessage);
        setDishPage(null);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  const handleCreate = async (data: any, image?: File | null) => {
    try {
      await DishService.create(data, image || undefined);
      toast.success("Tạo món ăn thành công!");
      fetchDishes(); // Refresh list after create
    } catch (err) {
      console.error('Error creating dish:', err);
      const errorMessage = getApiErrorMessage(err);
      console.log('Error message:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: any, image?: File | null) => {
    try {
      await DishService.update(Number(id), data, image || undefined);
      toast.success("Cập nhật món ăn thành công!");
      fetchDishes(); // Refresh list after update
    } catch (err) {
      console.error('Error updating dish:', err);
      const errorMessage = getApiErrorMessage(err);
      console.log('Error message:', errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DishService.delete(Number(id));
      toast.success("Xóa món ăn thành công!");
    } catch (err) {
      console.error('Error deleting dish:', err);
      const errorMessage = getApiErrorMessage(err);
      console.log('Error message:', errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUpdateAvailabilityStatus = async (id: string, status: ItemAvailabilityStatus) => {
    try {
      await DishService.updateAvailabilityStatus(Number(id), status);
      
      // Hiển thị thông báo phù hợp dựa trên trạng thái mới
      if (status === ItemAvailabilityStatus.OUT_OF_STOCK) {
        toast.warning('Món ăn đã được đánh dấu hết hàng. Tất cả combo chứa món này sẽ tự động chuyển sang "Hết hàng".');
      } else if (status === ItemAvailabilityStatus.DISCONTINUED) {
        toast.warning('Món ăn đã được đánh dấu ngừng bán. Tất cả combo chứa món này sẽ tự động chuyển sang "Ngừng bán".');
      } else if (status === ItemAvailabilityStatus.AVAILABLE) {
        toast.success('Món ăn đã được kích hoạt. Các combo chứa món này sẽ được kiểm tra lại trạng thái.');
      } else {
        toast.success("Cập nhật trạng thái thành công!");
      }
      
      fetchDishes();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  // Auto-fetch dishes when component mounts
  useEffect(() => {
    fetchDishes({ page: currentPage });
  }, [fetchDishes, currentPage]);

  return {
    dishPage,
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    fetchDishes,
    fetchDishesForStaff,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleUpdateAvailabilityStatus,
  };
}
