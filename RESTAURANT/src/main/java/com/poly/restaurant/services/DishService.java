package com.poly.restaurant.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.poly.restaurant.dtos.DishRequestDTO;
import com.poly.restaurant.dtos.DishResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.CategoryEntity;
import com.poly.restaurant.entities.DishEntity;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.DishMapper;
import com.poly.restaurant.repositories.CategoryRepository;
import com.poly.restaurant.repositories.ComboDishRepository;
import com.poly.restaurant.repositories.DishRepository;


@Service
public class DishService {

    
    private final DishRepository dishRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final ComboDishRepository comboDishRepository;
    private final ComboService comboService;
    
    public DishService(DishRepository dishRepository, 
                      CategoryRepository categoryRepository, 
                      CloudinaryService cloudinaryService, 
                      ComboDishRepository comboDishRepository, 
                      @Lazy ComboService comboService) {
        this.dishRepository = dishRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinaryService = cloudinaryService;
        this.comboDishRepository = comboDishRepository;
        this.comboService = comboService;
    }
    
    @Transactional(readOnly = true)
    public List<DishResponseDTO> getAllDishes() {
        List<DishEntity> dishes = dishRepository.findAll();
        return dishes.stream()
                .map(d -> {
                    DishResponseDTO dto = DishMapper.toResponseDTO(d);
                    // Đánh dấu inUse nếu đang thuộc Combo
                    try {
                        boolean inCombo = comboDishRepository.existsByDishId(d.getId());
                        dto.setInUse(inCombo);
                    } catch (Exception ignored) {}
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DishResponseDTO> getDishesByBranch(Long branchId) {
        List<DishEntity> dishes = dishRepository.findByBranchId(branchId);
        return dishes.stream()
                .map(d -> {
                    DishResponseDTO dto = DishMapper.toResponseDTO(d);
                    // Đánh dấu inUse nếu đang thuộc Combo
                    try {
                        boolean inCombo = comboDishRepository.existsByDishId(d.getId());
                        dto.setInUse(inCombo);
                    } catch (Exception ignored) {}
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DishResponseDTO getDishById(Long id) {
        var dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với ID: " + id));
        return DishMapper.toResponseDTO(dish);
    }
    
    @Transactional(readOnly = true)
    public Page<DishResponseDTO> searchDishes(String name, Long categoryId, String status, Long branchId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Bắt đầu xây dựng Specification
        Specification<DishEntity> spec = Specification.where(null);

        // Thêm điều kiện tìm theo tên nếu có
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%")
            );
        }

        // Thêm điều kiện lọc theo categoryId nếu có
        if (categoryId != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("category").get("id"), categoryId)
            );
        }

        // operationalStatus đã bị xóa, không còn filter theo status

        // Thêm điều kiện lọc theo branchId nếu có
        if (branchId != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("branch").get("id"), branchId)
            );
        }
        
        // Gọi phương thức findAll với Specification
        Page<DishEntity> dishPage = dishRepository.findAll(spec, pageable);
        return dishPage.map(d -> {
            // Initialize lazy collections to avoid LazyInitializationException
            if (d.getCategory() != null) {
                d.getCategory().getName(); // Trigger lazy loading
            }
            if (d.getBranch() != null) {
                d.getBranch().getName(); // Trigger lazy loading
            }
            
            DishResponseDTO dto = DishMapper.toResponseDTO(d);
            try {
                boolean inCombo = comboDishRepository.existsByDishId(d.getId());
                dto.setInUse(inCombo);
            } catch (Exception ignored) {}
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<DishResponseDTO> searchDishesForManager(String name, Long categoryId, String status, AccountEntity loggedInUser, int page, int size) {
        // Tự động lấy branchId từ loggedInUser
        Long branchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
        return searchDishes(name, categoryId, status, branchId, page, size);
    }

    @Transactional
    public DishResponseDTO createDishWithImage(DishRequestDTO dto, MultipartFile image, AccountEntity loggedInUser) {
        dishRepository.findByName(dto.getName()).ifPresent(d -> {
            throw new IllegalArgumentException("Tên món ăn '" + dto.getName() + "' đã tồn tại.");
        });

        // Validate categoryId is not null
        if (dto.getCategoryId() == null) {
            throw new IllegalArgumentException("ID danh mục không được để trống");
        }
        
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + dto.getCategoryId()));

        DishEntity dish = DishMapper.toEntity(dto);
        dish.setCategory(category);
        
        // Tự động lấy branch từ loggedInUser
        if (loggedInUser.getBranch() == null) {
            throw new IllegalArgumentException("Người dùng chưa được gán cho chi nhánh nào");
        }
        dish.setBranch(loggedInUser.getBranch());

        // Handle image: either upload file or use existing URL
        if (image != null && !image.isEmpty()) {
            // Upload new file
            String url = cloudinaryService.uploadFile(image);
            dish.setImage(url);
        } else if (dto.getImage() != null && !dto.getImage().trim().isEmpty()) {
            // Use existing URL (from Cloudinary picker)
            dish.setImage(dto.getImage().trim());
        }

        DishEntity savedDish = dishRepository.save(dish);
        return DishMapper.toResponseDTO(savedDish);
    }

    @Transactional
    public DishResponseDTO updateDishWithImage(Long id, DishRequestDTO dto, MultipartFile image, AccountEntity loggedInUser) {
        DishEntity existingDish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với ID: " + id));

        // Kiểm tra quyền cập nhật
        boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
        if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(existingDish.getBranch().getId()))) {
            throw new SecurityException("Bạn không có quyền cập nhật món ăn này.");
        }

        // Kiểm tra tên trùng lặp
        dishRepository.findByName(dto.getName()).ifPresent(d -> {
            if (!d.getId().equals(id)) {
                throw new IllegalArgumentException("Tên món ăn '" + dto.getName() + "' đã tồn tại.");
            }
        });

        // Cập nhật category nếu thay đổi
        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(existingDish.getCategory().getId())) {
            CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + dto.getCategoryId()));
            existingDish.setCategory(category);
        }

        // Cập nhật các trường khác
        DishMapper.updateEntityFromDto(dto, existingDish);

        // Nếu có ảnh mới thì upload và cập nhật
        if (image != null && !image.isEmpty()) {
            // Upload new file
            String url = cloudinaryService.uploadFile(image);
            existingDish.setImage(url);
        } else if (dto.getImage() != null && !dto.getImage().trim().isEmpty()) {
            // Use existing URL (from Cloudinary picker)
            existingDish.setImage(dto.getImage().trim());
        }

        DishEntity updatedDish = dishRepository.save(existingDish);
        return DishMapper.toResponseDTO(updatedDish);
    }

    @Transactional
    public void deleteDish(Long id, AccountEntity loggedInUser) {
        DishEntity dishToDelete = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với ID: " + id));

        // Kiểm tra quyền xóa
        boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
        if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(dishToDelete.getBranch().getId()))) {
            throw new SecurityException("Bạn không có quyền xóa món ăn này.");
        }

        // Chặn xóa nếu đang được dùng trong Combo
        if (comboDishRepository.existsByDishId(id)) {
            throw new org.springframework.dao.DataIntegrityViolationException("Không thể xóa món vì đang được dùng trong Combo.");
        }
        
        dishRepository.delete(dishToDelete);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDeletability(Long id) {
        dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với ID: " + id));
        boolean inCombo = false;
        try { inCombo = comboDishRepository.existsByDishId(id); } catch (Exception ignored) {}
        java.util.List<java.util.Map<String,Object>> reasons = new java.util.ArrayList<>();
        if (inCombo) reasons.add(java.util.Map.of("type","COMBO","count",1));
        return java.util.Map.of(
                "deletable", !inCombo,
                "reasons", reasons
        );
    }
    
    // Method updateDishOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

    @Transactional
    public DishResponseDTO updateDishAvailabilityStatus(Long id, ItemAvailabilityStatus newStatus) {
        DishEntity dishToUpdate = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));

        dishToUpdate.setAvailabilityStatus(newStatus);
        DishEntity savedDish = dishRepository.save(dishToUpdate);
        
        // Tự động cập nhật tất cả combo chứa món ăn này
        List<com.poly.restaurant.entities.ComboDishEntity> comboDishes = comboDishRepository.findByDishId(id);
        for (com.poly.restaurant.entities.ComboDishEntity comboDish : comboDishes) {
            comboService.updateComboAvailabilityBasedOnDishes(comboDish.getCombo().getId());
        }
        
        return DishMapper.toResponseDTO(savedDish);
    }

    // Method updateOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

    /**
     * Lấy danh sách tất cả món ăn có sẵn
     * Dùng cho dropdown chọn món ăn trong tạo combo
     */
    @Transactional(readOnly = true)
    public List<DishResponseDTO> getApprovedActiveDishes() {
        List<DishEntity> dishes = dishRepository.findByAvailabilityStatus(
            ItemAvailabilityStatus.AVAILABLE
        );
        
        return dishes.stream()
                .map(DishMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật thông tin giảm giá cho món ăn
     */
    @Transactional
    public DishResponseDTO updateDishDiscount(Long id, java.util.Map<String, Object> discountData, AccountEntity loggedInUser) {
        DishEntity dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));
        
        // Kiểm tra quyền: Manager chỉ được sửa món ăn của chi nhánh mình
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
            Long managerBranchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
            if (managerBranchId == null || !managerBranchId.equals(dish.getBranch().getId())) {
                throw new IllegalStateException("Manager chỉ được sửa món ăn của chi nhánh mình");
            }
        }
        
        // Không cần cập nhật discount fields nữa vì đã chuyển sang quan hệ 1:1
        // Discount sẽ được quản lý thông qua DiscountService
        
        DishEntity saved = dishRepository.save(dish);
        return DishMapper.toResponseDTO(saved);
    }

    /**
     * Xóa giảm giá khỏi món ăn
     */
    @Transactional
    public DishResponseDTO removeDishDiscount(Long id, AccountEntity loggedInUser) {
        DishEntity dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));
        
        // Kiểm tra quyền: Manager chỉ được sửa món ăn của chi nhánh mình
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
            Long managerBranchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
            if (managerBranchId == null || !managerBranchId.equals(dish.getBranch().getId())) {
                throw new IllegalStateException("Manager chỉ được sửa món ăn của chi nhánh mình");
            }
        }
        
        // Xóa discount từ quan hệ 1:1
        dish.setDiscount(null);
        
        DishEntity saved = dishRepository.save(dish);
        return DishMapper.toResponseDTO(saved);
    }

    /**
     * Tìm kiếm món ăn cho Staff (không bao gồm DISCONTINUED)
     */
    @Transactional(readOnly = true)
    public Page<DishResponseDTO> searchDishesForStaff(String name, String status, Long branchId, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Specification<DishEntity> spec = Specification.where(null);
        
        // Filter theo tên
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
        }
        
        // Filter theo branch
        if (branchId != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("branch").get("id"), branchId));
        }
        
        // Filter theo category
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("category").get("id"), categoryId));
        }
        
        // operationalStatus đã bị xóa, không còn filter theo status
        
        // QUAN TRỌNG: Lọc bỏ DISCONTINUED - Staff không nên thấy món ăn ngừng bán
        spec = spec.and((root, query, cb) -> 
            cb.notEqual(root.get("availabilityStatus"), ItemAvailabilityStatus.DISCONTINUED));
        
        Page<DishEntity> dishPage = dishRepository.findAll(spec, pageable);
        
        // Manually initialize lazy-loaded entities to avoid LazyInitializationException
        dishPage.getContent().forEach(dish -> {
            // Initialize branch
            if (dish.getBranch() != null) {
                dish.getBranch().getId();
                dish.getBranch().getName();
            }
            // Initialize discount
            if (dish.getDiscount() != null) {
                dish.getDiscount().getId();
                dish.getDiscount().getNewPrice();
                dish.getDiscount().getStatus();
                dish.getDiscount().getStartDate();
                dish.getDiscount().getEndDate();
                dish.getDiscount().getType();
            }
            // Initialize category
            if (dish.getCategory() != null) {
                dish.getCategory().getId();
                dish.getCategory().getName();
            }
        });
        
        return dishPage.map(DishMapper::toResponseDTO);
    }


    /**
     * Tìm kiếm món ăn cho Staff Manager (không bao gồm DISCONTINUED)
     */
    public Page<DishResponseDTO> searchDishesForStaffManager(String name, String status, Long categoryId, AccountEntity manager, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Specification<DishEntity> spec = Specification.where(null);
        
        // Filter theo tên
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
        }
        
        // Filter theo branch của manager
        if (manager.getBranch() != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("branch").get("id"), manager.getBranch().getId()));
        }
        
        // Filter theo category
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("category").get("id"), categoryId));
        }
        
        // operationalStatus đã bị xóa, không còn filter theo status
        
        // QUAN TRỌNG: Lọc bỏ DISCONTINUED - Staff không nên thấy món ăn ngừng bán
        spec = spec.and((root, query, cb) -> 
            cb.notEqual(root.get("availabilityStatus"), ItemAvailabilityStatus.DISCONTINUED));
        
        Page<DishEntity> dishPage = dishRepository.findAll(spec, pageable);
        
        // Manually initialize lazy-loaded entities to avoid LazyInitializationException
        dishPage.getContent().forEach(dish -> {
            // Initialize branch
            if (dish.getBranch() != null) {
                dish.getBranch().getId();
                dish.getBranch().getName();
            }
            // Initialize discount
            if (dish.getDiscount() != null) {
                dish.getDiscount().getId();
                dish.getDiscount().getNewPrice();
                dish.getDiscount().getStatus();
                dish.getDiscount().getStartDate();
                dish.getDiscount().getEndDate();
                dish.getDiscount().getType();
            }
            // Initialize category
            if (dish.getCategory() != null) {
                dish.getCategory().getId();
                dish.getCategory().getName();
            }
        });
        
        return dishPage.map(DishMapper::toResponseDTO);
    }

}