package com.poly.restaurant.controllers;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.poly.restaurant.dtos.ComboRequestDTO;
import com.poly.restaurant.dtos.ComboResponseDTO;
import com.poly.restaurant.dtos.UpdateComboStatusRequestDTO; // Thay đổi DTO cho phù hợp
import com.poly.restaurant.entities.AccountEntity;
// Bỏ ApprovalStatus
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
// Bỏ approval system
import com.poly.restaurant.services.ComboService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/combos") // Đường dẫn gốc cho các API của Combo
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<ComboResponseDTO>> getCombosByBranch(@PathVariable Long branchId) {
        List<ComboResponseDTO> combos = comboService.getCombosByBranch(branchId);
        return ResponseEntity.ok(combos);
    }

    /**
     * Tìm kiếm và phân trang danh sách combo.
     * GET /api/combos
     *
     * @param name   Tên combo để tìm kiếm (tùy chọn).
     * @param status Trạng thái combo để lọc (tùy chọn).
     * @param page   Số trang (mặc định là 0).
     * @param size   Kích thước trang (mặc định là 10).
     * @return ResponseEntity chứa một trang (Page) các ComboResponseDTO.
     */
    @GetMapping
    public ResponseEntity<Page<ComboResponseDTO>> searchCombos(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal AccountEntity loggedInUser) { // Cân nhắc tăng size mặc định nếu cần
        
        // Nếu là manager, tự động filter theo branch của họ
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
            Page<ComboResponseDTO> combos = comboService.searchCombosForManager(name, status, loggedInUser, page, size);
            return ResponseEntity.ok(combos);
        }
        
        // Admin có thể xem tất cả hoặc filter theo branchId
        Page<ComboResponseDTO> combos = comboService.searchCombos(name, status, branchId, page, size);
        return ResponseEntity.ok(combos);
    }

    /**
     * Lấy thông tin một combo theo ID.
     * GET /api/combos/{id}
     *
     * @param id ID của combo cần lấy.
     * @return ResponseEntity chứa ComboResponseDTO và HttpStatus.OK nếu tìm thấy.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ComboResponseDTO> getComboById(@PathVariable Long id) {
        ComboResponseDTO combo = comboService.getComboById(id);
        return ResponseEntity.ok(combo);
    }

    /**
     * Tạo một combo mới.
     * POST /api/combos
     *
     * @param comboRequestDTO DTO chứa thông tin combo cần tạo.
     * @return ResponseEntity chứa ComboResponseDTO của combo đã tạo và
     *         HttpStatus.CREATED.
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ComboResponseDTO> createCombo(
            @Valid @RequestPart("combo") ComboRequestDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal AccountEntity loggedInUser) {

        ComboResponseDTO createdCombo = comboService.createComboWithImage(request, image, loggedInUser);
        return new ResponseEntity<>(createdCombo, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ComboResponseDTO> updateCombo(
            @PathVariable Long id,
            @Valid @RequestPart("combo") ComboRequestDTO comboRequestDTO,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal AccountEntity loggedInUser) {

        ComboResponseDTO updatedCombo = comboService.updateComboWithImage(id, comboRequestDTO, image, loggedInUser);
        return ResponseEntity.ok(updatedCombo);
    }

    /**
     * Xóa một combo theo ID.
     * DELETE /api/combos/{id}
     *
     * @param id ID của combo cần xóa.
     * @return ResponseEntity với HttpStatus.NO_CONTENT.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        comboService.deleteCombo(id, loggedInUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/deletability")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<java.util.Map<String,Object>> deletability(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.getDeletability(id));
    }

    // Các API endpoint updateOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

    /**
     * Cập nhật trạng thái availability của combo (Staff có thể sử dụng)
     * PATCH /api/combos/{id}/availability-status
     */
    @PatchMapping("/{id}/availability-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ComboResponseDTO> updateComboAvailabilityStatus(
            @PathVariable Long id,
            @RequestBody UpdateComboStatusRequestDTO request,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        
        ItemAvailabilityStatus statusEnum;
        try {
            statusEnum = ItemAvailabilityStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        
        ComboResponseDTO updatedCombo = comboService.updateAvailabilityStatus(id, statusEnum);
        return ResponseEntity.ok(updatedCombo);
    }

    /**
     * Reset combo về trạng thái tự động (dựa trên món ăn)
     * PATCH /api/combos/{id}/reset-availability
     */
    @PatchMapping("/{id}/reset-availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ComboResponseDTO> resetComboToAutomatic(@PathVariable Long id) {
        ComboResponseDTO updatedCombo = comboService.resetComboToAutomatic(id);
        return ResponseEntity.ok(updatedCombo);
    }

    /**
     * Lấy danh sách combo cho Staff (không bao gồm DISCONTINUED)
     * GET /api/combos/staff
     */
    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<Page<ComboResponseDTO>> getCombosForStaff(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        
        // Nếu là manager hoặc staff, tự động filter theo branch của họ
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            ("ROLE_MANAGER".equals(loggedInUser.getRole().getName()) || 
             "ROLE_STAFF".equals(loggedInUser.getRole().getName()))) {
            Page<ComboResponseDTO> combos = comboService.searchCombosForStaffManager(name, status, loggedInUser, page, size);
            return ResponseEntity.ok(combos);
        }
        
        // Admin có thể xem tất cả hoặc filter theo branchId
        Page<ComboResponseDTO> combos = comboService.searchCombosForStaff(name, status, branchId, page, size);
        return ResponseEntity.ok(combos);
    }

    /**
     * Debug endpoint để kiểm tra trạng thái thực tế của combo
     * GET /api/combos/debug/{id}
     */
    @GetMapping("/debug/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<java.util.Map<String, Object>> debugComboStatus(@PathVariable Long id) {
        ComboResponseDTO combo = comboService.getComboById(id);
        java.util.Map<String, Object> debugInfo = new java.util.HashMap<>();
        debugInfo.put("id", combo.getId());
        debugInfo.put("name", combo.getName());
        // operationalStatus đã bị xóa
        debugInfo.put("availabilityStatus", combo.getAvailabilityStatus());
        debugInfo.put("branchId", combo.getBranchId());
        debugInfo.put("branchName", combo.getBranchName());
        return ResponseEntity.ok(debugInfo);
    }
}