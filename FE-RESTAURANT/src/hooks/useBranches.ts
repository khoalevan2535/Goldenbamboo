// File: src/hooks/useBranches.ts

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { BranchService } from '../services/BranchService';
import type { BranchResponseDTO, BranchRequestDTO, BranchStatus } from '../interfaces';
import { getApiErrorMessage } from '../utils/error';

interface SearchParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
}

interface PagedResponseDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function useBranches() {
  const [branchPage, setBranchPage] = useState<PagedResponseDTO<BranchResponseDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchBranches = useCallback(
    async (params?: SearchParams) => {
      try {
        setLoading(true);
        const response = await BranchService.getAll({
          ...params,
          page: currentPage,
          size: pageSize,
        });
        setBranchPage(response);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        setBranchPage(null);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  // Sử dụng "Optimistic Update" cho các hành động CRUD
  const createBranch = async (branchData: BranchRequestDTO) => {
    try {
      const newBranch = await BranchService.create(branchData);
      toast.success('Tạo chi nhánh thành công!');
      fetchBranches(); // Refresh list after create
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  const updateBranch = async (id: number, branchData: Partial<BranchRequestDTO>) => {
    try {
      await BranchService.update(id, branchData);
      toast.success('Cập nhật thành công!');
      fetchBranches(); // Refresh list after update
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };
  
  const deleteBranch = async (id: number) => {
    try {
      await BranchService.delete(id);
      toast.success('Xóa thành công!');
      fetchBranches(); // Refresh list after delete
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  const updateBranchStatus = async (id: number, status: BranchStatus) => {
    try {
      await BranchService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công!');
      fetchBranches(); // Refresh list after status update
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  return { 
    branchPage, 
    loading, 
    currentPage, 
    setCurrentPage, 
    pageSize,
    fetchBranches, 
    createBranch, 
    updateBranch, 
    deleteBranch, 
    updateBranchStatus 
  };
}