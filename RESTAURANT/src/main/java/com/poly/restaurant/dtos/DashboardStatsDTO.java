package com.poly.restaurant.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardStatsDTO {
    private Long todayOrders;
    private BigDecimal todayRevenue;
    private Long pendingOrders;
    private Long completedOrders;
    private Long totalTables;
    private Long occupiedTables;
    private BigDecimal averageOrderValue;

    private List<TopSellingItemDTO> topSellingItems;
    private List<HourlyStatDTO> hourlyStats;
    private List<RecentOrderDTO> recentOrders;

    @Data
    public static class TopSellingItemDTO {
        private String name;
        private Long quantity;
        private BigDecimal revenue;
    }

    @Data
    public static class HourlyStatDTO {
        private Integer hour;
        private Long orders;
        private BigDecimal revenue;
    }

    @Data
    public static class RecentOrderDTO {
        private Long id;
        private String tableName;
        private BigDecimal totalAmount;
        private String status;
        private String createdAt;
    }
}
