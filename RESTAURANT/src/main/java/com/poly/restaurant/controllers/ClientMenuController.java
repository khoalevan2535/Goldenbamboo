package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.services.ClientMenuService;
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
@RequestMapping("/api/client/menu")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ClientMenuController {

    private final ClientMenuService clientMenuService;

    /**
     * GET /api/client/menu/branches
     * Lấy danh sách chi nhánh active
     */
    @GetMapping("/branches")
    public ResponseEntity<List<ClientBranchDTO>> getActiveBranches() {
        log.info("Client requesting active branches");

        try {
            List<ClientBranchDTO> branches = clientMenuService.getActiveBranches();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(branches);
        } catch (Exception e) {
            log.error("Error fetching active branches", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/categories/all
     * Lấy danh sách category active (deprecated endpoint)
     * 
     * @deprecated Use /api/client/menu/categories?branch_id=X instead for
     *             branch-scoped categories
     */
    @GetMapping("/categories/all")
    public ResponseEntity<List<ClientCategoryDTO>> getActiveCategories() {
        log.info("Client requesting active categories (deprecated - should use branch_id parameter)");

        try {
            List<ClientCategoryDTO> categories = clientMenuService.getActiveCategories();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(categories);
        } catch (Exception e) {
            log.error("Error fetching active categories", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/categories
     * Lấy danh sách category active theo branch với counts
     */
    @GetMapping(value = "/categories", params = { "branch_id" })
    public ResponseEntity<List<ClientCategoryWithCountsDTO>> getBranchScopedCategories(
            @RequestParam Long branchId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "false") Boolean includeCounts,
            @RequestParam(defaultValue = "false") Boolean showEmpty,
            @RequestParam(required = false) String search) {

        log.info(
                "Client requesting branch-scoped categories - branch: {}, type: {}, includeCounts: {}, showEmpty: {}, search: {}",
                branchId, type, includeCounts, showEmpty, search);

        try {
            // Validate required parameters
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(List.of());
            }

            // Validate type parameter
            if (type != null && !isValidType(type)) {
                log.warn("Invalid type parameter: {}", type);
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(List.of());
            }

            List<ClientCategoryWithCountsDTO> categories = clientMenuService.getBranchScopedCategories(
                    branchId, type, includeCounts, showEmpty, search);

            log.info("Successfully fetched {} categories for branch: {}", categories.size(), branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(categories);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of());
        } catch (Exception e) {
            log.error("Error fetching branch-scoped categories for branch: {}, error: {}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of());
        }
    }

    /**
     * GET /api/client/menu/items
     * Lấy menu items theo branch và filter
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

        log.info(
                "Client requesting menu items - branch: {}, category: {}, type: {}, search: {}, page: {}, pageSize: {}, sort: {}",
                branchId, categoryId, type, search, page, pageSize, sort);

        // Declare pageable outside try block so it's accessible in catch block
        Pageable pageable = null;

        try {
            // Validate required parameters
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            // Validate type parameter
            if (type != null && !isValidType(type)) {
                log.warn("Invalid type parameter: {}", type);
                return ResponseEntity.badRequest().build();
            }

            // Validate sort parameter
            if (!isValidSort(sort)) {
                log.warn("Invalid sort parameter: {}", sort);
                return ResponseEntity.badRequest().build();
            }

            // Create pageable with sorting
            pageable = createPageable(page, pageSize, sort);

            Page<ClientMenuItemDTO> items = clientMenuService.getMenuItems(
                    branchId, categoryId, type, search, pageable);

            log.info("Successfully fetched {} menu items for branch: {}", items.getTotalElements(), branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(items);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching menu items for branch: {}, error: {}", branchId, e.getMessage(), e);
            // Return a more detailed error response
            return ResponseEntity.status(500)
                    .body(Page.empty(pageable != null ? pageable : PageRequest.of(0, 20)));
        }
    }

    /**
     * GET /api/client/menu/dishes
     * Alias cho /items endpoint để tương thích với frontend
     */
    @GetMapping("/dishes")
    public ResponseEntity<Page<ClientMenuItemDTO>> getDishes(
            @RequestParam Long branchId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "newest") String sort) {

        log.info("Client requesting dishes - branch: {}, category: {}, search: {}, page: {}, pageSize: {}, sort: {}",
                branchId, categoryId, search, page, pageSize, sort);

        // Declare pageable outside try block so it's accessible in catch block
        Pageable pageable = null;

        try {
            // Validate required parameters
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            // Validate sort parameter
            if (!isValidSort(sort)) {
                log.warn("Invalid sort parameter: {}", sort);
                return ResponseEntity.badRequest().build();
            }

            // Create pageable with sorting
            pageable = createPageable(page, pageSize, sort);

            // Use the dedicated getDishes method
            Page<ClientMenuItemDTO> dishes = clientMenuService.getDishes(
                    branchId, categoryId, search, pageable);

            log.info("Successfully fetched {} dishes for branch: {}", dishes.getTotalElements(), branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(dishes);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching dishes for branch: {}, error: {}", branchId, e.getMessage(), e);
            // Return a more detailed error response
            return ResponseEntity.status(500)
                    .body(Page.empty(pageable != null ? pageable : PageRequest.of(0, 20)));
        }
    }

    /**
     * GET /api/client/menu/combos
     * Lấy combos theo branch và filter
     */
    @GetMapping("/combos")
    public ResponseEntity<Page<ClientMenuItemDTO>> getCombos(
            @RequestParam Long branchId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "newest") String sort) {

        log.info("Client requesting combos - branch: {}, category: {}, search: {}, page: {}, pageSize: {}, sort: {}",
                branchId, categoryId, search, page, pageSize, sort);

        // Declare pageable outside try block so it's accessible in catch block
        Pageable pageable = null;

        try {
            // Validate required parameters
            if (branchId == null) {
                log.warn("Invalid request: branchId is null");
                return ResponseEntity.badRequest().build();
            }

            // Validate sort parameter
            if (!isValidSort(sort)) {
                log.warn("Invalid sort parameter: {}", sort);
                return ResponseEntity.badRequest().build();
            }

            // Create pageable with sorting
            pageable = createPageable(page, pageSize, sort);

            // Use the dedicated getCombos method
            Page<ClientMenuItemDTO> combos = clientMenuService.getCombos(
                    branchId, categoryId, search, pageable);

            log.info("Successfully fetched {} combos for branch: {}", combos.getTotalElements(), branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(combos);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching combos for branch: {}, error: {}", branchId, e.getMessage(), e);
            // Return a more detailed error response
            return ResponseEntity.status(500)
                    .body(Page.empty(pageable != null ? pageable : PageRequest.of(0, 20)));
        }
    }

    /**
     * GET /api/client/menu/filters
     * Lấy filter snapshot cho branch
     */
    @GetMapping("/filters")
    public ResponseEntity<ClientMenuFilterDTO> getMenuFilters(@RequestParam Long branchId) {
        log.info("Client requesting menu filters for branch: {}", branchId);

        if (branchId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ClientMenuFilterDTO filters = clientMenuService.getMenuFilters(branchId);
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
     * GET /api/client/menu/items/{id}
     * Lấy chi tiết một item
     */
    @GetMapping("/items/{id}")
    public ResponseEntity<ClientMenuItemDTO> getMenuItem(
            @PathVariable Long id,
            @RequestParam String type) {

        log.info("Client requesting menu item: {} of type: {}", id, type);

        if (id == null || type == null) {
            return ResponseEntity.badRequest().build();
        }

        if (!isValidType(type)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ClientMenuItemDTO item = clientMenuService.getMenuItem(id, type);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(item);
        } catch (IllegalArgumentException e) {
            log.warn("Item not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching menu item", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/featured
     * Lấy featured items
     */
    @GetMapping("/featured")
    public ResponseEntity<List<ClientMenuItemDTO>> getFeaturedItems(@RequestParam Long branchId) {
        log.info("Client requesting featured items for branch: {}", branchId);

        if (branchId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            List<ClientMenuItemDTO> featuredItems = clientMenuService.getFeaturedItems(branchId);
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
     * GET /api/client/menu/order-items
     * Lấy tất cả items (dishes + combos) cho order page
     */
    @GetMapping("/order-items")
    public ResponseEntity<Map<String, Object>> getOrderItems(@RequestParam Long branchId) {
        log.info("Client requesting order items for branch: {}", branchId);

        if (branchId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Lấy dishes
            Page<ClientMenuItemDTO> dishes = clientMenuService.getDishes(
                    branchId, null, null, PageRequest.of(0, 1000));
            
            // Lấy combos
            Page<ClientMenuItemDTO> combos = clientMenuService.getCombos(
                    branchId, null, null, PageRequest.of(0, 1000));

            Map<String, Object> response = new HashMap<>();
            response.put("dishes", dishes.getContent());
            response.put("combos", combos.getContent());
            response.put("dishes_count", dishes.getTotalElements());
            response.put("combos_count", combos.getTotalElements());

            log.info("Successfully fetched {} dishes and {} combos for branch: {}", 
                    dishes.getTotalElements(), combos.getTotalElements(), branchId);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid branch ID: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching order items for branch: {}", branchId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/menu/debug
     * Debug endpoint to check data availability
     */
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugMenuData() {
        log.info("Debug endpoint called to check menu data");

        try {
            Map<String, Object> debugInfo = new HashMap<>();

            // Check branches
            List<ClientBranchDTO> branches = clientMenuService.getActiveBranches();
            debugInfo.put("branches_count", branches.size());
            debugInfo.put("branches", branches);

            // Check categories
            List<ClientCategoryDTO> categories = clientMenuService.getActiveCategories();
            debugInfo.put("categories_count", categories.size());
            debugInfo.put("categories", categories);

            // Check dishes (using branch 1 as default)
            try {
                Page<ClientMenuItemDTO> dishes = clientMenuService.getDishes(1L, null, null, PageRequest.of(0, 10));
                debugInfo.put("dishes_count", dishes.getTotalElements());
                debugInfo.put("dishes_sample", dishes.getContent());
            } catch (Exception e) {
                debugInfo.put("dishes_error", e.getMessage());
            }

            // Check combos (using branch 1 as default)
            try {
                Page<ClientMenuItemDTO> combos = clientMenuService.getCombos(1L, null, null, PageRequest.of(0, 10));
                debugInfo.put("combos_count", combos.getTotalElements());
                debugInfo.put("combos_sample", combos.getContent());
            } catch (Exception e) {
                debugInfo.put("combos_error", e.getMessage());
            }

            debugInfo.put("timestamp", java.time.LocalDateTime.now().toString());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(debugInfo);

        } catch (Exception e) {
            log.error("Error in debug endpoint", e);
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("error", e.getMessage());
            errorInfo.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorInfo);
        }
    }

    /**
     * GET /api/client/menu/health
     * Health check endpoint to test database connectivity
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        log.info("Health check requested");

        try {
            // Test database connectivity by trying to fetch a simple count
            List<ClientBranchDTO> branches = clientMenuService.getActiveBranches();
            Map<String, String> response = new HashMap<>();
            response.put("status", "UP");
            response.put("database", "CONNECTED");
            response.put("branches_count", String.valueOf(branches.size()));
            response.put("timestamp", java.time.LocalDateTime.now().toString());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            log.error("Health check failed", e);
            Map<String, String> response = new HashMap<>();
            response.put("status", "DOWN");
            response.put("database", "DISCONNECTED");
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
                "price_desc".equals(sort) || "popular".equals(sort);
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
                return Sort.by(Sort.Direction.DESC, "popularity");
            case "newest":
            default:
                return Sort.by(Sort.Direction.DESC, "createdAt");
        }
    }
}
