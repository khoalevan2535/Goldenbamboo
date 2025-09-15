package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.VoucherUsageHistoryRequestDTO;
import com.poly.restaurant.dtos.VoucherUsageHistoryResponseDTO;
import com.poly.restaurant.services.VoucherUsageHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/voucher-usage-history")
@RequiredArgsConstructor
public class VoucherUsageHistoryController {

    private final VoucherUsageHistoryService voucherUsageHistoryService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Voucher Usage History Service");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Voucher Usage History API is working");
        response.put("timestamp", System.currentTimeMillis());
        response.put("data", "Test data");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<?> saveVoucherUsage(@Valid @RequestBody VoucherUsageHistoryRequestDTO request) {
        try {
            VoucherUsageHistoryResponseDTO response = voucherUsageHistoryService.saveVoucherUsage(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to save voucher usage history");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/voucher/{voucherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<VoucherUsageHistoryResponseDTO>> getVoucherUsageHistory(@PathVariable Long voucherId) {
        try {
            List<VoucherUsageHistoryResponseDTO> history = voucherUsageHistoryService.getVoucherUsageHistory(voucherId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<?> getVoucherUsageByOrderId(@PathVariable Long orderId) {
        try {
            Optional<VoucherUsageHistoryResponseDTO> history = voucherUsageHistoryService.getVoucherUsageByOrderId(orderId);
            if (history.isPresent()) {
                return ResponseEntity.ok(history.get());
            } else {
                return ResponseEntity.ok(Map.of("message", "No voucher usage found for this order"));
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get voucher usage history");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/code/{voucherCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<VoucherUsageHistoryResponseDTO>> getVoucherUsageByCode(@PathVariable String voucherCode) {
        try {
            List<VoucherUsageHistoryResponseDTO> history = voucherUsageHistoryService.getVoucherUsageByCode(voucherCode);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/customer/{customerPhone}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<VoucherUsageHistoryResponseDTO>> getVoucherUsageByCustomerPhone(@PathVariable String customerPhone) {
        try {
            List<VoucherUsageHistoryResponseDTO> history = voucherUsageHistoryService.getVoucherUsageByCustomerPhone(customerPhone);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<VoucherUsageHistoryResponseDTO>> getVoucherUsageByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<VoucherUsageHistoryResponseDTO> history = voucherUsageHistoryService.getVoucherUsageByDateRange(start, end);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/voucher/{voucherId}/paginated")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<VoucherUsageHistoryResponseDTO>> getVoucherUsageHistoryPaginated(
            @PathVariable Long voucherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<VoucherUsageHistoryResponseDTO> history = voucherUsageHistoryService.getVoucherUsageHistoryPaginated(voucherId, page, size);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<VoucherUsageHistoryResponseDTO>> getAllVoucherUsageHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String voucherCode,
            @RequestParam(required = false) String customerPhone,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Page<VoucherUsageHistoryResponseDTO> history;
            
            // Nếu có filter, sử dụng method với filter
            if (voucherCode != null || customerPhone != null || startDate != null || endDate != null) {
                LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
                LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;
                history = voucherUsageHistoryService.getVoucherUsageHistoryWithFilters(
                        voucherCode, customerPhone, start, end, page, size);
            } else {
                // Nếu không có filter, sử dụng method thông thường
                history = voucherUsageHistoryService.getAllVoucherUsageHistoryPaginated(page, size);
            }
            
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/voucher/{voucherId}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getVoucherUsageCount(@PathVariable Long voucherId) {
        try {
            long count = voucherUsageHistoryService.getVoucherUsageCount(voucherId);
            Map<String, Object> response = new HashMap<>();
            response.put("voucherId", voucherId);
            response.put("usageCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get voucher usage count");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/code/{voucherCode}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getVoucherUsageCountByCode(@PathVariable String voucherCode) {
        try {
            long count = voucherUsageHistoryService.getVoucherUsageCountByCode(voucherCode);
            Map<String, Object> response = new HashMap<>();
            response.put("voucherCode", voucherCode);
            response.put("usageCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get voucher usage count");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/most-used-vouchers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Object[]>> getMostUsedVouchers(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Object[]> mostUsedVouchers = voucherUsageHistoryService.getMostUsedVouchers(limit);
            return ResponseEntity.ok(mostUsedVouchers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/most-active-customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Object[]>> getMostActiveCustomers(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Object[]> mostActiveCustomers = voucherUsageHistoryService.getMostActiveCustomers(limit);
            return ResponseEntity.ok(mostActiveCustomers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
