import { ClientBranchDTO } from '../interfaces/ClientBranchDTO';
import { ClientCategoryWithCountsDTO } from '../interfaces/ClientCategoryWithCountsDTO';
import { ClientMenuItemDTO } from '../interfaces/ClientMenuItemDTO';
import { ClientMenuFilterDTO } from '../interfaces/ClientMenuFilterDTO';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class MenuServiceV2 {
  private baseUrl = `${API_BASE_URL}/client/menu/v2`;

  /**
   * Lấy danh sách chi nhánh active với caching
   */
  async getActiveBranches(): Promise<ClientBranchDTO[]> {
    const response = await fetch(`${this.baseUrl}/branches`);

    if (!response.ok) {
      throw new Error(`Failed to get active branches: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy danh sách category với counts
   */
  async getBranchScopedCategories(params: {
    branchId: number;
    type?: string;
    includeCounts?: boolean;
    showEmpty?: boolean;
    search?: string;
  }): Promise<ClientCategoryWithCountsDTO[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('branchId', params.branchId.toString());
    
    if (params.type) {
      searchParams.append('type', params.type);
    }
    if (params.includeCounts !== undefined) {
      searchParams.append('includeCounts', params.includeCounts.toString());
    }
    if (params.showEmpty !== undefined) {
      searchParams.append('showEmpty', params.showEmpty.toString());
    }
    if (params.search) {
      searchParams.append('search', params.search);
    }

    const response = await fetch(`${this.baseUrl}/categories?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to get branch scoped categories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy menu items với pagination
   */
  async getMenuItems(params: {
    branchId: number;
    categoryId?: number;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<{
    content: ClientMenuItemDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append('branchId', params.branchId.toString());
    
    if (params.categoryId) {
      searchParams.append('categoryId', params.categoryId.toString());
    }
    if (params.type) {
      searchParams.append('type', params.type);
    }
    if (params.search) {
      searchParams.append('search', params.search);
    }
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', params.pageSize.toString());
    }
    if (params.sort) {
      searchParams.append('sort', params.sort);
    }

    const response = await fetch(`${this.baseUrl}/items?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to get menu items: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy featured items
   */
  async getFeaturedItems(branchId: number): Promise<ClientMenuItemDTO[]> {
    const response = await fetch(`${this.baseUrl}/featured?branchId=${branchId}`);

    if (!response.ok) {
      throw new Error(`Failed to get featured items: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy menu filters
   */
  async getMenuFilters(branchId: number): Promise<ClientMenuFilterDTO> {
    const response = await fetch(`${this.baseUrl}/filters?branchId=${branchId}`);

    if (!response.ok) {
      throw new Error(`Failed to get menu filters: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy chi tiết menu item
   */
  async getMenuItem(itemId: number, type: 'dish' | 'combo'): Promise<ClientMenuItemDTO> {
    const response = await fetch(`${this.baseUrl}/items/${itemId}?type=${type}`);

    if (!response.ok) {
      throw new Error(`Failed to get menu item: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string; version: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Menu service v2 health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const menuServiceV2 = new MenuServiceV2();
