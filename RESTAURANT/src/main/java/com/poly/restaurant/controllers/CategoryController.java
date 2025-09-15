package com.poly.restaurant.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.poly.restaurant.dtos.CategoryRequestDTO;
import com.poly.restaurant.dtos.CategoryResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.CategoryEntity;
import com.poly.restaurant.entities.enums.CategoryStatus;
import com.poly.restaurant.services.CategoryService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> searchCategories(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        
        // Nếu là manager, tự động filter theo branch của họ
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
            Page<CategoryResponseDTO> categories = categoryService.searchCategoriesForManager(name, status, loggedInUser, page, size);
            return ResponseEntity.ok(categories);
        }
        
        // Admin có thể xem tất cả hoặc filter theo branchId
        Page<CategoryResponseDTO> categories = categoryService.searchCategories(name, status, branchId, page, size);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        CategoryResponseDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<CategoryResponseDTO> createCategory(
        @RequestBody @Valid CategoryRequestDTO requestDTO,
        @AuthenticationPrincipal AccountEntity loggedInUser) {
        CategoryResponseDTO createdCategory = categoryService.createCategory(requestDTO, loggedInUser);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Long id, 
                                                              @RequestBody @Valid CategoryRequestDTO requestDTO,
                                                              @AuthenticationPrincipal AccountEntity loggedInUser) {
        CategoryResponseDTO updatedCategory = categoryService.updateCategory(id, requestDTO, loggedInUser);
        return ResponseEntity.ok(updatedCategory);
    }

    // Các endpoint updateCategoryStatus và updateOperational đã bị xóa vì operationalStatus không còn tồn tại

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id,
                                               @AuthenticationPrincipal AccountEntity loggedInUser) {
        categoryService.deleteCategory(id, loggedInUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/deletability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCategoryDeletability(@PathVariable Long id) {
        Map<String, Object> result = categoryService.getDeletability(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/debug")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> debugCategories(@AuthenticationPrincipal AccountEntity loggedInUser) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            // Get all categories without filtering
            List<CategoryEntity> allCategories = categoryService.getAllCategoriesForDebug();
            debugInfo.put("totalCategories", allCategories.size());
            debugInfo.put("categories", allCategories.stream().map(cat -> {
                Map<String, Object> catInfo = new HashMap<>();
                catInfo.put("id", cat.getId());
                catInfo.put("name", cat.getName());
                catInfo.put("status", cat.getStatus());
                catInfo.put("branchId", cat.getBranch() != null ? cat.getBranch().getId() : null);
                return catInfo;
            }).collect(Collectors.toList()));
            
            // Get user info
            debugInfo.put("userRole", loggedInUser.getRole() != null ? loggedInUser.getRole().getName() : "UNKNOWN");
            debugInfo.put("userBranchId", loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null);
            
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(debugInfo);
    }

    /**
     * Cập nhật trạng thái category
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<CategoryResponseDTO> updateCategoryStatus(
            @PathVariable Long id,
            @RequestParam CategoryStatus status,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        
        CategoryResponseDTO updatedCategory = categoryService.updateCategoryStatus(id, status, loggedInUser);
        return ResponseEntity.ok(updatedCategory);
    }
}