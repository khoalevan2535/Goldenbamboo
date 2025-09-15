package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.SimpleDashboardStatsDTO;
import com.poly.restaurant.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * API lấy thống kê cơ bản cho dashboard
     * GET /api/dashboard/stats
     * Trả về: totalBranches, totalUsers, totalStaff, totalOrders
     */
    @GetMapping("/stats")
    public ResponseEntity<SimpleDashboardStatsDTO> getDashboardStats() {
        try {
            SimpleDashboardStatsDTO stats = new SimpleDashboardStatsDTO();
            
            // Lấy số liệu từ service
            stats.setTotalBranches(dashboardService.getTotalBranchesCount());
            stats.setTotalUsers(dashboardService.getTotalUsersCount());
            stats.setTotalStaff(dashboardService.getTotalStaffCount());
            stats.setTotalOrders(dashboardService.getTotalOrdersCount());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            // Trả về dữ liệu mặc định nếu có lỗi
            SimpleDashboardStatsDTO defaultStats = new SimpleDashboardStatsDTO(0L, 0L, 0L, 0L);
            return ResponseEntity.ok(defaultStats);
        }
    }

}