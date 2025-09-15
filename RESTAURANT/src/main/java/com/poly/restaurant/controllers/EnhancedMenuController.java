package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.services.EnhancedMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/client/menu/v2")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EnhancedMenuController {

    private final EnhancedMenuService enhancedMenuService;

    /**
     * GET /api/client/menu/v2/branches
     * Lấy danh sách chi nhánh active với caching
     */
    @GetMapping("/branches")
    public ResponseEntity<List<ClientBranchDTO>> getActiveBranches() {
        log.info("Enhanced: Getting active branches with caching");

        try {
            List<ClientBranchDTO> branches = enhancedMenuService.getActiveBranches();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(branches);
        } catch (Exception e) {
            log.error("Error fetching active branches", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/v2/categories
     * Lấy danh sách category với counts và caching
     */
    @GetMapping("/categories")
    public ResponseEntity<List<ClientCategoryWithCountsDTO>> getBranchScopedCategories(
            @RequestParam Long branchId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "true") Boolean includeCounts,
            @RequestParam(defaultValue = "false") Boolean showEmpty,
            @RequestParam(required = false) String search) {

        log.info("Enhanced: Getting branch-scoped categories - branch: {}, type: {}, includeCounts: {}, showEmpty: {}, search: {}",
                branchId, type, includeCounts, showEmpty, search);

        try {
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            if (type != null && !isValidType(type)) {
                log.warn("Invalid type parameter: {}", type);
                return ResponseEntity.badRequest().build();
            }

            List<ClientCategoryWithCountsDTO> categories = enhancedMenuService.getBranchScopedCategories(
                    branchId, type, includeCounts, showEmpty, search);

            log.info("Successfully fetched {} categories for branch: {}", categories.size(), branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(categories);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching branch-scoped categories for branch: {}", branchId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/v2/items
     * Lấy menu items với pagination và caching
     */
    @GetMapping("/items")
    public ResponseEntity<Page<ClientMenuItemDTO>> getMenuItems(
            @RequestParam Long branchId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "newest") String sort) {

        log.info("Enhanced: Getting menu items - branch: {}, category: {}, type: {}, search: {}, page: {}, pageSize: {}, sort: {}",
                branchId, categoryId, type, search, page, pageSize, sort);

        try {
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            if (type != null && !isValidType(type)) {
                log.warn("Invalid type parameter: {}", type);
                return ResponseEntity.badRequest().build();
            }

            if (!isValidSort(sort)) {
                log.warn("Invalid sort parameter: {}", sort);
                return ResponseEntity.badRequest().build();
            }

            Pageable pageable = createPageable(page, pageSize, sort);
            Page<ClientMenuItemDTO> items = enhancedMenuService.getMenuItems(
                    branchId, categoryId, type, search, pageable);

            log.info("Successfully fetched {} menu items for branch: {}", items.getTotalElements(), branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(items);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching menu items for branch: {}", branchId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/v2/featured
     * Lấy featured items với caching
     */
    @GetMapping("/featured")
    public ResponseEntity<List<ClientMenuItemDTO>> getFeaturedItems(@RequestParam Long branchId) {
        log.info("Enhanced: Getting featured items for branch: {}", branchId);

        try {
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            List<ClientMenuItemDTO> featuredItems = enhancedMenuService.getFeaturedItems(branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(featuredItems);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid branch ID: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching featured items", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/v2/filters
     * Lấy menu filters với caching
     */
    @GetMapping("/filters")
    public ResponseEntity<ClientMenuFilterDTO> getMenuFilters(@RequestParam Long branchId) {
        log.info("Enhanced: Getting menu filters for branch: {}", branchId);

        try {
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            ClientMenuFilterDTO filters = enhancedMenuService.getMenuFilters(branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(filters);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid branch ID: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching menu filters", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/v2/items/{id}
     * Lấy chi tiết menu item
     */
    @GetMapping("/items/{id}")
    public ResponseEntity<ClientMenuItemDTO> getMenuItem(
            @PathVariable Long id,
            @RequestParam String type) {

        log.info("Enhanced: Getting menu item: {} of type: {}", id, type);

        try {
            if (id == null || type == null) {
                log.warn("Invalid request: id or type is null");
                return ResponseEntity.badRequest().build();
            }

            if (!isValidType(type)) {
                log.warn("Invalid type parameter: {}", type);
                return ResponseEntity.badRequest().build();
            }

            ClientMenuItemDTO item = enhancedMenuService.getMenuItem(id, type);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(item);

        } catch (IllegalArgumentException e) {
            log.warn("Item not found or invalid: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching menu item", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/v2/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        log.info("Enhanced menu service health check");

        try {
            Map<String, String> response = new HashMap<>();
            response.put("status", "UP");
            response.put("service", "EnhancedMenuService");
            response.put("version", "v2");
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            log.error("Health check failed", e);
            Map<String, String> response = new HashMap<>();
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.status(503)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    private boolean isValidType(String type) {
        return "food".equals(type) || "combo".equals(type) || "all".equals(type);
    }

    private boolean isValidSort(String sort) {
        return "newest".equals(sort) || "price_asc".equals(sort) ||
                "price_desc".equals(sort) || "popular".equals(sort) || "name_asc".equals(sort);
    }

    private Pageable createPageable(int page, int pageSize, String sort) {
        // Giới hạn pageSize để tránh quá tải
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);

        Sort sortObj = createSort(sort);
        return PageRequest.of(page, safePageSize, sortObj);
    }

    private Sort createSort(String sort) {
        switch (sort) {
            case "price_asc":
                return Sort.by(Sort.Direction.ASC, "price");
            case "price_desc":
                return Sort.by(Sort.Direction.DESC, "price");
            case "popular":
                return Sort.by(Sort.Direction.DESC, "createdAt"); // Using createdAt as popularity proxy
            case "name_asc":
                return Sort.by(Sort.Direction.ASC, "name");
            case "newest":
            default:
                return Sort.by(Sort.Direction.DESC, "createdAt");
        }
    }
}






