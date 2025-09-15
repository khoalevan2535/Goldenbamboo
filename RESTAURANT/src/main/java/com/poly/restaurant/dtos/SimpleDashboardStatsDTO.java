package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleDashboardStatsDTO {
    private Long totalBranches;
    private Long totalUsers;
    private Long totalStaff;
    private Long totalOrders;
}
