package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.DiscountRequestDTO;
import com.poly.restaurant.dtos.DiscountResponseDTO;
import com.poly.restaurant.services.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.poly.restaurant.repositories.DiscountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private static final Logger logger = LoggerFactory.getLogger(DiscountController.class);
    private final DiscountService discountService;
    private final DiscountRepository discountRepository;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Discount Service");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test database connection
            long count = discountRepository.count();
            response.put("status", "SUCCESS");
            response.put("message", "Database connection successful");
            response.put("discountCount", count);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Database connection test failed", e);
            response.put("status", "ERROR");
            response.put("message", "Database connection failed: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/test-simple")
    public ResponseEntity<Map<String, Object>> testSimple() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test simple response
            response.put("status", "SUCCESS");
            response.put("message", "Simple test successful");
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Simple test failed", e);
            response.put("status", "ERROR");
            response.put("message", "Simple test failed: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/test-data")
    public ResponseEntity<Map<String, Object>> testData() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test with sample data
            response.put("status", "SUCCESS");
            response.put("message", "Test data endpoint");
            response.put("data", List.of(
                Map.of("id", 1, "code", "TEST001", "name", "Test Discount", "newPrice", 100000),
                Map.of("id", 2, "code", "TEST002", "name", "Test Discount 2", "newPrice", 200000)
            ));
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Test data failed", e);
            response.put("status", "ERROR");
            response.put("message", "Test data failed: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createDiscount(@Valid @RequestBody DiscountRequestDTO request) {
        try {
            logger.info("Creating discount with name: {}", request.getName());
            logger.info("StartDate: {}, EndDate: {}", request.getStartDate(), request.getEndDate());
            
            DiscountResponseDTO createdDiscount = discountService.createDiscount(request);
            logger.info("Discount created successfully with ID: {}", createdDiscount.getId());
            
            return new ResponseEntity<>(createdDiscount, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating discount", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create discount");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<DiscountResponseDTO>> getAllDiscounts() {
        try {
            logger.info("🔄 Getting all discounts - Request received");
            List<DiscountResponseDTO> discounts = discountService.getAllDiscounts();
            logger.info("✅ Found {} discounts, returning response", discounts.size());
            return ResponseEntity.ok(discounts);
        } catch (Exception e) {
            logger.error("❌ Error getting all discounts: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DiscountResponseDTO> getDiscountById(@PathVariable Long id) {
        try {
            logger.info("Getting discount by ID: {}", id);
            DiscountResponseDTO discount = discountService.getDiscountById(id);
            logger.info("Found discount: {}", discount.getName());
            return ResponseEntity.ok(discount);
        } catch (Exception e) {
            logger.error("Error getting discount by ID: {}", id, e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DiscountResponseDTO> updateDiscount(@PathVariable Long id, @Valid @RequestBody DiscountRequestDTO request) {
        try {
            logger.info("Updating discount with ID: {}", id);
            DiscountResponseDTO updatedDiscount = discountService.updateDiscount(id, request);
            logger.info("Discount updated successfully");
            return ResponseEntity.ok(updatedDiscount);
        } catch (Exception e) {
            logger.error("Error updating discount with ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteDiscount(@PathVariable Long id) {
        try {
            logger.info("Deleting discount with ID: {}", id);
            discountService.deleteDiscount(id);
            logger.info("Discount deleted successfully");
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting discount with ID: {}", id, e);
            throw e;
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<DiscountResponseDTO>> getActiveDiscounts() {
        try {
            logger.info("Getting active discounts");
            List<DiscountResponseDTO> activeDiscounts = discountService.getActiveDiscounts();
            logger.info("Found {} active discounts", activeDiscounts.size());
            return ResponseEntity.ok(activeDiscounts);
        } catch (Exception e) {
            logger.error("Error getting active discounts", e);
            throw e;
        }
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> applyDiscount(@RequestBody Map<String, Object> request) {
        try {
            Long discountId = Long.valueOf(request.get("discountId").toString());
            Long dishId = request.get("dishId") != null ? Long.valueOf(request.get("dishId").toString()) : null;
            Long comboId = request.get("comboId") != null ? Long.valueOf(request.get("comboId").toString()) : null;
            
            logger.info("Applying discount {} to dish {} or combo {}", discountId, dishId, comboId);
            
            discountService.applyDiscount(discountId, dishId, comboId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Discount applied successfully");
            response.put("discountId", discountId);
            response.put("dishId", dishId);
            response.put("comboId", comboId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error applying discount", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to apply discount");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/dish/{dishId}/active")
    public ResponseEntity<?> getActiveDiscountForDish(@PathVariable Long dishId) {
        try {
            Optional<DiscountResponseDTO> activeDiscount = discountService.getActiveDiscountForDish(dishId);
            if (activeDiscount.isPresent()) {
                return ResponseEntity.ok(activeDiscount.get());
            } else {
                return ResponseEntity.ok(Map.of("message", "No active discount for this dish"));
            }
        } catch (Exception e) {
            logger.error("Error getting active discount for dish {}: {}", dishId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/combo/{comboId}/active")
    public ResponseEntity<?> getActiveDiscountForCombo(@PathVariable Long comboId) {
        try {
            Optional<DiscountResponseDTO> activeDiscount = discountService.getActiveDiscountForCombo(comboId);
            if (activeDiscount.isPresent()) {
                return ResponseEntity.ok(activeDiscount.get());
            } else {
                return ResponseEntity.ok(Map.of("message", "No active discount for this combo"));
            }
        } catch (Exception e) {
            logger.error("Error getting active discount for combo {}: {}", comboId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getDiscountByCode(@PathVariable String code) {
        try {
            logger.info("Getting discount by code: {}", code);
            Optional<DiscountResponseDTO> discount = discountService.getDiscountByCode(code);
            if (discount.isPresent()) {
                return ResponseEntity.ok(discount.get());
            } else {
                return ResponseEntity.ok(Map.of("message", "Voucher not found or expired"));
            }
        } catch (Exception e) {
            logger.error("Error getting discount by code {}: {}", code, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateVoucher(@RequestBody Map<String, Object> request) {
        try {
            String voucherCode = request.get("voucherCode").toString();
            Long dishId = request.get("dishId") != null ? Long.valueOf(request.get("dishId").toString()) : null;
            Long comboId = request.get("comboId") != null ? Long.valueOf(request.get("comboId").toString()) : null;
            
            logger.info("Validating voucher: {} for dish: {} or combo: {}", voucherCode, dishId, comboId);
            
            boolean isValid = discountService.validateVoucher(voucherCode, dishId, comboId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            response.put("voucherCode", voucherCode);
            response.put("dishId", dishId);
            response.put("comboId", comboId);
            
            if (isValid) {
                Optional<DiscountResponseDTO> voucher = discountService.getDiscountByCode(voucherCode);
                if (voucher.isPresent()) {
                    response.put("voucher", voucher.get());
                }
            } else {
                response.put("message", "Voucher is not valid or expired");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error validating voucher", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to validate voucher");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/apply-voucher")
    public ResponseEntity<?> applyVoucherToItem(@RequestBody Map<String, Object> request) {
        try {
            String voucherCode = request.get("voucherCode").toString();
            Long dishId = request.get("dishId") != null ? Long.valueOf(request.get("dishId").toString()) : null;
            Long comboId = request.get("comboId") != null ? Long.valueOf(request.get("comboId").toString()) : null;
            
            logger.info("Applying voucher: {} to dish: {} or combo: {}", voucherCode, dishId, comboId);
            
            Optional<DiscountResponseDTO> voucher = discountService.getValidVoucherForItem(voucherCode, dishId, comboId);
            
            if (voucher.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("voucher", voucher.get());
                response.put("message", "Voucher applied successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Voucher is not valid or expired");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("Error applying voucher", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to apply voucher");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/test-status-update")
    public ResponseEntity<?> testStatusUpdate() {
        try {
            logger.info("🧪 Testing status update endpoint");
            
            // Gọi method updateDiscountStatuses để test
            discountService.updateDiscountStatuses();
            
            // Lấy tất cả discounts để xem status
            List<DiscountResponseDTO> allDiscounts = discountService.getAllDiscounts();
            
            // Đếm theo status
            Map<String, Long> statusCount = allDiscounts.stream()
                .collect(Collectors.groupingBy(
                    discount -> discount.getStatus().toString(),
                    Collectors.counting()
                ));
            
            logger.info("✅ Status update completed. Status counts: {}", statusCount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Status update completed successfully",
                "statusCounts", statusCount,
                "totalDiscounts", allDiscounts.size(),
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error in test status update endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Test endpoint để đồng bộ discount_id
    @GetMapping("/test-sync-discount-ids")
    public ResponseEntity<Map<String, Object>> testSyncDiscountIds() {
        try {
            logger.info("🔄 Testing sync discount IDs...");
            
            // Đồng bộ tất cả discount_id
            discountService.syncAllDiscountIds();
            
            // Lấy thống kê sau khi đồng bộ
            List<DiscountResponseDTO> allDiscounts = discountService.getAllDiscounts();
            Map<String, Long> statusCount = allDiscounts.stream()
                .collect(Collectors.groupingBy(
                    discount -> discount.getStatus().toString(),
                    Collectors.counting()
                ));
            
            logger.info("✅ Sync discount IDs completed. Status counts: {}", statusCount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Sync discount IDs completed successfully",
                "statusCounts", statusCount,
                "totalDiscounts", allDiscounts.size(),
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error syncing discount IDs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to sync discount IDs: " + e.getMessage()));
        }
    }

    // Test endpoint để đồng bộ discount_id cho combos
    @GetMapping("/test-sync-combo-discount-ids")
    public ResponseEntity<Map<String, Object>> testSyncComboDiscountIds() {
        try {
            logger.info("🔄 Testing sync combo discount IDs...");
            
            // Đồng bộ tất cả discount_id cho combos
            discountService.syncComboDiscountIds();
            
            // Lấy thống kê sau khi đồng bộ
            List<DiscountResponseDTO> allDiscounts = discountService.getAllDiscounts();
            Map<String, Long> statusCount = allDiscounts.stream()
                .collect(Collectors.groupingBy(
                    discount -> discount.getStatus().toString(),
                    Collectors.counting()
                ));
            
            logger.info("✅ Sync combo discount IDs completed. Status counts: {}", statusCount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Sync combo discount IDs completed successfully",
                "statusCounts", statusCount,
                "totalDiscounts", allDiscounts.size(),
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error syncing combo discount IDs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to sync combo discount IDs: " + e.getMessage()));
        }
    }

    // Test endpoint để kiểm tra việc tạo discount với dish_id và combo_id
    @PostMapping("/test/create-with-targets")
    public ResponseEntity<Map<String, Object>> testCreateDiscountWithTargets(
            @RequestParam(required = false) Long dishId,
            @RequestParam(required = false) Long comboId,
            @RequestParam String name,
            @RequestParam Double newPrice) {
        try {
            logger.info("🔄 Testing create discount with targets - dishId: {}, comboId: {}, name: {}", 
                dishId, comboId, name);
            
            // Tạo discount request
            DiscountRequestDTO request = new DiscountRequestDTO();
            request.setCode("TEST_" + System.currentTimeMillis());
            request.setName(name);
            request.setNewPrice(BigDecimal.valueOf(newPrice));
            request.setStartDate(LocalDateTime.now().plusMinutes(1)); // Bắt đầu sau 1 phút
            request.setEndDate(LocalDateTime.now().plusDays(1)); // Kết thúc sau 1 ngày
            request.setDescription("Test discount với target items");
            request.setDishId(dishId);
            request.setComboId(comboId);
            
            // Tạo discount
            DiscountResponseDTO createdDiscount = discountService.createDiscount(request);
            
            logger.info("✅ Created discount with targets: {}", createdDiscount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Discount created successfully with targets",
                "discount", createdDiscount,
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error creating discount with targets: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create discount: " + e.getMessage()));
        }
    }

    // Test endpoint để tạo discount trực tiếp với dishId
    @PostMapping("/test/create-direct")
    public ResponseEntity<Map<String, Object>> testCreateDiscountDirect(
            @RequestParam Long dishId,
            @RequestParam String name,
            @RequestParam Double newPrice) {
        try {
            logger.info("🔄 Testing direct discount creation - dishId: {}, name: {}", dishId, name);
            
            // Tạo discount request
            DiscountRequestDTO request = new DiscountRequestDTO();
            request.setCode("DIRECT_TEST_" + System.currentTimeMillis());
            request.setName(name);
            request.setNewPrice(BigDecimal.valueOf(newPrice));
            request.setStartDate(LocalDateTime.now().plusMinutes(1));
            request.setEndDate(LocalDateTime.now().plusDays(1));
            request.setDescription("Test discount tạo trực tiếp");
            request.setDishId(dishId);
            request.setComboId(null);
            
            // Tạo discount
            DiscountResponseDTO createdDiscount = discountService.createDiscount(request);
            
            logger.info("✅ Created discount directly: {}", createdDiscount);
            
            return ResponseEntity.ok(Map.of(
                "message", "Discount created directly with dishId",
                "discount", createdDiscount,
                "dishId", dishId,
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error creating discount directly: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create discount: " + e.getMessage()));
        }
    }

    // Test endpoint để kiểm tra ID-based matching
    @PostMapping("/test/id-based-matching")
    public ResponseEntity<Map<String, Object>> testIdBasedMatching(
            @RequestParam Long dishId,
            @RequestParam String name,
            @RequestParam Double newPrice) {
        try {
            logger.info("🔄 Testing ID-based matching - dishId: {}, name: {}", dishId, name);
            
            // Tạo discount request với dishId
            DiscountRequestDTO request = new DiscountRequestDTO();
            request.setCode("ID_TEST_" + System.currentTimeMillis());
            request.setName(name);
            request.setNewPrice(BigDecimal.valueOf(newPrice));
            request.setStartDate(LocalDateTime.now().plusMinutes(1));
            request.setEndDate(LocalDateTime.now().plusDays(1));
            request.setDescription("Test ID-based matching");
            request.setDishId(dishId);
            request.setComboId(null);
            
            // Tạo discount
            DiscountResponseDTO createdDiscount = discountService.createDiscount(request);
            
            // Kiểm tra xem discount có được áp dụng cho dish không
            // (Có thể cần gọi syncAllDiscountIds() để trigger logic)
            discountService.syncAllDiscountIds();
            
            logger.info("✅ Created discount with ID-based matching: {}", createdDiscount);
            
            return ResponseEntity.ok(Map.of(
                "message", "ID-based matching test completed",
                "discount", createdDiscount,
                "dishId", dishId,
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error testing ID-based matching: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to test ID-based matching: " + e.getMessage()));
        }
    }

    // Test endpoint để tự động áp dụng discount ACTIVE cho items
    @GetMapping("/test-auto-apply-active-discounts")
    public ResponseEntity<Map<String, Object>> testAutoApplyActiveDiscounts() {
        try {
            logger.info("🔄 Testing auto-apply active discounts...");
            
            // Lấy tất cả discount ACTIVE
            List<DiscountResponseDTO> activeDiscounts = discountService.getAllDiscounts().stream()
                .filter(discount -> discount.getStatus().toString().equals("ACTIVE"))
                .collect(Collectors.toList());
            
            // Áp dụng tất cả discount ACTIVE cho items phù hợp
            discountService.syncAllDiscountIds(); // Sử dụng method có sẵn
            int totalApplied = activeDiscounts.size();
            
            // Lấy thống kê sau khi áp dụng
            List<DiscountResponseDTO> allDiscounts = discountService.getAllDiscounts();
            Map<String, Long> statusCount = allDiscounts.stream()
                .collect(Collectors.groupingBy(
                    discount -> discount.getStatus().toString(),
                    Collectors.counting()
                ));
            
            logger.info("✅ Auto-apply active discounts completed. Applied to {} discounts", totalApplied);
            
            return ResponseEntity.ok(Map.of(
                "message", "Auto-apply active discounts completed successfully",
                "activeDiscountsCount", activeDiscounts.size(),
                "totalApplied", totalApplied,
                "statusCounts", statusCount,
                "totalDiscounts", allDiscounts.size(),
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error auto-applying active discounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to auto-apply active discounts: " + e.getMessage()));
        }
    }
}