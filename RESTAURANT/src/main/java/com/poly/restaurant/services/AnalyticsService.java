package com.poly.restaurant.services;

import com.poly.restaurant.dtos.AnalyticsDTO;
import com.poly.restaurant.repositories.*;
import com.poly.restaurant.entities.*;
import com.poly.restaurant.entities.enums.BranchStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BranchRepository branchRepository;
    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;

    public AnalyticsDTO getDashboardSummary() {
        AnalyticsDTO dashboardData = new AnalyticsDTO();
        
        // Get basic stats
        Map<String, Object> filters = Map.of("timeRange", "week");
        dashboardData.setOrderStats(getOrderStats(filters));
        dashboardData.setRevenueStats(getRevenueStats(filters));
        dashboardData.setBranchPerformance(getBranchPerformance(filters));
        
        return dashboardData;
    }

    public AnalyticsDTO.OrderStatsDTO getOrderStats(Map<String, Object> filters) {
        String timeRange = (String) filters.getOrDefault("timeRange", "week");
        Long branchId = (Long) filters.get("branchId");
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get real data from database with branch filtering
        Long totalOrders = branchId != null ? 
            orderRepository.countByBranchIdAndCreatedAtBetween(branchId, startDate, endDate) :
            orderRepository.countByCreatedAtBetween(startDate, endDate);
            
        Long todayOrders = branchId != null ?
            orderRepository.countByBranchIdAndCreatedAtBetween(branchId, 
                LocalDate.now().atStartOfDay(), 
                LocalDate.now().atTime(LocalTime.MAX)) :
            orderRepository.countByCreatedAtBetween(
                LocalDate.now().atStartOfDay(), 
                LocalDate.now().atTime(LocalTime.MAX)
            );
            
        Long weeklyOrders = branchId != null ?
            orderRepository.countByBranchIdAndCreatedAtBetween(branchId,
                LocalDate.now().minusWeeks(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)) :
            orderRepository.countByCreatedAtBetween(
                LocalDate.now().minusWeeks(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
            );
            
        Long monthlyOrders = branchId != null ?
            orderRepository.countByBranchIdAndCreatedAtBetween(branchId,
                LocalDate.now().minusMonths(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)) :
            orderRepository.countByCreatedAtBetween(
                LocalDate.now().minusMonths(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
            );
        
        // Calculate average order value with branch filtering
        BigDecimal totalRevenue = branchId != null ?
            orderRepository.getRevenueByBranchIdBetween(branchId, startDate, endDate) :
            orderRepository.getTotalRevenueByCreatedAtBetween(startDate, endDate);
        BigDecimal averageOrderValue = totalOrders > 0 ? 
            totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;
        
        // Get top selling items
        List<AnalyticsDTO.TopSellingItemDTO> topSellingItems = getTopSellingItems(filters);
        
        // Get order trends
        List<AnalyticsDTO.OrderTrendDTO> orderTrends = getOrderTrends(timeRange, branchId);
        
        return new AnalyticsDTO.OrderStatsDTO(
            totalOrders, todayOrders, weeklyOrders, monthlyOrders,
            averageOrderValue, topSellingItems, orderTrends
        );
    }

    public AnalyticsDTO.RevenueStatsDTO getRevenueStats(Map<String, Object> filters) {
        String timeRange = (String) filters.getOrDefault("timeRange", "week");
        Long branchId = (Long) filters.get("branchId");
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get real data from database with branch filtering
        BigDecimal totalRevenue = branchId != null ?
            orderRepository.getRevenueByBranchIdBetween(branchId, startDate, endDate) :
            orderRepository.getTotalRevenueByCreatedAtBetween(startDate, endDate);
            
        BigDecimal todayRevenue = branchId != null ?
            orderRepository.getRevenueByBranchIdBetween(branchId,
                LocalDate.now().atStartOfDay(), 
                LocalDate.now().atTime(LocalTime.MAX)) :
            orderRepository.getTotalRevenueByCreatedAtBetween(
                LocalDate.now().atStartOfDay(), 
                LocalDate.now().atTime(LocalTime.MAX)
            );
            
        BigDecimal weeklyRevenue = branchId != null ?
            orderRepository.getRevenueByBranchIdBetween(branchId,
                LocalDate.now().minusWeeks(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)) :
            orderRepository.getTotalRevenueByCreatedAtBetween(
                LocalDate.now().minusWeeks(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
            );
            
        BigDecimal monthlyRevenue = branchId != null ?
            orderRepository.getRevenueByBranchIdBetween(branchId,
                LocalDate.now().minusMonths(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)) :
            orderRepository.getTotalRevenueByCreatedAtBetween(
                LocalDate.now().minusMonths(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
            );
        
        // Get revenue by branch
        List<AnalyticsDTO.RevenueByBranchDTO> revenueByBranch = getRevenueByBranch(filters);
        
        // Get revenue by time
        List<AnalyticsDTO.RevenueByTimeDTO> revenueByTime = getRevenueByTime(timeRange);
        
        // Get revenue trends
        List<AnalyticsDTO.RevenueTrendDTO> revenueTrends = getRevenueTrends(timeRange);
        
        return new AnalyticsDTO.RevenueStatsDTO(
            totalRevenue, todayRevenue, weeklyRevenue, monthlyRevenue,
            revenueByBranch, revenueByTime, revenueTrends
        );
    }

    public List<AnalyticsDTO.BranchPerformanceDTO> getBranchPerformance(Map<String, Object> filters) {
        String timeRange = (String) filters.getOrDefault("timeRange", "week");
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        List<AnalyticsDTO.BranchPerformanceDTO> branchPerformance = new ArrayList<>();
        
        // Get only active branches (OPEN status)
        List<BranchEntity> branches = branchRepository.findByStatus(BranchStatus.OPEN);
        
        for (int i = 0; i < branches.size(); i++) {
            BranchEntity branch = branches.get(i);
            
            // Get real data from database
            Long totalOrders = orderRepository.countByBranchIdAndCreatedAtBetween(
                branch.getId(), startDate, endDate
            );
            BigDecimal totalRevenue = orderRepository.getRevenueByBranchIdBetween(
                branch.getId(), startDate, endDate
            );
            BigDecimal averageOrderValue = totalOrders > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
            
            // Calculate order density (orders per day)
            long daysInRange = java.time.Duration.between(startDate, endDate).toDays();
            Double orderDensity = daysInRange > 0 ? (double) totalOrders / daysInRange : 0.0;
            
            // Calculate utilization rate based on revenue performance
            Double utilizationRate;
            if (totalRevenue.compareTo(BigDecimal.valueOf(10000000)) > 0) {
                utilizationRate = 95.0; // High revenue = high utilization
            } else if (totalRevenue.compareTo(BigDecimal.valueOf(5000000)) > 0) {
                utilizationRate = 80.0; // Medium revenue = medium utilization
            } else if (totalRevenue.compareTo(BigDecimal.valueOf(1000000)) > 0) {
                utilizationRate = 60.0; // Low revenue = low utilization
            } else {
                utilizationRate = 30.0; // Very low revenue = very low utilization
            }
            
            // Determine performance level based on multiple factors
            String performance;
            if (totalOrders > 100 && totalRevenue.compareTo(BigDecimal.valueOf(5000000)) > 0) {
                performance = "high";
            } else if (totalOrders > 50 && totalRevenue.compareTo(BigDecimal.valueOf(2000000)) > 0) {
                performance = "medium";
            } else {
                performance = "low";
            }
            
            branchPerformance.add(new AnalyticsDTO.BranchPerformanceDTO(
                branch.getId(), branch.getName(), totalOrders, totalRevenue,
                averageOrderValue, orderDensity, utilizationRate, i + 1, performance
            ));
        }
        
        // Sort by total revenue
        branchPerformance.sort(Comparator.comparing(AnalyticsDTO.BranchPerformanceDTO::getTotalRevenue).reversed());
        
        // Update rankings after sorting
        for (int i = 0; i < branchPerformance.size(); i++) {
            branchPerformance.get(i).setRanking(i + 1);
        }
        
        return branchPerformance;
    }

    public AnalyticsDTO.MenuAnalysisDTO getMenuAnalysis(Map<String, Object> filters) {
        // Get top profitable items
        List<AnalyticsDTO.ProfitableItemDTO> topProfitableItems = getTopProfitableItems();
        
        // Get low performing items
        List<AnalyticsDTO.LowPerformingItemDTO> lowPerformingItems = getLowPerformingItems();
        
        // Get popular combos
        List<AnalyticsDTO.PopularComboDTO> popularCombos = getPopularCombos();
        
        // Get seasonal trends
        List<AnalyticsDTO.SeasonalTrendDTO> seasonalTrends = getSeasonalTrends();
        
        return new AnalyticsDTO.MenuAnalysisDTO(
            topProfitableItems, lowPerformingItems, popularCombos, seasonalTrends
        );
    }

    public AnalyticsDTO.ForecastDTO getForecastData(Map<String, Object> filters) {
        // Get revenue forecast
        List<AnalyticsDTO.RevenueForecastDTO> revenueForecast = getRevenueForecast();
        
        // Get inventory forecast
        List<AnalyticsDTO.InventoryForecastDTO> inventoryForecast = getInventoryForecast();
        
        // Get peak hours
        List<AnalyticsDTO.PeakHourDTO> peakHours = getPeakHours();
        
        return new AnalyticsDTO.ForecastDTO(revenueForecast, inventoryForecast, peakHours);
    }

    // Helper methods
    private LocalDateTime getStartDate(String timeRange) {
        LocalDate today = LocalDate.now();
        return switch (timeRange) {
            case "today" -> today.atStartOfDay();
            case "week" -> today.minusWeeks(1).atStartOfDay();
            case "month" -> today.minusMonths(1).atStartOfDay();
            case "quarter" -> today.minusMonths(3).atStartOfDay();
            case "year" -> today.minusYears(1).atStartOfDay();
            default -> today.minusWeeks(1).atStartOfDay();
        };
    }

    private List<AnalyticsDTO.TopSellingItemDTO> getTopSellingItems(Map<String, Object> filters) {
        Long branchId = (Long) filters.get("branchId");
        String timeRange = (String) filters.getOrDefault("timeRange", "week");
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get top selling dishes with optimized native SQL
        List<Object[]> topDishes = branchId != null ?
            orderItemRepository.findTopSellingDishesByBranchAndDateRange(branchId, startDate, endDate) :
            orderItemRepository.findTopSellingDishesByDateRange(startDate, endDate);
        
        List<AnalyticsDTO.TopSellingItemDTO> topSellingItems = new ArrayList<>();
        
        for (Object[] result : topDishes) {
            String dishName = (String) result[0]; // item_name
            Long quantity = ((Number) result[1]).longValue(); // total_quantity
            BigDecimal revenue = (BigDecimal) result[2]; // total_revenue
            Double percentage = ((Number) result[3]).doubleValue(); // percentage
            
            topSellingItems.add(new AnalyticsDTO.TopSellingItemDTO(
                dishName, quantity, revenue, percentage
            ));
        }
        
        // If no real data, return empty list
        if (topSellingItems.isEmpty()) {
            return new ArrayList<>();
        }
        
        return topSellingItems;
    }

    private List<AnalyticsDTO.OrderTrendDTO> getOrderTrends(String timeRange, Long branchId) {
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get order trends by date with optimized native SQL
        List<Object[]> orderTrends = branchId != null ?
            orderRepository.findOrderTrendsByBranchAndDateRange(branchId, startDate, endDate) :
            orderRepository.findOrderTrendsByDateRange(startDate, endDate);
        
        List<AnalyticsDTO.OrderTrendDTO> trends = new ArrayList<>();
        
        for (Object[] result : orderTrends) {
            String date = ((java.sql.Date) result[0]).toString(); // order_date
            Long orders = ((Number) result[1]).longValue(); // order_count
            BigDecimal revenue = (BigDecimal) result[2]; // revenue
            
            trends.add(new AnalyticsDTO.OrderTrendDTO(date, orders, revenue));
        }
        
        // If no real data, return empty list
        if (trends.isEmpty()) {
            return new ArrayList<>();
        }
        
        return trends;
    }

    private List<AnalyticsDTO.RevenueByBranchDTO> getRevenueByBranch(Map<String, Object> filters) {
        String timeRange = (String) filters.getOrDefault("timeRange", "week");
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get revenue by branch with optimized native SQL
        List<Object[]> revenueByBranch = orderRepository.findRevenueByBranchAndDateRange(startDate, endDate);
        
        List<AnalyticsDTO.RevenueByBranchDTO> result = new ArrayList<>();
        
        for (Object[] data : revenueByBranch) {
            String branchName = (String) data[0]; // name
            BigDecimal revenue = (BigDecimal) data[1]; // revenue
            Long orders = ((Number) data[2]).longValue(); // order_count
            BigDecimal averageOrder = orders > 0 ? 
                revenue.divide(BigDecimal.valueOf(orders), 2, BigDecimal.ROUND_HALF_UP) : 
                BigDecimal.ZERO;
            
            result.add(new AnalyticsDTO.RevenueByBranchDTO(branchName, revenue, orders, averageOrder));
        }
        
        // If no real data, return mock data
        if (result.isEmpty()) {
            return Arrays.asList(
                new AnalyticsDTO.RevenueByBranchDTO("Chi nhánh 1", new BigDecimal("125000000"), 500L, new BigDecimal("250000")),
                new AnalyticsDTO.RevenueByBranchDTO("Chi nhánh 2", new BigDecimal("100000000"), 400L, new BigDecimal("250000")),
                new AnalyticsDTO.RevenueByBranchDTO("Chi nhánh 3", new BigDecimal("87500000"), 350L, new BigDecimal("250000"))
            );
        }
        
        return result;
    }

    private List<AnalyticsDTO.RevenueByTimeDTO> getRevenueByTime(Long branchId, String timeRange) {
        // Get revenue by hour with optimized native SQL
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get revenue by hour
        List<Object[]> revenueByTime = branchId != null ?
            orderRepository.findRevenueByHourAndBranch(branchId, startDate, endDate) :
            orderRepository.findRevenueByHour(startDate, endDate);
        
        List<AnalyticsDTO.RevenueByTimeDTO> result = new ArrayList<>();
        
        for (Object[] data : revenueByTime) {
            Integer hour = ((Number) data[0]).intValue(); // hour
            BigDecimal revenue = (BigDecimal) data[1]; // revenue
            Long orders = ((Number) data[2]).longValue(); // order_count
            
            result.add(new AnalyticsDTO.RevenueByTimeDTO(hour, revenue, orders));
        }
        
        // If no real data, return mock data
        if (result.isEmpty()) {
            return Arrays.asList(
                new AnalyticsDTO.RevenueByTimeDTO(12, new BigDecimal("35000000"), 140L),
                new AnalyticsDTO.RevenueByTimeDTO(13, new BigDecimal("30000000"), 120L),
                new AnalyticsDTO.RevenueByTimeDTO(18, new BigDecimal("40000000"), 160L),
                new AnalyticsDTO.RevenueByTimeDTO(19, new BigDecimal("45000000"), 180L),
                new AnalyticsDTO.RevenueByTimeDTO(20, new BigDecimal("35000000"), 140L)
            );
        }
        
        return result;
    }

    private List<AnalyticsDTO.RevenueByTimeDTO> getRevenueByTime(String timeRange) {
        // Get revenue by hour with optimized native SQL
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get revenue by hour
        List<Object[]> revenueByTime = orderRepository.findRevenueByHour(startDate, endDate);
        
        List<AnalyticsDTO.RevenueByTimeDTO> result = new ArrayList<>();
        
        for (Object[] data : revenueByTime) {
            Integer hour = ((Number) data[0]).intValue(); // hour
            BigDecimal revenue = (BigDecimal) data[1]; // revenue
            Long orders = ((Number) data[2]).longValue(); // order_count
            
            result.add(new AnalyticsDTO.RevenueByTimeDTO(hour, revenue, orders));
        }
        
        // If no real data, return mock data
        if (result.isEmpty()) {
            return Arrays.asList(
                new AnalyticsDTO.RevenueByTimeDTO(12, new BigDecimal("35000000"), 140L),
                new AnalyticsDTO.RevenueByTimeDTO(13, new BigDecimal("30000000"), 120L),
                new AnalyticsDTO.RevenueByTimeDTO(18, new BigDecimal("40000000"), 160L),
                new AnalyticsDTO.RevenueByTimeDTO(19, new BigDecimal("45000000"), 180L),
                new AnalyticsDTO.RevenueByTimeDTO(20, new BigDecimal("35000000"), 140L)
            );
        }
        
        return result;
    }

    private List<AnalyticsDTO.RevenueTrendDTO> getRevenueTrends(String timeRange, Long branchId) {
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get revenue trends with optimized native SQL
        List<Object[]> revenueTrends = branchId != null ?
            orderRepository.findRevenueTrendsByBranchAndDateRange(branchId, startDate, endDate) :
            orderRepository.findRevenueTrendsByDateRange(startDate, endDate);
        
        List<AnalyticsDTO.RevenueTrendDTO> trends = new ArrayList<>();
        
        for (Object[] result : revenueTrends) {
            String date = ((java.sql.Date) result[0]).toString(); // order_date
            BigDecimal revenue = (BigDecimal) result[1]; // revenue
            Double growth = ((Number) result[2]).doubleValue(); // growth
            
            trends.add(new AnalyticsDTO.RevenueTrendDTO(date, revenue, growth));
        }
        
        // If no real data, return mock data
        if (trends.isEmpty()) {
            return Arrays.asList(
                new AnalyticsDTO.RevenueTrendDTO("2024-01-01", new BigDecimal("11250000"), 5.2),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-02", new BigDecimal("13000000"), 8.1),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-03", new BigDecimal("12000000"), 3.4),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-04", new BigDecimal("15250000"), 12.7),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-05", new BigDecimal("13750000"), 7.8)
            );
        }
        
        return trends;
    }

    private List<AnalyticsDTO.RevenueTrendDTO> getRevenueTrends(String timeRange) {
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get revenue trends with optimized native SQL
        List<Object[]> revenueTrends = orderRepository.findRevenueTrendsByDateRange(startDate, endDate);
        
        List<AnalyticsDTO.RevenueTrendDTO> trends = new ArrayList<>();
        
        for (Object[] result : revenueTrends) {
            String date = ((java.sql.Date) result[0]).toString(); // order_date
            BigDecimal revenue = (BigDecimal) result[1]; // revenue
            Double growth = ((Number) result[2]).doubleValue(); // growth
            
            trends.add(new AnalyticsDTO.RevenueTrendDTO(date, revenue, growth));
        }
        
        // If no real data, return mock data
        if (trends.isEmpty()) {
            return Arrays.asList(
                new AnalyticsDTO.RevenueTrendDTO("2024-01-01", new BigDecimal("11250000"), 5.2),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-02", new BigDecimal("13000000"), 8.1),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-03", new BigDecimal("12000000"), 3.4),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-04", new BigDecimal("15250000"), 12.7),
                new AnalyticsDTO.RevenueTrendDTO("2024-01-05", new BigDecimal("13750000"), 7.8)
            );
        }
        
        return trends;
    }

    private Double calculateOrderDensity(Long branchId, String timeRange) {
        // Calculate order density based on actual orders vs capacity
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        Long actualOrders = orderRepository.countByBranchIdAndCreatedAtBetween(branchId, startDate, endDate);
        
        // Assume 100 orders per day as capacity for calculation
        long daysInRange = java.time.Duration.between(startDate, endDate).toDays();
        long capacity = daysInRange * 100;
        
        if (capacity == 0) return 0.0;
        
        return Math.min(100.0, (double) actualOrders / capacity * 100);
    }

    private Double calculateUtilizationRate(Long branchId, String timeRange) {
        // Calculate utilization rate based on table usage
        LocalDateTime startDate = getStartDate(timeRange);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Get total tables and occupied tables
        Long totalTables = orderRepository.countDistinctTablesByBranch(branchId);
        Long occupiedTables = orderRepository.countOccupiedTablesByBranchAndDateRange(branchId, startDate, endDate);
        
        if (totalTables == 0) return 0.0;
        
        return Math.min(100.0, (double) occupiedTables / totalTables * 100);
    }

    private List<AnalyticsDTO.ProfitableItemDTO> getTopProfitableItems() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.ProfitableItemDTO("Phở Bò", new BigDecimal("39000000"), new BigDecimal("19500000"), new BigDecimal("19500000"), 50.0),
            new AnalyticsDTO.ProfitableItemDTO("Cơm Tấm", new BigDecimal("26800000"), new BigDecimal("13400000"), new BigDecimal("13400000"), 50.0),
            new AnalyticsDTO.ProfitableItemDTO("Bún Chả", new BigDecimal("19600000"), new BigDecimal("9800000"), new BigDecimal("9800000"), 50.0)
        );
    }

    private List<AnalyticsDTO.LowPerformingItemDTO> getLowPerformingItems() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.LowPerformingItemDTO("Món A", 5L, new BigDecimal("1250000"), "2024-01-01"),
            new AnalyticsDTO.LowPerformingItemDTO("Món B", 3L, new BigDecimal("750000"), "2024-01-02"),
            new AnalyticsDTO.LowPerformingItemDTO("Món C", 2L, new BigDecimal("500000"), "2024-01-03")
        );
    }

    private List<AnalyticsDTO.PopularComboDTO> getPopularCombos() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.PopularComboDTO("Combo Gia Đình", 87L, new BigDecimal("26100000"), 7.0),
            new AnalyticsDTO.PopularComboDTO("Combo Đôi", 65L, new BigDecimal("19500000"), 5.2),
            new AnalyticsDTO.PopularComboDTO("Combo Nhóm", 45L, new BigDecimal("13500000"), 3.6)
        );
    }

    private List<AnalyticsDTO.SeasonalTrendDTO> getSeasonalTrends() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.SeasonalTrendDTO("Tháng 1", 1250L, new BigDecimal("312500000"), "Phở Bò"),
            new AnalyticsDTO.SeasonalTrendDTO("Tháng 2", 1180L, new BigDecimal("295000000"), "Cơm Tấm"),
            new AnalyticsDTO.SeasonalTrendDTO("Tháng 3", 1320L, new BigDecimal("330000000"), "Bún Chả")
        );
    }

    private List<AnalyticsDTO.RevenueForecastDTO> getRevenueForecast() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.RevenueForecastDTO("2024-01-06", new BigDecimal("14000000"), 85.0),
            new AnalyticsDTO.RevenueForecastDTO("2024-01-07", new BigDecimal("13500000"), 82.0),
            new AnalyticsDTO.RevenueForecastDTO("2024-01-08", new BigDecimal("15000000"), 88.0)
        );
    }

    private List<AnalyticsDTO.InventoryForecastDTO> getInventoryForecast() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.InventoryForecastDTO("Thịt bò", 50, 45, 40),
            new AnalyticsDTO.InventoryForecastDTO("Gạo", 100, 95, 80),
            new AnalyticsDTO.InventoryForecastDTO("Rau cải", 30, 35, 30)
        );
    }

    private List<AnalyticsDTO.PeakHourDTO> getPeakHours() {
        // Mock data
        return Arrays.asList(
            new AnalyticsDTO.PeakHourDTO(12, 140, 8),
            new AnalyticsDTO.PeakHourDTO(18, 160, 10),
            new AnalyticsDTO.PeakHourDTO(19, 180, 12)
        );
    }
}


