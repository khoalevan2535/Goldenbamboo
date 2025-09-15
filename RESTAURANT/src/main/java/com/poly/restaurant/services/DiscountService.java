package com.poly.restaurant.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poly.restaurant.dtos.DiscountRequestDTO;
import com.poly.restaurant.dtos.DiscountResponseDTO;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.DiscountMapper;
import com.poly.restaurant.repositories.DiscountRepository;
import com.poly.restaurant.repositories.DishRepository;
import com.poly.restaurant.repositories.ComboRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountService {

	private static final Logger logger = LoggerFactory.getLogger(DiscountService.class);
	private final DiscountRepository discountRepository;
	private final DishRepository dishRepository;
	private final ComboRepository comboRepository;

	@Transactional
	public DiscountResponseDTO createDiscount(DiscountRequestDTO request) {
		logger.info("[CREATE DISCOUNT] code: {} | name: {} | newPrice: {} | dishId: {} | comboId: {}", 
			request.getCode(), request.getName(), request.getNewPrice(), request.getDishId(), request.getComboId());

		// Validate dates
		if (request.getEndDate().isBefore(request.getStartDate())) {
			throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
		}

		// Validate based on discount type
		if (request.getType() == null) {
			// Auto-detect type based on existing logic
			if (request.getDishId() != null || request.getComboId() != null) {
				request.setType(com.poly.restaurant.entities.enums.DiscountType.BRANCH_DISCOUNT);
			} else {
				request.setType(com.poly.restaurant.entities.enums.DiscountType.CUSTOMER_VOUCHER);
			}
		}
		
		// Validate code based on type
		if (request.getType() == com.poly.restaurant.entities.enums.DiscountType.CUSTOMER_VOUCHER) {
			// Voucher khách hàng - code bắt buộc
			if (request.getCode() == null || request.getCode().trim().isEmpty()) {
				throw new IllegalArgumentException("Mã voucher là bắt buộc cho voucher khách hàng");
			}
		} else if (request.getType() == com.poly.restaurant.entities.enums.DiscountType.BRANCH_DISCOUNT) {
			// Discount chi nhánh - code phải null
			request.setCode(null);
		}

		DiscountEntity discount = new DiscountEntity();
		discount.setCode(request.getCode());
		discount.setName(request.getName());
		discount.setNewPrice(request.getNewPrice());
		discount.setStartDate(request.getStartDate());
		discount.setEndDate(request.getEndDate());
		discount.setDescription(request.getDescription());
		
		// Set target items and type
		logger.info("🔍 Setting dishId: {} and comboId: {} and type: {}", request.getDishId(), request.getComboId(), request.getType());
		
		// Chỉ set dishId/comboId cho BRANCH_DISCOUNT, CUSTOMER_VOUCHER không cần
		if (request.getType() == com.poly.restaurant.entities.enums.DiscountType.BRANCH_DISCOUNT) {
			discount.setDishId(request.getDishId());
			discount.setComboId(request.getComboId());
		} else {
			// CUSTOMER_VOUCHER không cần dishId/comboId cụ thể
			discount.setDishId(null);
			discount.setComboId(null);
		}
		
		discount.setType(request.getType());
		logger.info("🔍 After setting - discount.dishId: {} and discount.comboId: {} and discount.type: {}", discount.getDishId(), discount.getComboId(), discount.getType());

		// Set initial status based on current time
		LocalDateTime now = LocalDateTime.now();
		if (request.getStartDate().isAfter(now)) {
			discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.SCHEDULED);
		} else if (request.getEndDate().isAfter(now)) {
			discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE);
		} else {
			discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED);
		}

		// Không cần xử lý branch nữa vì đã bỏ quan hệ

		DiscountEntity savedDiscount = discountRepository.save(discount);

		// Tự động cập nhật discount_id cho dish/combo nếu discount đang ACTIVE và là BRANCH_DISCOUNT
		if (savedDiscount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE && 
			savedDiscount.getType() == com.poly.restaurant.entities.enums.DiscountType.BRANCH_DISCOUNT) {
			applyActiveDiscountToItems(savedDiscount);
		}

		return DiscountMapper.toResponseDto(discountRepository.findById(savedDiscount.getId()).get());
	}

	@Transactional(readOnly = true)
	public List<DiscountResponseDTO> getAllDiscounts() {
		logger.info("🔄 Getting all discounts from database");
		try {
			List<DiscountEntity> entities = discountRepository.findAll();
			logger.info("📊 Found {} discount entities in database", entities.size());
			
			List<DiscountResponseDTO> result = entities.stream()
				.map(entity -> {
					try {
						logger.info("🔄 Mapping entity ID: {} - Name: {}", entity.getId(), entity.getName());
						return DiscountMapper.toResponseDto(entity);
					} catch (Exception e) {
						logger.error("❌ Error mapping entity ID {}: {}", entity.getId(), e.getMessage());
						return null;
					}
				})
				.filter(dto -> dto != null)
				.collect(Collectors.toList());
			
			logger.info("✅ Successfully mapped {} discount DTOs", result.size());
			return result;
		} catch (Exception e) {
			logger.error("❌ Error getting all discounts: {}", e.getMessage(), e);
			throw e;
		}
	}

	@Transactional(readOnly = true)
	public List<DiscountResponseDTO> getActiveDiscounts() {
		logger.info("🔄 Getting active discounts");
		try {
			// Lấy tất cả discounts đang hoạt động
			List<DiscountEntity> entities = discountRepository.findAll();
			logger.info("📊 Found {} discount entities", entities.size());
			
			List<DiscountResponseDTO> result = entities.stream()
				.map(entity -> {
					try {
						logger.info("🔄 Mapping entity ID: {} - Name: {}", 
							entity.getId(), entity.getName());
						return DiscountMapper.toResponseDto(entity);
					} catch (Exception e) {
						logger.error("❌ Error mapping entity ID {}: {}", entity.getId(), e.getMessage());
						return null;
					}
				})
				.filter(dto -> dto != null)
				.collect(Collectors.toList());
			
			logger.info("✅ Successfully mapped {} discount DTOs", result.size());
			return result;
		} catch (Exception e) {
			logger.error("❌ Error getting active discounts: {}", e.getMessage(), e);
			throw e;
		}
	}

	public DiscountResponseDTO getDiscountById(Long id) {
		try {
		// Lấy discount
		Optional<DiscountEntity> entityWithBranches = discountRepository.findById(id);
			if (!entityWithBranches.isPresent()) {
				throw new ResourceNotFoundException("Discount not found with id: " + id);
			}

			DiscountEntity entity = entityWithBranches.get();



			return DiscountMapper.toResponseDto(entity);
		} catch (Exception e) {
			logger.error("Error getting discount by id {}: {}", id, e.getMessage());
			throw new RuntimeException("Failed to get discount", e);
		}
	}

	@Transactional
	public DiscountResponseDTO updateDiscount(Long id, DiscountRequestDTO request) {
		DiscountEntity discount = discountRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Discount not found"));

		// Validate dates - cho phép endDate trước startDate trong trường hợp dừng discount
		// Chỉ validate nếu cả startDate và endDate đều ở tương lai (tạo discount mới)
		LocalDateTime now = LocalDateTime.now();
		if (request.getStartDate().isAfter(now) && request.getEndDate().isBefore(request.getStartDate())) {
			throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
		}

		discount.setName(request.getName());
		discount.setNewPrice(request.getNewPrice());
		discount.setStartDate(request.getStartDate());
		discount.setEndDate(request.getEndDate());
		discount.setDescription(request.getDescription());
		
		// Update target items - chỉ cho BRANCH_DISCOUNT
		if (request.getType() == com.poly.restaurant.entities.enums.DiscountType.BRANCH_DISCOUNT) {
			discount.setDishId(request.getDishId());
			discount.setComboId(request.getComboId());
		} else {
			// CUSTOMER_VOUCHER không cần dishId/comboId cụ thể
			discount.setDishId(null);
			discount.setComboId(null);
		}

		// Update status based on current time
		if (request.getStartDate().isAfter(now)) {
			discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.SCHEDULED);
		} else if (request.getEndDate().isAfter(now)) {
			discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE);
		} else {
			discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED);
		}

		// Có thể cập nhật branch, dish, combo nếu cần
		DiscountEntity saved = discountRepository.save(discount);
		
		// Tự động cập nhật discount_id cho dish/combo nếu discount đang ACTIVE
		if (saved.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE) {
			applyActiveDiscountToItems(saved);
		}
		
		return DiscountMapper.toResponseDto(saved);
	}

	@Transactional
	public void deleteDiscount(Long id) {
		if (!discountRepository.existsById(id)) {
			throw new ResourceNotFoundException("Discount not found");
		}
		discountRepository.deleteById(id);
	}


	// Method để đồng bộ tất cả discount_id trong bảng dishes/combos
	@Transactional
	public void syncAllDiscountIds() {
		logger.info("🔄 Starting sync of all discount_ids...");
		
		// Lấy tất cả discount đang hoạt động
		List<DiscountEntity> allDiscounts = discountRepository.findAll();
		List<DiscountEntity> activeDiscounts = allDiscounts.stream()
			.filter(discount -> discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE ||
								discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.SCHEDULED ||
								discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRING)
			.collect(Collectors.toList());
		
		// Lấy tất cả dishes và combos
		List<com.poly.restaurant.entities.DishEntity> allDishes = dishRepository.findAll();
		List<com.poly.restaurant.entities.ComboEntity> allCombos = comboRepository.findAll();
		
		// Cập nhật discount_id cho dishes dựa trên logic nghiệp vụ
		for (com.poly.restaurant.entities.DishEntity dish : allDishes) {
			// Tìm discount phù hợp nhất cho dish này
			Optional<DiscountEntity> bestDiscount = activeDiscounts.stream()
				.filter(discount -> isDiscountApplicableToDish(discount, dish))
				.sorted((d1, d2) -> {
					// Ưu tiên discount mới nhất
					return d2.getCreatedAt().compareTo(d1.getCreatedAt());
				})
				.findFirst();
			
			if (bestDiscount.isPresent()) {
				DiscountEntity discount = bestDiscount.get();
				if (dish.getDiscount() == null || !dish.getDiscount().getId().equals(discount.getId())) {
					dish.setDiscount(discount);
					dishRepository.save(dish);
					logger.info("✅ Synced discount_id {} to dish {}", discount.getId(), dish.getId());
				}
			} else {
				// Không có discount phù hợp, xóa discount_id cũ
				if (dish.getDiscount() != null) {
					dish.setDiscount(null);
					dishRepository.save(dish);
					logger.info("✅ Removed discount_id from dish {}", dish.getId());
				}
			}
		}
		
		// Cập nhật discount_id cho combos dựa trên logic nghiệp vụ
		for (com.poly.restaurant.entities.ComboEntity combo : allCombos) {
			// Tìm discount phù hợp nhất cho combo này
			Optional<DiscountEntity> bestDiscount = activeDiscounts.stream()
				.filter(discount -> isDiscountApplicableToCombo(discount, combo))
				.sorted((d1, d2) -> {
					// Ưu tiên discount mới nhất
					return d2.getCreatedAt().compareTo(d1.getCreatedAt());
				})
				.findFirst();
			
			if (bestDiscount.isPresent()) {
				DiscountEntity discount = bestDiscount.get();
				if (combo.getDiscount() == null || !combo.getDiscount().getId().equals(discount.getId())) {
					combo.setDiscount(discount);
					comboRepository.save(combo);
					logger.info("✅ Synced discount_id {} to combo {}", discount.getId(), combo.getId());
				}
			} else {
				// Không có discount phù hợp, xóa discount_id cũ
				if (combo.getDiscount() != null) {
					combo.setDiscount(null);
					comboRepository.save(combo);
					logger.info("✅ Removed discount_id from combo {}", combo.getId());
				}
			}
		}
		
		logger.info("✅ Completed sync of all discount_ids");
	}

	// Method riêng để đồng bộ discount_id cho combos
	@Transactional
	public void syncComboDiscountIds() {
		logger.info("🔄 Starting sync of combo discount_ids...");
		
		// Lấy tất cả discount đang hoạt động
		List<DiscountEntity> allDiscounts = discountRepository.findAll();
		List<DiscountEntity> activeDiscounts = allDiscounts.stream()
			.filter(discount -> discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE ||
								discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.SCHEDULED ||
								discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRING)
			.collect(Collectors.toList());
		
		// Lấy tất cả combos
		List<com.poly.restaurant.entities.ComboEntity> allCombos = comboRepository.findAll();
		
		// Cập nhật discount_id cho combos dựa trên logic nghiệp vụ
		for (com.poly.restaurant.entities.ComboEntity combo : allCombos) {
			// Tìm discount phù hợp nhất cho combo này
			Optional<DiscountEntity> bestDiscount = activeDiscounts.stream()
				.filter(discount -> isDiscountApplicableToCombo(discount, combo))
				.sorted((d1, d2) -> {
					// Ưu tiên discount mới nhất
					return d2.getCreatedAt().compareTo(d1.getCreatedAt());
				})
				.findFirst();
			
			if (bestDiscount.isPresent()) {
				DiscountEntity discount = bestDiscount.get();
				if (combo.getDiscount() == null || !combo.getDiscount().getId().equals(discount.getId())) {
					combo.setDiscount(discount);
					comboRepository.save(combo);
					logger.info("✅ Synced discount_id {} to combo {}", discount.getId(), combo.getId());
				}
			} else {
				// Không có discount phù hợp, xóa discount_id cũ
				if (combo.getDiscount() != null) {
					combo.setDiscount(null);
					comboRepository.save(combo);
					logger.info("✅ Removed discount_id from combo {}", combo.getId());
				}
			}
		}
		
		logger.info("✅ Completed sync of combo discount_ids");
	}

	// Method để tự động áp dụng discount ACTIVE cho items phù hợp
	private void applyActiveDiscountToItems(DiscountEntity discount) {
		try {
			logger.info("🎯 Auto-applying ACTIVE discount {} to matching items...", discount.getId());
			
			int appliedDishes = 0;
			int appliedCombos = 0;
			
			// Nếu discount có dishId cụ thể
			if (discount.getDishId() != null) {
				com.poly.restaurant.entities.DishEntity dish = dishRepository.findById(discount.getDishId()).orElse(null);
				if (dish != null) {
					// Xử lý logic thay thế discount cũ
					if (dish.getDiscount() != null) {
						handleOldDiscountReplacement(discount, dish.getDiscount(), "dish", dish.getId());
					}
					
					dish.setDiscount(discount);
					dishRepository.save(dish);
					appliedDishes++;
					logger.info("✅ Auto-applied discount {} to specific dish {} ({})", 
						discount.getId(), dish.getId(), dish.getName());
				}
			}
			
			// Nếu discount có comboId cụ thể
			if (discount.getComboId() != null) {
				com.poly.restaurant.entities.ComboEntity combo = comboRepository.findById(discount.getComboId()).orElse(null);
				if (combo != null) {
					// Xử lý logic thay thế discount cũ
					if (combo.getDiscount() != null) {
						handleOldDiscountReplacement(discount, combo.getDiscount(), "combo", combo.getId());
					}
					
					combo.setDiscount(discount);
					comboRepository.save(combo);
					appliedCombos++;
					logger.info("✅ Auto-applied discount {} to specific combo {} ({})", 
						discount.getId(), combo.getId(), combo.getName());
				}
			}
			
			// Nếu discount không có target cụ thể, áp dụng theo logic matching
			if (discount.getDishId() == null && discount.getComboId() == null) {
				// Tìm tất cả dishes phù hợp với discount này
				List<com.poly.restaurant.entities.DishEntity> matchingDishes = dishRepository.findAll().stream()
					.filter(dish -> isDiscountApplicableToDish(discount, dish))
					.collect(Collectors.toList());
				
				// Tìm tất cả combos phù hợp với discount này
				List<com.poly.restaurant.entities.ComboEntity> matchingCombos = comboRepository.findAll().stream()
					.filter(combo -> isDiscountApplicableToCombo(discount, combo))
					.collect(Collectors.toList());
				
				// Áp dụng discount cho dishes
				for (com.poly.restaurant.entities.DishEntity dish : matchingDishes) {
					// Chỉ áp dụng nếu dish chưa có discount hoặc discount cũ đã hết hạn
					if (dish.getDiscount() == null || 
						dish.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED ||
						dish.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.REPLACED) {
						
						dish.setDiscount(discount);
						dishRepository.save(dish);
						appliedDishes++;
						logger.info("✅ Auto-applied discount {} to dish {} ({})", 
							discount.getId(), dish.getId(), dish.getName());
					}
				}
				
				// Áp dụng discount cho combos
				for (com.poly.restaurant.entities.ComboEntity combo : matchingCombos) {
					// Chỉ áp dụng nếu combo chưa có discount hoặc discount cũ đã hết hạn
					if (combo.getDiscount() == null || 
						combo.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED ||
						combo.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.REPLACED) {
						
						combo.setDiscount(discount);
						comboRepository.save(combo);
						appliedCombos++;
						logger.info("✅ Auto-applied discount {} to combo {} ({})", 
							discount.getId(), combo.getId(), combo.getName());
					}
				}
			}
			
			logger.info("🎯 Auto-applied discount {} to {} dishes and {} combos", 
				discount.getId(), appliedDishes, appliedCombos);
				
		} catch (Exception e) {
			logger.error("❌ Error auto-applying discount {} to items: {}", discount.getId(), e.getMessage());
		}
	}
	
	// Helper method để kiểm tra discount có áp dụng được cho dish không
	private boolean isDiscountApplicableToDish(DiscountEntity discount, com.poly.restaurant.entities.DishEntity dish) {
		// Logic kiểm tra: discount có thể áp dụng cho dish này không
		// 1. Kiểm tra tên discount có chứa tên dish không (logic nghiệp vụ)
		if (discount.getName() != null && dish.getName() != null) {
			String discountName = discount.getName().toLowerCase();
			String dishName = dish.getName().toLowerCase();
			
			// Nếu discount name chứa dish name
			if (discountName.contains(dishName)) {
				return true;
			}
		}
		
		// 2. Mặc định: tất cả discount đều có thể áp dụng cho dish
		return true;
	}
	
	// Helper method để kiểm tra discount có áp dụng được cho combo không
	private boolean isDiscountApplicableToCombo(DiscountEntity discount, com.poly.restaurant.entities.ComboEntity combo) {
		// Logic kiểm tra: discount có thể áp dụng cho combo này không
		if (discount.getName() != null && combo.getName() != null) {
			String discountName = discount.getName().toLowerCase();
			String comboName = combo.getName().toLowerCase();
			
			// 1. Nếu discount name chứa combo name (chính xác)
			if (discountName.contains(comboName)) {
				return true;
			}
			
			// 2. Nếu discount name chứa "combo" và combo name chứa "combo"
			if (discountName.contains("combo") && comboName.contains("combo")) {
				return true;
			}
			
			// 3. Kiểm tra từ khóa chung
			if (discountName.contains("combo") && 
				(comboName.contains("hải sản") || comboName.contains("phở") || 
				 comboName.contains("cơm") || comboName.contains("bún"))) {
				return true;
			}
		}
		
		// 4. Mặc định: tất cả discount đều có thể áp dụng cho combo
		return true;
	}

	// Method to update status of all discounts (can be called by a scheduled task)
	@Transactional
	public void updateDiscountStatuses() {
		LocalDateTime now = LocalDateTime.now();
		List<DiscountEntity> allDiscounts = discountRepository.findAll();

		for (DiscountEntity discount : allDiscounts) {
			// Không thay đổi status của discount đã bị REPLACED
			if (discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.REPLACED) {
				logger.debug("Skipping REPLACED discount ID: {}", discount.getId());
				continue;
			}

			com.poly.restaurant.entities.enums.DiscountStatus newStatus;

			if (discount.getStartDate().isAfter(now)) {
				// Chưa bắt đầu
				newStatus = com.poly.restaurant.entities.enums.DiscountStatus.SCHEDULED;
			} else if (discount.getEndDate().isAfter(now)) {
				// Đang hoạt động - kiểm tra có sắp hết hạn không
				LocalDateTime twentyFourHoursFromNow = now.plusHours(24);
				if (discount.getEndDate().isBefore(twentyFourHoursFromNow)) {
					// Sắp hết hạn (còn < 24h)
					newStatus = com.poly.restaurant.entities.enums.DiscountStatus.EXPIRING;
				} else {
					// Đang hoạt động bình thường
					newStatus = com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE;
				}
			} else {
				// Đã hết hạn
				newStatus = com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED;
			}

			if (discount.getStatus() != newStatus) {
				logger.info("🔄 Updating discount ID {} status from {} to {}", 
					discount.getId(), discount.getStatus(), newStatus);
				discount.setStatus(newStatus);
				discountRepository.save(discount);
				
				// Đồng bộ discount_id trong bảng dishes/combos
				syncDiscountIdForItems(discount, newStatus);
				
				// Nếu discount chuyển sang ACTIVE và là BRANCH_DISCOUNT, tự động áp dụng cho items phù hợp
				if (newStatus == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE && 
					discount.getType() == com.poly.restaurant.entities.enums.DiscountType.BRANCH_DISCOUNT) {
					applyActiveDiscountToItems(discount);
				}
			}
		}
	}

	// Apply discount to dish or combo
	@Transactional
	public void applyDiscount(Long discountId, Long dishId, Long comboId) {
		logger.info("Applying discount {} to dish {} or combo {}", discountId, dishId, comboId);
		
		// Get discount
		DiscountEntity discount = discountRepository.findById(discountId)
			.orElseThrow(() -> new RuntimeException("Discount not found with id: " + discountId));
		
		if (dishId != null) {
			// Apply to dish
			com.poly.restaurant.entities.DishEntity dish = dishRepository.findById(dishId)
				.orElseThrow(() -> new RuntimeException("Dish not found with id: " + dishId));
			
			// Xử lý logic thay thế discount cũ
			if (dish.getDiscount() != null) {
				handleOldDiscountReplacement(discount, dish.getDiscount(), "dish", dishId);
			}
			
			dish.setDiscount(discount);
			dishRepository.save(dish);
			logger.info("✅ Applied new discount {} to dish {}", discountId, dishId);
			
			// Nếu discount đang ACTIVE, tự động áp dụng cho các items khác phù hợp
			if (discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE) {
				applyActiveDiscountToItems(discount);
			}
		}
		
		if (comboId != null) {
			// Apply to combo
			com.poly.restaurant.entities.ComboEntity combo = comboRepository.findById(comboId)
				.orElseThrow(() -> new RuntimeException("Combo not found with id: " + comboId));
			
			// Xử lý logic thay thế discount cũ
			if (combo.getDiscount() != null) {
				handleOldDiscountReplacement(discount, combo.getDiscount(), "combo", comboId);
			}
			
			combo.setDiscount(discount);
			comboRepository.save(combo);
			logger.info("✅ Applied new discount {} to combo {}", discountId, comboId);
			
			// Nếu discount đang ACTIVE, tự động áp dụng cho các items khác phù hợp
			if (discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE) {
				applyActiveDiscountToItems(discount);
			}
		}
	}

	// Method để đồng bộ discount_id trong bảng dishes/combos
	private void syncDiscountIdForItems(DiscountEntity discount, com.poly.restaurant.entities.enums.DiscountStatus newStatus) {
		try {
			// Tìm tất cả dishes và combos đang sử dụng discount này
			List<com.poly.restaurant.entities.DishEntity> dishesWithThisDiscount = dishRepository.findAll().stream()
				.filter(dish -> dish.getDiscount() != null && dish.getDiscount().getId().equals(discount.getId()))
				.collect(Collectors.toList());
			
			List<com.poly.restaurant.entities.ComboEntity> combosWithThisDiscount = comboRepository.findAll().stream()
				.filter(combo -> combo.getDiscount() != null && combo.getDiscount().getId().equals(discount.getId()))
				.collect(Collectors.toList());
			
			// Xử lý dishes
			for (com.poly.restaurant.entities.DishEntity dish : dishesWithThisDiscount) {
				if (newStatus == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED || 
					newStatus == com.poly.restaurant.entities.enums.DiscountStatus.REPLACED) {
					// Xóa discount_id nếu discount đã hết hạn hoặc bị thay thế
					dish.setDiscount(null);
					dishRepository.save(dish);
					logger.info("✅ Removed discount_id {} from dish {}", discount.getId(), dish.getId());
				}
			}
			
			// Xử lý combos
			for (com.poly.restaurant.entities.ComboEntity combo : combosWithThisDiscount) {
				if (newStatus == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED || 
					newStatus == com.poly.restaurant.entities.enums.DiscountStatus.REPLACED) {
					// Xóa discount_id nếu discount đã hết hạn hoặc bị thay thế
					combo.setDiscount(null);
					comboRepository.save(combo);
					logger.info("✅ Removed discount_id {} from combo {}", discount.getId(), combo.getId());
				}
			}
		} catch (Exception e) {
			logger.error("❌ Error syncing discount_id for discount {}: {}", discount.getId(), e.getMessage());
		}
	}

	// Method để xử lý logic thay thế discount cũ
	private void handleOldDiscountReplacement(DiscountEntity newDiscount, DiscountEntity oldDiscount, String itemType, Long itemId) {
		LocalDateTime now = LocalDateTime.now();
		
		// Chỉ xử lý nếu discount cũ đang ACTIVE
		if (oldDiscount.getStatus() != com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE) {
			logger.info("ℹ️ Discount cũ {} cho {} {} không cần thay đổi (status: {})", 
				oldDiscount.getId(), itemType, itemId, oldDiscount.getStatus());
			return;
		}
		
		// Logic: Chuyển discount cũ thành REPLACED nếu:
		// 1. Discount mới sắp bắt đầu (startDate > now) - SCHEDULED
		// 2. Discount mới đã bắt đầu (startDate <= now) - ACTIVE
		if (newDiscount.getStartDate().isAfter(now)) {
			// Discount mới sắp bắt đầu -> chuyển cũ thành REPLACED
			oldDiscount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.REPLACED);
			discountRepository.save(oldDiscount);
			logger.info("🔄 Chuyển discount cũ {} thành REPLACED cho {} {} (discount mới sắp bắt đầu: {})", 
				oldDiscount.getId(), itemType, itemId, newDiscount.getStartDate());
		} else {
			// Discount mới đã bắt đầu -> chuyển cũ thành REPLACED
			oldDiscount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.REPLACED);
			discountRepository.save(oldDiscount);
			logger.info("🔄 Chuyển discount cũ {} thành REPLACED cho {} {} (discount mới đã bắt đầu: {})", 
				oldDiscount.getId(), itemType, itemId, newDiscount.getStartDate());
		}
	}

	// Get active discount for a specific dish
	@Transactional(readOnly = true)
	public Optional<DiscountResponseDTO> getActiveDiscountForDish(Long dishId) {
		logger.info("Getting active discount for dish: {}", dishId);
		
		com.poly.restaurant.entities.DishEntity dish = dishRepository.findById(dishId)
			.orElseThrow(() -> new RuntimeException("Dish not found with id: " + dishId));
		
		if (dish.getDiscount() != null) {
			// Initialize lazy-loaded discount
			try {
				dish.getDiscount().getId(); // Force initialization
				dish.getDiscount().getStatus();
				dish.getDiscount().getStartDate();
				dish.getDiscount().getEndDate();
			} catch (Exception e) {
				logger.error("Error initializing discount for dish {}: {}", dishId, e.getMessage());
				return Optional.empty();
			}
			
			// Check if discount is still active
			LocalDateTime now = LocalDateTime.now();
			if (dish.getDiscount().getStatus().toString().equals("ACTIVE") &&
				dish.getDiscount().getStartDate().isBefore(now) &&
				dish.getDiscount().getEndDate().isAfter(now)) {
				
				return Optional.of(DiscountMapper.toResponseDto(dish.getDiscount()));
			}
		}
		
		return Optional.empty();
	}

	// Get active discount for a specific combo
	@Transactional(readOnly = true)
	public Optional<DiscountResponseDTO> getActiveDiscountForCombo(Long comboId) {
		logger.info("Getting active discount for combo: {}", comboId);
		
		com.poly.restaurant.entities.ComboEntity combo = comboRepository.findById(comboId)
			.orElseThrow(() -> new RuntimeException("Combo not found with id: " + comboId));
		
		if (combo.getDiscount() != null) {
			// Initialize lazy-loaded discount
			try {
				combo.getDiscount().getId(); // Force initialization
				combo.getDiscount().getStatus();
				combo.getDiscount().getStartDate();
				combo.getDiscount().getEndDate();
			} catch (Exception e) {
				logger.error("Error initializing discount for combo {}: {}", comboId, e.getMessage());
				return Optional.empty();
			}
			
			// Check if discount is still active
			LocalDateTime now = LocalDateTime.now();
			if (combo.getDiscount().getStatus().toString().equals("ACTIVE") &&
				combo.getDiscount().getStartDate().isBefore(now) &&
				combo.getDiscount().getEndDate().isAfter(now)) {
				
				return Optional.of(DiscountMapper.toResponseDto(combo.getDiscount()));
			}
		}
		
		return Optional.empty();
	}

	// Tự động áp dụng discount khi đến giờ
	@Transactional
	public void autoApplyDiscounts() {
		logger.info("Auto-applying discounts that are ready to start...");
		
		// Tìm các discount có startDate <= now và status = SCHEDULED
		List<DiscountEntity> readyDiscounts = discountRepository.findByStatusAndStartDateLessThanEqual(
			com.poly.restaurant.entities.enums.DiscountStatus.SCHEDULED, 
			LocalDateTime.now()
		);
		
		for (DiscountEntity discount : readyDiscounts) {
			try {
				// Cập nhật status thành ACTIVE
				discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE);
				discountRepository.save(discount);
				
				// Tự động áp dụng cho món ăn/combo dựa trên tên discount
				autoApplyDiscountToItems(discount);
				
				logger.info("Auto-applied discount {} to items", discount.getId());
			} catch (Exception e) {
				logger.error("Error auto-applying discount {}: {}", discount.getId(), e.getMessage());
			}
		}
	}

	// Tự động gỡ bỏ discount khi hết hạn
	@Transactional
	public void autoRemoveExpiredDiscounts() {
		logger.info("Auto-removing expired discounts...");
		
		// Tìm các discount có endDate < now và status = ACTIVE
		List<DiscountEntity> expiredDiscounts = discountRepository.findByStatusAndEndDateLessThan(
			com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE, 
			LocalDateTime.now()
		);
		
		for (DiscountEntity discount : expiredDiscounts) {
			try {
				// Cập nhật status thành EXPIRED
				discount.setStatus(com.poly.restaurant.entities.enums.DiscountStatus.EXPIRED);
				discountRepository.save(discount);
				
				// Gỡ bỏ khỏi món ăn/combo
				autoRemoveDiscountFromItems(discount);
				
				logger.info("Auto-removed expired discount {}", discount.getId());
			} catch (Exception e) {
				logger.error("Error auto-removing discount {}: {}", discount.getId(), e.getMessage());
			}
		}
	}

	// Tự động áp dụng discount cho món ăn/combo dựa trên tên
	private void autoApplyDiscountToItems(DiscountEntity discount) {
		String discountName = discount.getName();
		
		// Tìm món ăn có tên tương ứng
		if (discountName.contains("Coca Cola")) {
			com.poly.restaurant.entities.DishEntity dish = dishRepository.findByName("Coca Cola").orElse(null);
			if (dish != null) {
				dish.setDiscount(discount);
				dishRepository.save(dish);
				logger.info("Auto-applied discount {} to dish: Coca Cola", discount.getId());
			}
		} else if (discountName.contains("Bún bò Huế")) {
			com.poly.restaurant.entities.DishEntity dish = dishRepository.findByName("Bún bò Huế").orElse(null);
			if (dish != null) {
				dish.setDiscount(discount);
				dishRepository.save(dish);
				logger.info("Auto-applied discount {} to dish: Bún bò Huế", discount.getId());
			}
		} else if (discountName.contains("Mì Quảng gà")) {
			com.poly.restaurant.entities.DishEntity dish = dishRepository.findByName("Mì Quảng gà").orElse(null);
			if (dish != null) {
				dish.setDiscount(discount);
				dishRepository.save(dish);
				logger.info("Auto-applied discount {} to dish: Mì Quảng gà", discount.getId());
			}
		} else if (discountName.contains("Combo Hải Sản Lớn")) {
			com.poly.restaurant.entities.ComboEntity combo = comboRepository.findByName("Combo Hải Sản Lớn").orElse(null);
			if (combo != null) {
				combo.setDiscount(discount);
				comboRepository.save(combo);
				logger.info("Auto-applied discount {} to combo: Combo Hải Sản Lớn", discount.getId());
			}
		}
		// Có thể thêm logic cho các món khác
	}

	// Tự động gỡ bỏ discount khỏi món ăn/combo
	private void autoRemoveDiscountFromItems(DiscountEntity discount) {
		// Gỡ bỏ khỏi tất cả món ăn
		List<com.poly.restaurant.entities.DishEntity> dishesWithDiscount = dishRepository.findByDiscount(discount);
		for (com.poly.restaurant.entities.DishEntity dish : dishesWithDiscount) {
			dish.setDiscount(null);
			dishRepository.save(dish);
			logger.info("Auto-removed discount {} from dish: {}", discount.getId(), dish.getName());
		}
		
		// Gỡ bỏ khỏi tất cả combo
		List<com.poly.restaurant.entities.ComboEntity> combosWithDiscount = comboRepository.findByDiscount(discount);
		for (com.poly.restaurant.entities.ComboEntity combo : combosWithDiscount) {
			combo.setDiscount(null);
			comboRepository.save(combo);
			logger.info("Auto-removed discount {} from combo: {}", discount.getId(), combo.getName());
		}
	}

	// Tìm voucher theo code
	@Transactional(readOnly = true)
	public Optional<DiscountResponseDTO> getDiscountByCode(String code) {
		logger.info("Getting discount by code: {}", code);
		
		Optional<DiscountEntity> entity = discountRepository.findByCode(code);
		
		if (entity.isPresent()) {
			DiscountEntity discount = entity.get();
			
			// Kiểm tra voucher có còn hạn sử dụng không
			LocalDateTime now = LocalDateTime.now();
			if (discount.getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE &&
				discount.getStartDate().isBefore(now) &&
				discount.getEndDate().isAfter(now)) {
				
				logger.info("Found active discount with code: {}", code);
				return Optional.of(DiscountMapper.toResponseDto(discount));
			} else {
				logger.warn("Discount with code {} is not active or expired", code);
				return Optional.empty();
			}
		}
		
		logger.warn("Discount not found with code: {}", code);
		return Optional.empty();
	}

	// Validate voucher trước khi sử dụng
	@Transactional(readOnly = true)
	public boolean validateVoucher(String voucherCode, Long dishId, Long comboId) {
		logger.info("Validating voucher: {} for dish: {} or combo: {}", voucherCode, dishId, comboId);
		
		Optional<DiscountEntity> voucherOpt = discountRepository.findByCode(voucherCode);
		
		if (!voucherOpt.isPresent()) {
			logger.warn("Voucher not found with code: {}", voucherCode);
			return false;
		}
		
		DiscountEntity voucher = voucherOpt.get();
		LocalDateTime now = LocalDateTime.now();
		
		// Kiểm tra voucher có còn hạn sử dụng không
		if (voucher.getStatus() != com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE) {
			logger.warn("Voucher {} is not active, status: {}", voucherCode, voucher.getStatus());
			return false;
		}
		
		if (voucher.getStartDate().isAfter(now)) {
			logger.warn("Voucher {} has not started yet, start date: {}", voucherCode, voucher.getStartDate());
			return false;
		}
		
		if (voucher.getEndDate().isBefore(now)) {
			logger.warn("Voucher {} has expired, end date: {}", voucherCode, voucher.getEndDate());
			return false;
		}
		
		// Kiểm tra voucher có áp dụng cho món ăn/combo này không
		if (dishId != null) {
			com.poly.restaurant.entities.DishEntity dish = dishRepository.findById(dishId).orElse(null);
			if (dish != null && dish.getDiscount() != null && dish.getDiscount().getId().equals(voucher.getId())) {
				logger.info("Voucher {} is valid for dish {}", voucherCode, dishId);
				return true;
			}
		}
		
		if (comboId != null) {
			com.poly.restaurant.entities.ComboEntity combo = comboRepository.findById(comboId).orElse(null);
			if (combo != null && combo.getDiscount() != null && combo.getDiscount().getId().equals(voucher.getId())) {
				logger.info("Voucher {} is valid for combo {}", voucherCode, comboId);
				return true;
			}
		}
		
		logger.warn("Voucher {} is not applicable for dish {} or combo {}", voucherCode, dishId, comboId);
		return false;
	}

	// Lấy thông tin voucher để áp dụng
	@Transactional(readOnly = true)
	public Optional<DiscountResponseDTO> getValidVoucherForItem(String voucherCode, Long dishId, Long comboId) {
		if (validateVoucher(voucherCode, dishId, comboId)) {
			return getDiscountByCode(voucherCode);
		}
		return Optional.empty();
	}
}