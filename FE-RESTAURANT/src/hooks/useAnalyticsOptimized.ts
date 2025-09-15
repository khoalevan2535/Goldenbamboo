import { useMemo } from 'react';
import { useApiManager } from './useApiManager';
import { AnalyticsService } from '../services/AnalyticsService';

interface AnalyticsFilters {
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId?: number;
}

interface UseAnalyticsConfig {
  filters: AnalyticsFilters;
  enabled?: boolean;
}

export function useAnalyticsOptimized(config: UseAnalyticsConfig) {
  const { filters, enabled = true } = config;

  // Tạo cache key từ filters
  const cacheKey = useMemo(() => {
    return `analytics_${filters.timeRange}_${filters.branchId || 'all'}`;
  }, [filters.timeRange, filters.branchId]);

  // API calls với caching và retry
  const orderStats = useApiManager({
    key: `${cacheKey}_orders`,
    url: '/api/analytics/orders',
    method: 'GET',
    params: filters,
    cacheTime: 10 * 60 * 1000, // 10 phút cache
    retryCount: 1,
    retryDelay: 2000,
    debounceTime: 500,
    enabled
  });

  const revenueStats = useApiManager({
    key: `${cacheKey}_revenue`,
    url: '/api/analytics/revenue',
    method: 'GET',
    params: filters,
    cacheTime: 10 * 60 * 1000, // 10 phút cache
    retryCount: 1,
    retryDelay: 2000,
    debounceTime: 500,
    enabled
  });

  const branchPerformance = useApiManager({
    key: `${cacheKey}_branches`,
    url: '/api/analytics/branches',
    method: 'GET',
    params: filters,
    cacheTime: 10 * 60 * 1000, // 10 phút cache
    retryCount: 1,
    retryDelay: 2000,
    debounceTime: 500,
    enabled
  });

  // Tính toán loading state tổng hợp
  const isLoading = orderStats.loading || revenueStats.loading || branchPerformance.loading;

  // Tính toán error state tổng hợp
  const hasError = orderStats.error || revenueStats.error || branchPerformance.error;

  // Refetch tất cả data
  const refetchAll = () => {
    orderStats.refetch();
    revenueStats.refetch();
    branchPerformance.refetch();
  };

  return {
    // Data với fallback values
    orderStats: orderStats.data || {
      totalOrders: 0,
      averageOrderValue: 0,
      totalRevenue: 0,
      orderCount: 0,
      revenue: 0,
      todayOrders: 0,
      weeklyOrders: 0,
      monthlyOrders: 0,
      topSellingItems: []
    },
    revenueStats: revenueStats.data || {
      totalRevenue: 0,
      averageOrderValue: 0,
      revenueGrowth: 0,
      orderCount: 0,
      revenueByBranch: []
    },
    branchPerformance: branchPerformance.data || [],
    
    // States
    loading: isLoading,
    error: hasError,
    
    // Individual states
    orderStatsState: orderStats,
    revenueStatsState: revenueStats,
    branchPerformanceState: branchPerformance,
    
    // Actions
    refetchAll,
    refetchOrders: orderStats.refetch,
    refetchRevenue: revenueStats.refetch,
    refetchBranches: branchPerformance.refetch,
    
    // Cache info
    isStale: orderStats.isStale || revenueStats.isStale || branchPerformance.isStale
  };
}
