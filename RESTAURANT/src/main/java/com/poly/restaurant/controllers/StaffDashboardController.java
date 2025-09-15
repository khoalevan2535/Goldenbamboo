package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.DashboardStatsDTO;
import com.poly.restaurant.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/staff/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @RequestParam Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        DashboardStatsDTO stats = dashboardService.getDashboardStats(branchId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }
}
