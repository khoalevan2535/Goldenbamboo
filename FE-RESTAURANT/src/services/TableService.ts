import apiClient from '../utils/apiClient';
import { type TableRequestDTO } from '../interfaces/TableRequestDTO';
import { type TableResponseDTO } from '../interfaces/TableResponseDTO';
import { type TableStatus } from '../interfaces/enums/TableStatus';

const API_URL = '/tables';

export const TableService = {
  // Basic CRUD operations
  getAll: () => apiClient.get<TableResponseDTO[]>(API_URL),
  getAllTables: () => apiClient.get<TableResponseDTO[]>(API_URL),
  getTableById: (id: number) => apiClient.get<TableResponseDTO>(`${API_URL}/${id}`),
  getById: (id: number) => apiClient.get<TableResponseDTO>(`${API_URL}/${id}`),
  createTable: (data: TableRequestDTO) => apiClient.post<TableResponseDTO>(API_URL, data),
  create: (data: TableRequestDTO) => apiClient.post<TableResponseDTO>(API_URL, data),
  updateTable: (id: number, data: TableRequestDTO) => apiClient.put<TableResponseDTO>(`${API_URL}/${id}`, data),
  update: (id: number, data: Partial<TableRequestDTO>) => apiClient.put<TableResponseDTO>(`${API_URL}/${id}`, data),
  deleteTable: (id: number) => apiClient.delete(`${API_URL}/${id}`),
  delete: (id: number) => apiClient.delete(`${API_URL}/${id}`),
  
  // Branch operations
  getTablesByBranch: (branchId: number) => apiClient.get<TableResponseDTO[]>(`${API_URL}/branch/${branchId}`),
  getByBranch: (branchId: number) => apiClient.get<TableResponseDTO[]>(`${API_URL}/branch/${branchId}`),
  
  // Status operations
  updateStatus: (id: number, status: TableStatus) => apiClient.patch<TableResponseDTO>(`${API_URL}/${id}/status`, { status }),
  setOperational: (id: number, active: boolean) => apiClient.patch<TableResponseDTO>(`${API_URL}/${id}/operational`, { active }),
  toggleOperational: (id: number, active: boolean) => apiClient.patch<TableResponseDTO>(`${API_URL}/${id}/operational`, { active }),
  
  // Available tables by seats (thay thế cho capacity)
  getAvailableTablesBySeats: (branchId: number, minSeats: number) => apiClient.get<TableResponseDTO[]>(`${API_URL}/available/${branchId}?minSeats=${minSeats}`),
  
  // Basic statistics
  getTableStatistics: (branchId: number) => apiClient.get<any>(`${API_URL}/statistics/${branchId}`),
  
  // Check if table can be deleted
  getDeletability: (id: number) => apiClient.get<{ deletable: boolean; reasons: string[] }>(`${API_URL}/${id}/deletability`),
  
  // History operations
  getTableHistory: (id: number) => apiClient.get<any[]>(`${API_URL}/${id}/history`),
  getTableHistoryByBranch: (branchId: number) => apiClient.get<any[]>(`${API_URL}/history/branch/${branchId}`),
  
  // Advanced operations
  getAvailableTablesByCapacity: (branchId: number, minCapacity: number) => apiClient.get<TableResponseDTO[]>(`${API_URL}/available/${branchId}?minCapacity=${minCapacity}`),
  getVipTables: (branchId: number) => apiClient.get<TableResponseDTO[]>(`${API_URL}/vip/${branchId}`),
  
  // Status with notes
  updateStatusWithNotes: (id: number, status: TableStatus, notes?: string) => apiClient.patch<TableResponseDTO>(`${API_URL}/${id}/status-with-notes`, { status, notes }),
  
  // Area operations
  getDistinctAreas: () => apiClient.get<string[]>(`${API_URL}/areas`),
  getDistinctAreasByBranch: (branchId: number) => apiClient.get<string[]>(`${API_URL}/areas/branch/${branchId}`),
};