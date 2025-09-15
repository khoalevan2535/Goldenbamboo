package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.AnalyticsDTO;
import com.poly.restaurant.services.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // Test endpoint để kiểm tra quyền truy cập
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAccess() {
        Map<String, Object> response = Map.of(
            "message", "Analytics API is accessible",
            "status", "OK",
            "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.ok(response);
    }

    // Test endpoint để kiểm tra AnalyticsService
    @GetMapping("/test-service")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> testService() {
        try {
            // Test các method của AnalyticsService
            Map<String, Object> filters = Map.of("timeRange", "week");
            
            AnalyticsDTO.OrderStatsDTO orderStats = analyticsService.getOrderStats(filters);
            AnalyticsDTO.RevenueStatsDTO revenueStats = analyticsService.getRevenueStats(filters);
            List<AnalyticsDTO.BranchPerformanceDTO> branchPerformance = analyticsService.getBranchPerformance(filters);
            
            Map<String, Object> response = Map.of(
                "message", "AnalyticsService is working",
                "status", "OK",
                "orderStats", orderStats,
                "revenueStats", revenueStats,
                "branchPerformance", branchPerformance,
                "timestamp", System.currentTimeMillis()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                "message", "AnalyticsService error: " + e.getMessage(),
                "status", "ERROR",
                "timestamp", System.currentTimeMillis()
            );
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO> getDashboardSummary() {
        AnalyticsDTO dashboardData = analyticsService.getDashboardSummary();
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO.OrderStatsDTO> getOrderStats(
            @RequestParam(defaultValue = "week") String timeRange,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> filters = new HashMap<>();
        filters.put("timeRange", timeRange);
        if (branchId != null) filters.put("branchId", branchId);
        if (startDate != null) filters.put("startDate", startDate);
        if (endDate != null) filters.put("endDate", endDate);
        
        AnalyticsDTO.OrderStatsDTO orderStats = analyticsService.getOrderStats(filters);
        return ResponseEntity.ok(orderStats);
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO.RevenueStatsDTO> getRevenueStats(
            @RequestParam(defaultValue = "week") String timeRange,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> filters = new HashMap<>();
        filters.put("timeRange", timeRange);
        if (branchId != null) filters.put("branchId", branchId);
        if (startDate != null) filters.put("startDate", startDate);
        if (endDate != null) filters.put("endDate", endDate);
        
        AnalyticsDTO.RevenueStatsDTO revenueStats = analyticsService.getRevenueStats(filters);
        return ResponseEntity.ok(revenueStats);
    }

    @GetMapping("/branches")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<java.util.List<AnalyticsDTO.BranchPerformanceDTO>> getBranchPerformance(
            @RequestParam(defaultValue = "week") String timeRange,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> filters = new HashMap<>();
        filters.put("timeRange", timeRange);
        if (startDate != null) filters.put("startDate", startDate);
        if (endDate != null) filters.put("endDate", endDate);
        
        java.util.List<AnalyticsDTO.BranchPerformanceDTO> branchPerformance = analyticsService.getBranchPerformance(filters);
        return ResponseEntity.ok(branchPerformance);
    }

    @GetMapping("/menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO.MenuAnalysisDTO> getMenuAnalysis(
            @RequestParam(defaultValue = "month") String timeRange,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long categoryId) {
        
        Map<String, Object> filters = new HashMap<>();
        filters.put("timeRange", timeRange);
        if (branchId != null) filters.put("branchId", branchId);
        if (categoryId != null) filters.put("categoryId", categoryId);
        
        AnalyticsDTO.MenuAnalysisDTO menuAnalysis = analyticsService.getMenuAnalysis(filters);
        return ResponseEntity.ok(menuAnalysis);
    }

    @GetMapping("/forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO.ForecastDTO> getForecastData(
            @RequestParam(defaultValue = "week") String timeRange,
            @RequestParam(required = false) Long branchId) {
        
        Map<String, Object> filters = new HashMap<>();
        filters.put("timeRange", timeRange);
        if (branchId != null) filters.put("branchId", branchId);
        
        AnalyticsDTO.ForecastDTO forecastData = analyticsService.getForecastData(filters);
        return ResponseEntity.ok(forecastData);
    }
}






