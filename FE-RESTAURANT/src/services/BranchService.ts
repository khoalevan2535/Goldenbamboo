import apiClient from '../utils/apiClient';

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

interface BranchService {
  // Lấy danh sách chi nhánh cho giao hàng (public API)
  getBranchesForDelivery(): Promise<Branch[]>;
  
  // Lấy danh sách tất cả chi nhánh (cần authentication)
  getAllBranches(): Promise<Branch[]>;
  
  // Lấy danh sách chi nhánh với pagination
  getAll(params?: any): Promise<any>;
  
  // Lấy chi nhánh theo ID
  getBranchById(id: number): Promise<Branch>;
  getById(id: number): Promise<Branch>;
  
  // CRUD operations
  create(data: any): Promise<Branch>;
  update(id: number, data: any): Promise<Branch>;
  delete(id: number): Promise<void>;
  updateStatus(id: number, status: string): Promise<Branch>;
}

class BranchServiceImpl implements BranchService {
  private readonly baseUrl = '/branches';

  async getBranchesForDelivery(): Promise<Branch[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/for-delivery`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branches for delivery:', error);
      throw error;
    }
  }

  async getAllBranches(): Promise<Branch[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all branches:', error);
      throw error;
    }
  }

  async getBranchById(id: number): Promise<Branch> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch by ID:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Branch> {
    return this.getBranchById(id);
  }

  async getAll(params?: any): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching branches with pagination:', error);
      throw error;
    }
  }

  async create(data: any): Promise<Branch> {
    try {
      const response = await apiClient.post(`${this.baseUrl}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async update(id: number, data: any): Promise<Branch> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }

  async updateStatus(id: number, status: string): Promise<Branch> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating branch status:', error);
      throw error;
    }
  }
}

export const branchService: BranchService = new BranchServiceImpl();

// Export class for backward compatibility
export const BranchService = branchService;

// Export types for external use
export type { Branch };