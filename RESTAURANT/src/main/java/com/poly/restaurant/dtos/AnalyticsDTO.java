package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private OrderStatsDTO orderStats;
    private RevenueStatsDTO revenueStats;
    private List<BranchPerformanceDTO> branchPerformance;
    private MenuAnalysisDTO menuAnalysis;
    private ForecastDTO forecast;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatsDTO {
        private Long totalOrders;
        private Long todayOrders;
        private Long weeklyOrders;
        private Long monthlyOrders;
        private BigDecimal averageOrderValue;
        private List<TopSellingItemDTO> topSellingItems;
        private List<OrderTrendDTO> orderTrends;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingItemDTO {
        private String name;
        private Long quantity;
        private BigDecimal revenue;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderTrendDTO {
        private String date;
        private Long orders;
        private BigDecimal revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStatsDTO {
        private BigDecimal totalRevenue;
        private BigDecimal todayRevenue;
        private BigDecimal weeklyRevenue;
        private BigDecimal monthlyRevenue;
        private List<RevenueByBranchDTO> revenueByBranch;
        private List<RevenueByTimeDTO> revenueByTime;
        private List<RevenueTrendDTO> revenueTrends;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByBranchDTO {
        private String branchName;
        private BigDecimal revenue;
        private Long orders;
        private BigDecimal averageOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByTimeDTO {
        private Integer hour;
        private BigDecimal revenue;
        private Long orders;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTrendDTO {
        private String date;
        private BigDecimal revenue;
        private Double growth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchPerformanceDTO {
        private Long branchId;
        private String branchName;
        private Long totalOrders;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
        private Double orderDensity;
        private Double utilizationRate;
        private Integer ranking;
        private String performance; // "high", "medium", "low"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuAnalysisDTO {
        private List<ProfitableItemDTO> topProfitableItems;
        private List<LowPerformingItemDTO> lowPerformingItems;
        private List<PopularComboDTO> popularCombos;
        private List<SeasonalTrendDTO> seasonalTrends;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfitableItemDTO {
        private String name;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal profit;
        private Double profitMargin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowPerformingItemDTO {
        private String name;
        private Long orders;
        private BigDecimal revenue;
        private String lastOrderDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopularComboDTO {
        private String name;
        private Long orders;
        private BigDecimal revenue;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeasonalTrendDTO {
        private String month;
        private Long orders;
        private BigDecimal revenue;
        private String topItem;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDTO {
        private List<RevenueForecastDTO> revenueForecast;
        private List<InventoryForecastDTO> inventoryForecast;
        private List<PeakHourDTO> peakHours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueForecastDTO {
        private String date;
        private BigDecimal predictedRevenue;
        private Double confidence;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryForecastDTO {
        private String itemName;
        private Integer currentStock;
        private Integer predictedDemand;
        private Integer recommendedOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakHourDTO {
        private Integer hour;
        private Integer predictedOrders;
        private Integer recommendedStaff;
    }
}






