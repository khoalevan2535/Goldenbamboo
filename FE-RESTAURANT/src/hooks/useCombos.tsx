import { useState, useEffect, useCallback } from 'react';
import { ComboService } from '../services/ComboService';
import { type ComboRequestDTO, type ComboResponseDTO, type Page } from '../interfaces';
import { ItemAvailabilityStatus } from '../interfaces/enums/MenuItemStatus';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../utils/error';

interface ComboSearchParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
  branchId?: number;
}

export function useCombos() {
  const [comboPage, setComboPage] = useState<Page<ComboResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchCombos = useCallback(
    async (params?: ComboSearchParams) => {
      setLoading(true);
      try {
        const data = await ComboService.getAll({
          ...params,
          page: currentPage,
          size: pageSize,
        });
        setComboPage(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  const fetchCombosForStaff = useCallback(
    async (params?: ComboSearchParams & { branchId?: number }) => {
      setLoading(true);
      try {
        const data = await ComboService.getForStaff({
          ...params,
          page: params?.page ?? currentPage,
          size: params?.size ?? pageSize,
        });
        setComboPage(data);
      } catch (err) {
        console.error('Error fetching combos for staff:', err);
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  // Hỗ trợ thêm image (File) khi tạo
  const handleCreate = async (data: ComboRequestDTO, image?: File) => {
    try {
      await ComboService.create(data, image);
      toast.success('Tạo combo thành công!');
      fetchCombos({ page: currentPage });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  // Hỗ trợ thêm image (File) khi update
  const handleUpdate = async (id: string, data: Partial<ComboRequestDTO>, image?: File) => {
    try {
      await ComboService.update(id, data, image);
      toast.success('Cập nhật combo thành công!');
      fetchCombos({ page: currentPage });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ComboService.delete(id);
      toast.success('Xóa combo thành công!');
      fetchCombos({ page: currentPage });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleUpdateAvailabilityStatus = async (id: string, status: ItemAvailabilityStatus) => {
    try {
      await ComboService.updateAvailabilityStatus(id, status);
      
      // Hiển thị thông báo phù hợp dựa trên trạng thái mới
      if (status === ItemAvailabilityStatus.OUT_OF_STOCK) {
        toast.warning('Combo đã được đánh dấu hết hàng và chuyển sang chế độ thủ công.');
      } else if (status === ItemAvailabilityStatus.DISCONTINUED) {
        toast.warning('Combo đã được đánh dấu ngừng bán và chuyển sang chế độ thủ công.');
      } else if (status === ItemAvailabilityStatus.AVAILABLE) {
        toast.success('Combo đã được kích hoạt và chuyển sang chế độ thủ công.');
      } else {
        toast.success('Cập nhật trạng thái thành công!');
      }
      
      fetchCombos({ page: currentPage });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  useEffect(() => {
    fetchCombos({ page: currentPage });
  }, [fetchCombos, currentPage]);

  return {
    comboPage,
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    fetchCombos,
    fetchCombosForStaff,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleUpdateAvailabilityStatus,
  };
}
 