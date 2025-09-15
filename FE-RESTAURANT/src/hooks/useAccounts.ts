// File: src/hooks/useAccounts.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { AccountService } from '../services/AccountService';
import type { AccountResponseDTO } from '../interfaces';

interface FetchParams {
  branchId?: string;
  role?: string;
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

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAccounts = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);
    try {
      console.log('Fetching accounts with params:', params); // Gỡ lỗi params
      const data = await AccountService.getAll(params);
      console.log('API response:', data); // Gỡ lỗi response
      // Đảm bảo accounts luôn là mảng
      if (data && Array.isArray(data.content)) {
        setAccounts(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setAccounts(data);
        setTotalPages(1);
      } else {
        setAccounts([]);
        setTotalPages(0);
      }
      setError(null);
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi tải danh sách tài khoản.';
      console.error('Fetch error:', err); // Gỡ lỗi lỗi
      setError(msg);
      toast.error(msg);
      setAccounts([]); // Đảm bảo accounts là mảng rỗng khi lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, fetchAccounts, totalPages };
}