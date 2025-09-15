import apiClient from '../utils/apiClient';

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
    percentage: number;
  }>;
  orderTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export interface RevenueStats {
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  revenueByBranch: Array<{
    branchName: string;
    revenue: number;
    orders: number;
    averageOrder: number;
  }>;
  revenueByTime: Array<{
    hour: number;
    revenue: number;
    orders: number;
  }>;
  revenueTrends: Array<{
    date: string;
    revenue: number;
    growth: number;
  }>;
}

export interface BranchPerformance {
  branchId: number;
  branchName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderDensity: number;
  utilizationRate: number;
  ranking: number;
  performance: 'high' | 'medium' | 'low';
}

export interface MenuAnalysis {
  topProfitableItems: Array<{
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
  }>;
  lowPerformingItems: Array<{
    name: string;
    orders: number;
    revenue: number;
    lastOrderDate: string;
  }>;
  popularCombos: Array<{
    name: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
    topItem: string;
  }>;
}

export interface ForecastData {
  revenueForecast: Array<{
    date: string;
    predictedRevenue: number;
    confidence: number;
  }>;
  inventoryForecast: Array<{
    itemName: string;
    currentStock: number;
    predictedDemand: number;
    recommendedOrder: number;
  }>;
  peakHours: Array<{
    hour: number;
    predictedOrders: number;
    recommendedStaff: number;
  }>;
}

export interface AnalyticsFilters {
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId?: number;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

class AnalyticsService {
  // Get Order Statistics
  async getOrderStats(filters: AnalyticsFilters): Promise<OrderStats> {
    try {
      const response = await apiClient.get('/analytics/orders', { params: filters });
      // Check if response is valid JSON data
      if (typeof response === 'string' && response.includes('<!doctype')) {
        throw new Error('Received HTML instead of JSON - Backend may be down');
      }
      return this.convertBackendToFrontendOrderStats(response.data || response);
    } catch (error) {
      console.error('Analytics API error (orders):', error);
      console.log('Using mock data for orders');
      return this.getMockOrderStats();
    }
  }

  // Get Revenue Statistics
  async getRevenueStats(filters: AnalyticsFilters): Promise<RevenueStats> {
    try {
      const response = await apiClient.get('/analytics/revenue', { params: filters });
      // Check if response is valid JSON data
      if (typeof response === 'string' && response.includes('<!doctype')) {
        throw new Error('Received HTML instead of JSON - Backend may be down');
      }
      return this.convertBackendToFrontendRevenueStats(response.data || response);
    } catch (error) {
      console.error('Analytics API error (revenue):', error);
      console.log('Using mock data for revenue');
      return this.getMockRevenueStats();
    }
  }

  // Get Branch Performance
  async getBranchPerformance(filters: AnalyticsFilters): Promise<BranchPerformance[]> {
    try {
      const response = await apiClient.get('/analytics/branches', { params: filters });
      // Check if response is valid JSON data
      if (typeof response === 'string' && response.includes('<!doctype')) {
        throw new Error('Received HTML instead of JSON - Backend may be down');
      }
      return this.convertBackendToFrontendBranchPerformance(response.data || response);
    } catch (error) {
      console.error('Analytics API error (branches):', error);
      console.log('Using mock data for branches');
      return this.getMockBranchPerformance();
    }
  }

  // Get Menu Analysis
  async getMenuAnalysis(filters: AnalyticsFilters): Promise<MenuAnalysis> {
    try {
      const response = await apiClient.get('/analytics/menu', { params: filters });
      return response.data;
    } catch (error) {
      return this.getMockMenuAnalysis();
    }
  }

  // Get Forecast Data
  async getForecastData(filters: AnalyticsFilters): Promise<ForecastData> {
    try {
      const response = await apiClient.get('/analytics/forecast', { params: filters });
      return response.data;
    } catch (error) {
      return this.getMockForecastData();
    }
  }

  // Get Dashboard Summary
  async getDashboardSummary(): Promise<{
    orderStats: OrderStats;
    revenueStats: RevenueStats;
    branchPerformance: BranchPerformance[];
  }> {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      return {
        orderStats: this.getMockOrderStats(),
        revenueStats: this.getMockRevenueStats(),
        branchPerformance: this.getMockBranchPerformance()
      };
    }
  }

  // Mock data methods
  private getMockOrderStats(): OrderStats {
    return {
      totalOrders: 1250,
      todayOrders: 45,
      weeklyOrders: 320,
      monthlyOrders: 1250,
      averageOrderValue: 250000,
      topSellingItems: [
        { name: 'Phở Bò', quantity: 156, revenue: 39000000, percentage: 12.5 },
        { name: 'Cơm Tấm', quantity: 134, revenue: 26800000, percentage: 10.7 },
        { name: 'Bún Chả', quantity: 98, revenue: 19600000, percentage: 7.8 },
        { name: 'Combo Gia Đình', quantity: 87, revenue: 26100000, percentage: 7.0 },
        { name: 'Gỏi Cuốn', quantity: 76, revenue: 11400000, percentage: 6.1 }
      ],
      orderTrends: [
        { date: '2024-01-01', orders: 45, revenue: 11250000 },
        { date: '2024-01-02', orders: 52, revenue: 13000000 },
        { date: '2024-01-03', orders: 48, revenue: 12000000 },
        { date: '2024-01-04', orders: 61, revenue: 15250000 },
        { date: '2024-01-05', orders: 55, revenue: 13750000 }
      ]
    };
  }

  private getMockRevenueStats(): RevenueStats {
    return {
      totalRevenue: 312500000,
      todayRevenue: 11250000,
      weeklyRevenue: 80000000,
      monthlyRevenue: 312500000,
      revenueByBranch: [
        { branchName: 'Chi nhánh 1', revenue: 125000000, orders: 500, averageOrder: 250000 },
        { branchName: 'Chi nhánh 2', revenue: 100000000, orders: 400, averageOrder: 250000 },
        { branchName: 'Chi nhánh 3', revenue: 87500000, orders: 350, averageOrder: 250000 }
      ],
      revenueByTime: [
        { hour: 6, revenue: 5000000, orders: 20 },
        { hour: 7, revenue: 8000000, orders: 32 },
        { hour: 8, revenue: 12000000, orders: 48 },
        { hour: 9, revenue: 15000000, orders: 60 },
        { hour: 10, revenue: 18000000, orders: 72 },
        { hour: 11, revenue: 25000000, orders: 100 },
        { hour: 12, revenue: 35000000, orders: 140 },
        { hour: 13, revenue: 30000000, orders: 120 },
        { hour: 14, revenue: 20000000, orders: 80 },
        { hour: 15, revenue: 18000000, orders: 72 },
        { hour: 16, revenue: 22000000, orders: 88 },
        { hour: 17, revenue: 28000000, orders: 112 },
        { hour: 18, revenue: 40000000, orders: 160 },
        { hour: 19, revenue: 45000000, orders: 180 },
        { hour: 20, revenue: 35000000, orders: 140 },
        { hour: 21, revenue: 25000000, orders: 100 },
        { hour: 22, revenue: 15000000, orders: 60 }
      ],
      revenueTrends: [
        { date: '2024-01-01', revenue: 11250000, growth: 5.2 },
        { date: '2024-01-02', revenue: 13000000, growth: 8.1 },
        { date: '2024-01-03', revenue: 12000000, growth: 3.4 },
        { date: '2024-01-04', revenue: 15250000, growth: 12.7 },
        { date: '2024-01-05', revenue: 13750000, growth: 7.8 }
      ]
    };
  }

  private getMockBranchPerformance(): BranchPerformance[] {
    return [
      { 
        branchId: 1, 
        branchName: 'Chi nhánh 1', 
        totalOrders: 500, 
        totalRevenue: 125000000, 
        averageOrderValue: 250000, 
        orderDensity: 85, 
        utilizationRate: 92, 
        ranking: 1,
        performance: 'high'
      },
      { 
        branchId: 2, 
        branchName: 'Chi nhánh 2', 
        totalOrders: 400, 
        totalRevenue: 100000000, 
        averageOrderValue: 250000, 
        orderDensity: 78, 
        utilizationRate: 88, 
        ranking: 2,
        performance: 'medium'
      },
      { 
        branchId: 3, 
        branchName: 'Chi nhánh 3', 
        totalOrders: 350, 
        totalRevenue: 87500000, 
        averageOrderValue: 250000, 
        orderDensity: 72, 
        utilizationRate: 85, 
        ranking: 3,
        performance: 'medium'
      }
    ];
  }

  private getMockMenuAnalysis(): MenuAnalysis {
    return {
      topProfitableItems: [
        { name: 'Phở Bò', revenue: 39000000, cost: 19500000, profit: 19500000, profitMargin: 50 },
        { name: 'Cơm Tấm', revenue: 26800000, cost: 13400000, profit: 13400000, profitMargin: 50 },
        { name: 'Bún Chả', revenue: 19600000, cost: 9800000, profit: 9800000, profitMargin: 50 }
      ],
      lowPerformingItems: [
        { name: 'Món A', orders: 5, revenue: 1250000, lastOrderDate: '2024-01-01' },
        { name: 'Món B', orders: 3, revenue: 750000, lastOrderDate: '2024-01-02' },
        { name: 'Món C', orders: 2, revenue: 500000, lastOrderDate: '2024-01-03' }
      ],
      popularCombos: [
        { name: 'Combo Gia Đình', orders: 87, revenue: 26100000, percentage: 7.0 },
        { name: 'Combo Đôi', orders: 65, revenue: 19500000, percentage: 5.2 },
        { name: 'Combo Nhóm', orders: 45, revenue: 13500000, percentage: 3.6 }
      ],
      seasonalTrends: [
        { month: 'Tháng 1', orders: 1250, revenue: 312500000, topItem: 'Phở Bò' },
        { month: 'Tháng 2', orders: 1180, revenue: 295000000, topItem: 'Cơm Tấm' },
        { month: 'Tháng 3', orders: 1320, revenue: 330000000, topItem: 'Bún Chả' }
      ]
    };
  }

  private getMockForecastData(): ForecastData {
    return {
      revenueForecast: [
        { date: '2024-01-06', predictedRevenue: 14000000, confidence: 85 },
        { date: '2024-01-07', predictedRevenue: 13500000, confidence: 82 },
        { date: '2024-01-08', predictedRevenue: 15000000, confidence: 88 }
      ],
      inventoryForecast: [
        { itemName: 'Thịt bò', currentStock: 50, predictedDemand: 45, recommendedOrder: 40 },
        { itemName: 'Gạo', currentStock: 100, predictedDemand: 95, recommendedOrder: 80 },
        { itemName: 'Rau cải', currentStock: 30, predictedDemand: 35, recommendedOrder: 30 }
      ],
      peakHours: [
        { hour: 12, predictedOrders: 140, recommendedStaff: 8 },
        { hour: 18, predictedOrders: 160, recommendedStaff: 10 },
        { hour: 19, predictedOrders: 180, recommendedStaff: 12 }
      ]
    };
  }

  // Type conversion methods
  private convertBackendToFrontendOrderStats(backendData: any): OrderStats {
    return {
      totalOrders: Number(backendData.totalOrders) || 0,
      todayOrders: Number(backendData.todayOrders) || 0,
      weeklyOrders: Number(backendData.weeklyOrders) || 0,
      monthlyOrders: Number(backendData.monthlyOrders) || 0,
      averageOrderValue: Number(backendData.averageOrderValue) || 0,
      topSellingItems: (backendData.topSellingItems || []).map((item: any) => ({
        name: item.name || '',
        quantity: Number(item.quantity) || 0,
        revenue: Number(item.revenue) || 0,
        percentage: Number(item.percentage) || 0
      })),
      orderTrends: (backendData.orderTrends || []).map((trend: any) => ({
        date: trend.date || '',
        orders: Number(trend.orders) || 0,
        revenue: Number(trend.revenue) || 0
      }))
    };
  }

  private convertBackendToFrontendRevenueStats(backendData: any): RevenueStats {
    return {
      totalRevenue: Number(backendData.totalRevenue) || 0,
      todayRevenue: Number(backendData.todayRevenue) || 0,
      weeklyRevenue: Number(backendData.weeklyRevenue) || 0,
      monthlyRevenue: Number(backendData.monthlyRevenue) || 0,
      revenueByBranch: (backendData.revenueByBranch || []).map((branch: any) => ({
        branchName: branch.branchName || '',
        revenue: Number(branch.revenue) || 0,
        orders: Number(branch.orders) || 0,
        averageOrder: Number(branch.averageOrder) || 0
      })),
      revenueByTime: (backendData.revenueByTime || []).map((time: any) => ({
        hour: Number(time.hour) || 0,
        revenue: Number(time.revenue) || 0,
        orders: Number(time.orders) || 0
      })),
      revenueTrends: (backendData.revenueTrends || []).map((trend: any) => ({
        date: trend.date || '',
        revenue: Number(trend.revenue) || 0,
        growth: Number(trend.growth) || 0
      }))
    };
  }

  private convertBackendToFrontendBranchPerformance(backendData: any[]): BranchPerformance[] {
    return (backendData || []).map((branch: any) => ({
      branchId: Number(branch.branchId) || 0,
      branchName: branch.branchName || '',
      totalOrders: Number(branch.totalOrders) || 0,
      totalRevenue: Number(branch.totalRevenue) || 0,
      averageOrderValue: Number(branch.averageOrderValue) || 0,
      orderDensity: Number(branch.orderDensity) || 0,
      utilizationRate: Number(branch.utilizationRate) || 0,
      ranking: Number(branch.ranking) || 0,
      performance: branch.performance || 'medium'
    }));
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
export { AnalyticsService };
