import apiClient from '../utils/apiClient';

export interface DashboardStats {
  totalBranches: number;
  totalUsers: number;
  totalStaff: number;
  totalOrders: number;
}

class DashboardService {
  // Lấy thống kê dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Sử dụng API gốc với tham số mặc định
      const response = await apiClient.get('/dashboard/stats');
      const data = response.data || response;
      
      return {
        totalBranches: data.totalBranches || 0,
        totalUsers: data.totalUsers || 0,
        totalStaff: data.totalStaff || 0,
        totalOrders: data.totalOrders || 0
      };
    } catch (error) {
      // Trả về dữ liệu mặc định nếu API lỗi
      return this.getDefaultStats();
    }
  }

  // Dữ liệu mặc định khi API lỗi
  private getDefaultStats(): DashboardStats {
    return {
      totalBranches: 0,
      totalUsers: 0,
      totalStaff: 0,
      totalOrders: 0
    };
  }
}

export default new DashboardService();