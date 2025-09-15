package com.poly.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalBranches;
    private Long totalUsers;
    private Long totalStaff;
    private Long totalDishes;
    private Long totalCombos;
    private Long totalOrders;
    private Long pendingApprovals;
    private Long activeReservations;
    private Long todayOrders;
    private Double monthlyRevenue;
}

