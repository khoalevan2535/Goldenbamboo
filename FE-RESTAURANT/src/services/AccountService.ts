// File: src/services/AccountService.ts

import apiClient from "../utils/apiClient";
import type { AccountResponseDTO, AccountRequestDTO } from "../interfaces";

const API_URL = "/accounts";

interface AccountSearchParams {
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

export const AccountService = {
  getAll: async (params?: AccountSearchParams): Promise<PagedResponseDTO<AccountResponseDTO> | AccountResponseDTO[]> => {
    const response = await apiClient.get(API_URL, { params });
    // Nếu response là mảng, trả về như PagedResponseDTO với content là mảng
    if (Array.isArray(response)) {
      return { content: response, pageNumber: 0, pageSize: response.length, totalElements: response.length, totalPages: 1, first: true, last: true, hasNext: false, hasPrevious: false };
    }
    return response;
  },
  create: (data: AccountRequestDTO): Promise<AccountResponseDTO> => {
    return apiClient.post(API_URL, data);
  },
  update: (accountId: number, data: Partial<AccountRequestDTO>): Promise<AccountResponseDTO> => {
    return apiClient.put(`${API_URL}/${accountId}`, data);
  },
  updateStatus: (accountId: number, data: { status: string }): Promise<AccountResponseDTO> => {
    return apiClient.patch(`${API_URL}/${accountId}/status`, data);
  },
  updateRole: (accountId: number, roleName: string): Promise<AccountResponseDTO> => {
    return apiClient.patch(`${API_URL}/${accountId}/role`, { roleName });
  },



  delete: (accountId: number): Promise<void> => {
    return apiClient.delete(`${API_URL}/${accountId}`);
  },
};