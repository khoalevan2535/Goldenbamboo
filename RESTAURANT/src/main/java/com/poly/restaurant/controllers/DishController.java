package com.poly.restaurant.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.poly.restaurant.dtos.DishRequestDTO;
import com.poly.restaurant.dtos.DishResponseDTO;
import com.poly.restaurant.dtos.DishUploadDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
// Bỏ approval system
import com.poly.restaurant.services.DishService;

import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/dishes")
@RequiredArgsConstructor
public class DishController {

    private final DishService dishService;

	@GetMapping("/{id}")
	public ResponseEntity<DishResponseDTO> getDishById(@PathVariable Long id) {
		DishResponseDTO dish = dishService.getDishById(id);
		return ResponseEntity.ok(dish);
	}

	@GetMapping("/branch/{branchId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
	public ResponseEntity<List<DishResponseDTO>> getDishesByBranch(@PathVariable Long branchId) {
		List<DishResponseDTO> dishes = dishService.getDishesByBranch(branchId);
		return ResponseEntity.ok(dishes);
	}

	@GetMapping
	public ResponseEntity<Page<DishResponseDTO>> searchDishes(
			@RequestParam(required = false) String name,
			@RequestParam(required = false) Long categoryId,
			@RequestParam(required = false) Long branchId,
			@RequestParam(required = false) String status,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@AuthenticationPrincipal AccountEntity loggedInUser) {

		// Nếu là manager, tự động filter theo branch của họ
		if (loggedInUser != null && loggedInUser.getRole() != null && 
		    "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
			Page<DishResponseDTO> dishes = dishService.searchDishesForManager(name, categoryId, status, loggedInUser, page, size);
			return ResponseEntity.ok(dishes);
		}
		
		// Admin có thể xem tất cả hoặc filter theo branchId
		Page<DishResponseDTO> dishes = dishService.searchDishes(name, categoryId, status, branchId, page, size);
		return ResponseEntity.ok(dishes);
	}

	/**
	 * Lấy danh sách tất cả món ăn đã được duyệt và đang hoạt động
	 * Dùng cho dropdown chọn món ăn trong tạo combo
	 */
	@GetMapping("/approved-active")
	public ResponseEntity<List<DishResponseDTO>> getApprovedActiveDishes() {
		List<DishResponseDTO> dishes = dishService.getApprovedActiveDishes();
		return ResponseEntity.ok(dishes);
	}

	@PostMapping(consumes = {"multipart/form-data"})
	@PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
	public ResponseEntity<DishResponseDTO> createDish(
	        @ModelAttribute DishUploadDTO dishUploadDTO,
	        @RequestParam(value = "image", required = false) MultipartFile image,
	        @RequestParam(value = "imageUrl", required = false) String imageUrl,
	        @AuthenticationPrincipal AccountEntity loggedInUser) {
	    // Convert DishUploadDTO to DishRequestDTO
	    DishRequestDTO dishRequestDTO = new DishRequestDTO();
	    dishRequestDTO.setName(dishUploadDTO.getName());
	    dishRequestDTO.setDescription(dishUploadDTO.getDescription());
	    dishRequestDTO.setBasePrice(dishUploadDTO.getBasePrice());
	    dishRequestDTO.setCategoryId(dishUploadDTO.getCategoryId());
	    dishRequestDTO.setImage(imageUrl); // Set Cloudinary URL if provided
	    
	    DishResponseDTO createdDish = dishService.createDishWithImage(dishRequestDTO, image, loggedInUser);
	    return new ResponseEntity<>(createdDish, HttpStatus.CREATED);
	}

	@PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
	@PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
	public ResponseEntity<DishResponseDTO> updateDish(
	        @PathVariable Long id,
	        @ModelAttribute DishUploadDTO dishUploadDTO,
	        @RequestParam(value = "image", required = false) MultipartFile image,
	        @RequestParam(value = "imageUrl", required = false) String imageUrl,
	        @AuthenticationPrincipal AccountEntity loggedInUser) {
	    // Convert DishUploadDTO to DishRequestDTO
	    DishRequestDTO dishRequestDTO = new DishRequestDTO();
	    dishRequestDTO.setName(dishUploadDTO.getName());
	    dishRequestDTO.setDescription(dishUploadDTO.getDescription());
	    dishRequestDTO.setBasePrice(dishUploadDTO.getBasePrice());
	    dishRequestDTO.setCategoryId(dishUploadDTO.getCategoryId());
	    dishRequestDTO.setImage(imageUrl); // Set Cloudinary URL if provided
	    
	    DishResponseDTO updatedDish = dishService.updateDishWithImage(id, dishRequestDTO, image, loggedInUser);
	    return ResponseEntity.ok(updatedDish);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
	public ResponseEntity<Void> deleteDish(@PathVariable Long id,
			@AuthenticationPrincipal AccountEntity loggedInUser) {
		dishService.deleteDish(id, loggedInUser);
		return ResponseEntity.noContent().build();
	}

    @GetMapping("/{id}/deletability")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> deletability(@PathVariable Long id) {
        return ResponseEntity.ok(dishService.getDeletability(id));
    }


    // Các API endpoint updateOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

    /**
     * Cập nhật thông tin giảm giá cho món ăn
     * PATCH /api/dishes/{id}/discount
     */
    @PatchMapping("/{id}/discount")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<DishResponseDTO> updateDishDiscount(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> discountData,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        try {
            DishResponseDTO updatedDish = dishService.updateDishDiscount(id, discountData, loggedInUser);
            return ResponseEntity.ok(updatedDish);
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Xóa giảm giá khỏi món ăn
     * PATCH /api/dishes/{id}/discount/remove
     */
    @PatchMapping("/{id}/discount/remove")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<DishResponseDTO> removeDishDiscount(
            @PathVariable Long id,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        try {
            DishResponseDTO updatedDish = dishService.removeDishDiscount(id, loggedInUser);
            return ResponseEntity.ok(updatedDish);
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Cập nhật trạng thái khả dụng của món ăn
     * PATCH /api/dishes/{id}/availability-status
     */
    @PatchMapping("/{id}/availability-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLE_MANAGER', 'STAFF')")
    public ResponseEntity<DishResponseDTO> updateAvailabilityStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        try {
            String statusStr = body.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().build();
            }
            
            ItemAvailabilityStatus status = ItemAvailabilityStatus.valueOf(statusStr.toUpperCase());
            DishResponseDTO updatedDish = dishService.updateDishAvailabilityStatus(id, status);
            return ResponseEntity.ok(updatedDish);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Lấy danh sách món ăn cho Staff (không bao gồm DISCONTINUED)
     * GET /api/dishes/staff
     */
    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<Page<DishResponseDTO>> getDishesForStaff(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal AccountEntity loggedInUser) {
        
        // Nếu là manager hoặc staff, tự động filter theo branch của họ
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            ("ROLE_MANAGER".equals(loggedInUser.getRole().getName()) || 
             "ROLE_STAFF".equals(loggedInUser.getRole().getName()))) {
            Page<DishResponseDTO> dishes = dishService.searchDishesForStaffManager(name, status, categoryId, loggedInUser, page, size);
            return ResponseEntity.ok(dishes);
        }
        
        // Admin có thể xem tất cả hoặc filter theo branchId
        Page<DishResponseDTO> dishes = dishService.searchDishesForStaff(name, status, branchId, categoryId, page, size);
        return ResponseEntity.ok(dishes);
    }
}