package com.poly.restaurant.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.poly.restaurant.dtos.BranchRequestDTO;
import com.poly.restaurant.dtos.BranchResponseDTO;
import com.poly.restaurant.dtos.PagedResponseDTO;
import com.poly.restaurant.dtos.UpdateBranchStatusRequestDTO;
import com.poly.restaurant.services.BranchService;

import com.poly.restaurant.sse.ApprovalSseBroadcaster;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

	private final BranchService branchService;
    private final ApprovalSseBroadcaster sse;

	/**
	 * Lấy danh sách chi nhánh cho giao hàng (public endpoint).
	 * Không cần authentication.
	 */
	// @GetMapping("/for-delivery")
	// public ResponseEntity<List<BranchResponseDTO>> getBranchesForDelivery() {
	//	List<BranchResponseDTO> branches = branchService.getActiveBranches();
	//	return ResponseEntity.ok(branches);
	// }

	/**
	 * Lấy danh sách tất cả chi nhánh với phân trang và sắp xếp.
	 * Cho phép tất cả nhân viên đã đăng nhập truy cập.
	 */
	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
	public ResponseEntity<PagedResponseDTO<BranchResponseDTO>> getAllBranches(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "id") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir,
			@RequestParam(required = false) String name,
			@RequestParam(required = false) String status) {
		
		// Tạo Sort object với đảo ngược thứ tự
		Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);
		
		Page<BranchResponseDTO> branchPage = branchService.getAllBranchesWithPagination(pageable, name, status);
		PagedResponseDTO<BranchResponseDTO> response = PagedResponseDTO.fromPage(branchPage);
		return ResponseEntity.ok(response);
	}

	/**
	 * Lấy danh sách tất cả chi nhánh cho dashboard (không phân trang).
	 * Cho phép tất cả nhân viên đã đăng nhập truy cập.
	 */
	@GetMapping("/all")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
	public ResponseEntity<List<BranchResponseDTO>> getAllBranchesForDashboard() {
		List<BranchResponseDTO> branches = branchService.getAllBranches();
		return ResponseEntity.ok(branches);
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đang mở cửa (public API - không cần authentication).
	 */
	@GetMapping("/open")
	public ResponseEntity<List<BranchResponseDTO>> getOpenBranches() {
		List<BranchResponseDTO> openBranches = branchService.getOpenBranches();
		return ResponseEntity.ok(openBranches);
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đang bảo trì (public API - không cần authentication).
	 */
	@GetMapping("/maintenance")
	public ResponseEntity<List<BranchResponseDTO>> getMaintenanceBranches() {
		List<BranchResponseDTO> maintenanceBranches = branchService.getMaintenanceBranches();
		return ResponseEntity.ok(maintenanceBranches);
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đóng cửa vĩnh viễn (public API - không cần authentication).
	 */
	@GetMapping("/closed")
	public ResponseEntity<List<BranchResponseDTO>> getClosedBranches() {
		List<BranchResponseDTO> closedBranches = branchService.getClosedBranches();
		return ResponseEntity.ok(closedBranches);
	}

	/**
	 * Lấy danh sách tất cả chi nhánh dừng hoạt động (public API - không cần authentication).
	 */
	@GetMapping("/inactive")
	public ResponseEntity<List<BranchResponseDTO>> getInactiveBranches() {
		List<BranchResponseDTO> inactiveBranches = branchService.getInactiveBranches();
		return ResponseEntity.ok(inactiveBranches);
	}


	/**
	 * Lấy chi tiết một chi nhánh.
	 */
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
	public ResponseEntity<BranchResponseDTO> getBranchById(@PathVariable Long id) {
		BranchResponseDTO branch = branchService.getBranchById(id);
		return ResponseEntity.ok(branch);
	}

    /**
     * Tạo chi nhánh mới. Chỉ cho phép ADMIN.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<BranchResponseDTO> createBranch(@Valid @RequestBody BranchRequestDTO requestDTO) {
		BranchResponseDTO createdBranch = branchService.createBranch(requestDTO);
		return new ResponseEntity<>(createdBranch, HttpStatus.CREATED);
	}

    /**
     * Cập nhật thông tin chi nhánh. Chỉ cho phép ADMIN.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<BranchResponseDTO> updateBranch(@PathVariable Long id,
			@Valid @RequestBody BranchRequestDTO requestDTO) {
		BranchResponseDTO updatedBranch = branchService.updateBranch(id, requestDTO);
		return ResponseEntity.ok(updatedBranch);
	}

	/**
	 * Xóa một chi nhánh. Chỉ cho phép ADMIN.
	 */
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
		branchService.deleteBranch(id);
		return ResponseEntity.noContent().build();
	}

	
	/**
     * API để cập nhật riêng trạng thái của chi nhánh.
     * Chỉ cho phép ADMIN.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchResponseDTO> updateBranchStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBranchStatusRequestDTO request) {
        
        BranchResponseDTO updatedBranch = branchService.updateBranchStatus(id, request);
        return ResponseEntity.ok(updatedBranch);
    }

    /**
     * Cập nhật thông tin địa chỉ chi nhánh cho GHTK
     * PATCH /api/branches/{id}/location
     */
    @PatchMapping("/{id}/location")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchResponseDTO> updateBranchLocation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            BranchResponseDTO updatedBranch = branchService.updateBranchLocation(id, request);
            return ResponseEntity.ok(updatedBranch);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cập nhật thông tin địa chỉ chi nhánh cho GHTK (public endpoint for testing)
     * POST /api/branches/{id}/update-location
     */
    @PostMapping("/{id}/update-location")
    public ResponseEntity<Map<String, Object>> updateBranchLocationPublic(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            BranchResponseDTO updatedBranch = branchService.updateBranchLocation(id, request);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("message", "Branch location updated successfully");
            response.put("branch", updatedBranch);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error updating branch location: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }



    // SSE stream cho real-time menu thay đổi theo chi nhánh
    @GetMapping("/{branchId}/menu-events")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.SseEmitter> streamMenuEvents(@PathVariable Long branchId) {
        // Có thể mở rộng để phân tách theo branchId; tạm thời dùng một kênh chung
        return ResponseEntity.ok(sse.register());
    }
}