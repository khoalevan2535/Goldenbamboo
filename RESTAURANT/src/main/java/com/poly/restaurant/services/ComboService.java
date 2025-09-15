package com.poly.restaurant.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.poly.restaurant.dtos.ComboItemDTO;
import com.poly.restaurant.dtos.ComboRequestDTO;
import com.poly.restaurant.dtos.ComboResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.ComboDishEntity;
import com.poly.restaurant.entities.ComboEntity;
import com.poly.restaurant.entities.DishEntity;
// Bỏ ApprovalStatus - chỉ dùng OperationalStatus
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import com.poly.restaurant.mappers.ComboMapper;
import com.poly.restaurant.repositories.ComboRepository;
import com.poly.restaurant.repositories.DishRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComboService {

    
    private final ComboRepository comboRepository;
    private final DishRepository dishRepository;
    private final ComboMapper comboMapper;
    private final CloudinaryService cloudinaryService;


    @Transactional(readOnly = true)
    public List<ComboResponseDTO> getCombosByBranch(Long branchId) {
        List<ComboEntity> combos = comboRepository.findByBranchId(branchId);
        return combos.stream()
                .map(comboMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ComboResponseDTO> searchCombos(String name, String status, Long branchId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<ComboEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (name != null && !name.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            // operationalStatus đã bị xóa, không còn filter theo status
            if (branchId != null) {
                predicates.add(cb.equal(root.get("branch").get("id"), branchId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return comboRepository.findAll(spec, pageable).map(c -> {
            // Initialize lazy collections to avoid LazyInitializationException
            if (c.getBranch() != null) {
                c.getBranch().getName(); // Trigger lazy loading
            }
            if (c.getComboDishes() != null) {
                c.getComboDishes().size(); // Trigger lazy loading
            }
            
            ComboResponseDTO dto = comboMapper.toResponseDTO(c);
            dto.setInUse(false); // Không còn menu system
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<ComboResponseDTO> searchCombosForManager(String name, String status, AccountEntity loggedInUser, int page, int size) {
        // Tự động lấy branchId từ loggedInUser
        Long branchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
        return searchCombos(name, status, branchId, page, size);
    }

    @Transactional(readOnly = true)
    public ComboResponseDTO getComboById(Long id) {
        ComboEntity combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với ID: " + id));
        return comboMapper.toResponseDTO(combo);
    }

    @Transactional
    public ComboResponseDTO createComboWithImage(ComboRequestDTO comboRequestDTO, MultipartFile image, AccountEntity loggedInUser) {
        comboRepository.findByName(comboRequestDTO.getName()).ifPresent(c -> {
            throw new IllegalArgumentException("Tên combo '" + comboRequestDTO.getName() + "' đã tồn tại.");
        });

        if (comboRequestDTO.getComboItems() == null || comboRequestDTO.getComboItems().size() < 2) {
            throw new IllegalArgumentException("Combo phải có ít nhất 2 món ăn.");
        }

        ComboEntity comboEntity = comboMapper.toEntity(comboRequestDTO);
        
        // Tự động lấy branch từ loggedInUser
        if (loggedInUser.getBranch() == null) {
            throw new IllegalArgumentException("Người dùng chưa được gán cho chi nhánh nào");
        }
        comboEntity.setBranch(loggedInUser.getBranch());

        // Upload ảnh nếu có
        if (image != null && !image.isEmpty()) {
            // Upload new file
            String url = cloudinaryService.uploadFile(image);
            comboEntity.setImage(url);
        } else if (comboRequestDTO.getImage() != null && !comboRequestDTO.getImage().trim().isEmpty()) {
            // Use existing URL (from Cloudinary picker)
            comboEntity.setImage(comboRequestDTO.getImage().trim());
        }

        if (comboRequestDTO.getComboItems() != null && !comboRequestDTO.getComboItems().isEmpty()) {
            Set<ComboDishEntity> comboDishes = comboRequestDTO.getComboItems().stream()
                .map(item -> {
                    DishEntity dish = dishRepository.findById(item.getDishId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với ID: " + item.getDishId()));
                    ComboDishEntity comboDish = new ComboDishEntity();
                    comboDish.setCombo(comboEntity);
                    comboDish.setDish(dish);
                    comboDish.setQuantity(item.getQuantity());
                    return comboDish;
                }).collect(Collectors.toSet());
            comboEntity.setComboDishes(comboDishes);
        }

        // Không cần approval system nữa - tất cả đều APPROVED
        // Bỏ approval system - chỉ cần operational status

        ComboEntity savedCombo = comboRepository.save(comboEntity);

        // Tự động cập nhật trạng thái combo dựa trên trạng thái của các món ăn
        updateComboAvailabilityBasedOnDishes(savedCombo.getId());

        // Lấy combo đã được cập nhật trạng thái
        ComboEntity updatedCombo = comboRepository.findById(savedCombo.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found after creation"));

        return comboMapper.toResponseDTO(updatedCombo);
    }

    @Transactional
    public ComboResponseDTO updateComboWithImage(Long id, ComboRequestDTO comboRequestDTO, MultipartFile image, AccountEntity loggedInUser) {
        ComboEntity existingCombo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với ID: " + id));

        // Kiểm tra quyền cập nhật
        boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
        if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(existingCombo.getBranch().getId()))) {
            throw new SecurityException("Bạn không có quyền cập nhật combo này.");
        }

        if (comboRequestDTO.getComboItems() == null || comboRequestDTO.getComboItems().size() < 2) {
            throw new IllegalArgumentException("Combo phải có ít nhất 2 món ăn.");
        }

        comboRepository.findByName(comboRequestDTO.getName()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new IllegalArgumentException("Tên combo '" + comboRequestDTO.getName() + "' đã tồn tại.");
            }
        });

        // Lưu giá trị cũ để so sánh
        Map<String, Object> changes = new java.util.HashMap<>();
        if (!existingCombo.getName().equals(comboRequestDTO.getName())) {
            changes.put("name", comboRequestDTO.getName());
        }
        if (!existingCombo.getBasePrice().equals(comboRequestDTO.getBasePrice())) {
            changes.put("basePrice", comboRequestDTO.getBasePrice());
        }
        if (comboRequestDTO.getDescription() != null && !comboRequestDTO.getDescription().equals(existingCombo.getDescription())) {
            changes.put("description", comboRequestDTO.getDescription());
        }

        // Không cần approval system nữa

        existingCombo.setName(comboRequestDTO.getName());
        existingCombo.setDescription(comboRequestDTO.getDescription());
        existingCombo.setBasePrice(comboRequestDTO.getBasePrice());

        // Upload ảnh mới nếu có
        if (image != null && !image.isEmpty()) {
            // Upload new file
            String url = cloudinaryService.uploadFile(image);
            existingCombo.setImage(url);
        } else if (comboRequestDTO.getImage() != null && !comboRequestDTO.getImage().trim().isEmpty()) {
            // Use existing URL (from Cloudinary picker)
            existingCombo.setImage(comboRequestDTO.getImage().trim());
        }

        existingCombo.getComboDishes().clear();
        if (comboRequestDTO.getComboItems() != null) {
            for (ComboItemDTO item : comboRequestDTO.getComboItems()) {
                DishEntity dish = dishRepository.findById(item.getDishId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với ID: " + item.getDishId()));
                ComboDishEntity comboDish = new ComboDishEntity();
                comboDish.setCombo(existingCombo);
                comboDish.setDish(dish);
                comboDish.setQuantity(item.getQuantity());
                existingCombo.getComboDishes().add(comboDish);
            }
        }

        // Không cần approval system nữa

        ComboEntity updatedCombo = comboRepository.save(existingCombo);

        // Tự động cập nhật trạng thái combo dựa trên trạng thái của các món ăn
        updateComboAvailabilityBasedOnDishes(updatedCombo.getId());

        // Lấy combo đã được cập nhật trạng thái
        ComboEntity finalCombo = comboRepository.findById(updatedCombo.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found after update"));

        return comboMapper.toResponseDTO(finalCombo);
    }

    @Transactional
    public void deleteCombo(Long id, AccountEntity loggedInUser) {
        ComboEntity comboToDelete = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với ID: " + id));

        // Kiểm tra quyền xóa
        boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
        if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(comboToDelete.getBranch().getId()))) {
            throw new SecurityException("Bạn không có quyền xóa combo này.");
        }

        // Không cần approval system nữa - xóa trực tiếp
        // Không còn menu system, có thể xóa trực tiếp

        comboRepository.delete(comboToDelete);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDeletability(Long id) {
        comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với ID: " + id));
        // Không còn menu system, có thể xóa trực tiếp
        return Map.of(
                "deletable", true,
                "reasons", List.of()
        );
    }

    // Các method updateOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

    @Transactional
    public ComboResponseDTO updateAvailabilityStatus(Long id, ItemAvailabilityStatus availabilityStatus) {
        ComboEntity combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Combo với ID: " + id));
        combo.setAvailabilityStatus(availabilityStatus);
        combo.setManualAvailabilityOverride(true); // Đánh dấu là set thủ công
        ComboEntity updatedCombo = comboRepository.save(combo);
        return comboMapper.toResponseDTO(updatedCombo);
    }

    /**
     * Reset combo về trạng thái tự động (dựa trên món ăn)
     */
    @Transactional
    public ComboResponseDTO resetComboToAutomatic(Long id) {
        ComboEntity combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Combo với ID: " + id));
        combo.setManualAvailabilityOverride(false); // Reset về tự động
        comboRepository.save(combo);
        
        // Tự động cập nhật trạng thái dựa trên món ăn
        updateComboAvailabilityBasedOnDishes(id);
        
        // Lấy combo đã được cập nhật
        ComboEntity updatedCombo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found after reset"));
        
        return comboMapper.toResponseDTO(updatedCombo);
    }

    /**
     * Tự động cập nhật trạng thái combo dựa trên trạng thái của các món ăn trong combo
     * Logic: 
     * - Nếu có món DISCONTINUED → Combo = DISCONTINUED
     * - Nếu có món OUT_OF_STOCK → Combo = OUT_OF_STOCK
     * - Nếu tất cả AVAILABLE → Combo = AVAILABLE
     */
    @Transactional
    public void updateComboAvailabilityBasedOnDishes(Long comboId) {
        ComboEntity combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Combo với ID: " + comboId));
        
        // Nếu combo đã được set thủ công, không tự động cập nhật
        if (Boolean.TRUE.equals(combo.getManualAvailabilityOverride())) {
            return;
        }
        
        // Kiểm tra trạng thái của các món ăn trong combo
        boolean hasDiscontinuedDish = combo.getComboDishes().stream()
                .anyMatch(comboDish -> 
                    comboDish.getDish().getAvailabilityStatus() == ItemAvailabilityStatus.DISCONTINUED);
        
        boolean hasOutOfStockDish = combo.getComboDishes().stream()
                .anyMatch(comboDish -> 
                    comboDish.getDish().getAvailabilityStatus() == ItemAvailabilityStatus.OUT_OF_STOCK);
        
        boolean allDishesAvailable = combo.getComboDishes().stream()
                .allMatch(comboDish -> 
                    comboDish.getDish().getAvailabilityStatus() == ItemAvailabilityStatus.AVAILABLE);
        
        ItemAvailabilityStatus newStatus;
        if (hasDiscontinuedDish) {
            // Ưu tiên cao nhất: nếu có món ngừng bán → combo ngừng bán
            newStatus = ItemAvailabilityStatus.DISCONTINUED;
        } else if (hasOutOfStockDish) {
            // Ưu tiên thứ hai: nếu có món hết hàng → combo hết hàng
            newStatus = ItemAvailabilityStatus.OUT_OF_STOCK;
        } else if (allDishesAvailable) {
            // Tất cả món đều còn hàng → combo còn hàng
            newStatus = ItemAvailabilityStatus.AVAILABLE;
        } else {
            // Fallback: mặc định là hết hàng
            newStatus = ItemAvailabilityStatus.OUT_OF_STOCK;
        }
        
        // Chỉ cập nhật nếu trạng thái thay đổi
        if (!combo.getAvailabilityStatus().equals(newStatus)) {
            combo.setAvailabilityStatus(newStatus);
            comboRepository.save(combo);
        }
    }

    /**
     * Tìm kiếm combo cho Staff (không bao gồm DISCONTINUED)
     */
    @Transactional(readOnly = true)
    public Page<ComboResponseDTO> searchCombosForStaff(String name, String status, Long branchId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Specification<ComboEntity> spec = Specification.where(null);
        
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
        
        // operationalStatus đã bị xóa, không còn filter theo status
        
        // QUAN TRỌNG: Lọc bỏ DISCONTINUED - Staff không nên thấy combo ngừng bán
        spec = spec.and((root, query, cb) -> 
            cb.notEqual(root.get("availabilityStatus"), ItemAvailabilityStatus.DISCONTINUED));
        
        Page<ComboEntity> comboPage = comboRepository.findAll(spec, pageable);
        
        // Manually initialize lazy-loaded entities to avoid LazyInitializationException
        comboPage.getContent().forEach(combo -> {
            // Initialize branch
            if (combo.getBranch() != null) {
                combo.getBranch().getId();
                combo.getBranch().getName();
            }
            // Initialize discount
            if (combo.getDiscount() != null) {
                combo.getDiscount().getId();
                combo.getDiscount().getNewPrice();
                combo.getDiscount().getStatus();
                combo.getDiscount().getStartDate();
                combo.getDiscount().getEndDate();
            }
            // Initialize comboDishes collection
            if (combo.getComboDishes() != null) {
                combo.getComboDishes().size(); // Force initialization
            }
        });
        
        return comboPage.map(comboMapper::toResponseDTO);
    }

    /**
     * Tìm kiếm combo cho Staff Manager (không bao gồm DISCONTINUED)
     */
    public Page<ComboResponseDTO> searchCombosForStaffManager(String name, String status, AccountEntity manager, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Specification<ComboEntity> spec = Specification.where(null);
        
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
        
        // operationalStatus đã bị xóa, không còn filter theo status
        
        // QUAN TRỌNG: Lọc bỏ DISCONTINUED - Staff không nên thấy combo ngừng bán
        spec = spec.and((root, query, cb) -> 
            cb.notEqual(root.get("availabilityStatus"), ItemAvailabilityStatus.DISCONTINUED));
        
        Page<ComboEntity> comboPage = comboRepository.findAll(spec, pageable);
        
        // Manually initialize lazy-loaded entities to avoid LazyInitializationException
        comboPage.getContent().forEach(combo -> {
            // Initialize branch
            if (combo.getBranch() != null) {
                combo.getBranch().getId();
                combo.getBranch().getName();
            }
            // Initialize discount
            if (combo.getDiscount() != null) {
                combo.getDiscount().getId();
                combo.getDiscount().getNewPrice();
                combo.getDiscount().getStatus();
                combo.getDiscount().getStartDate();
                combo.getDiscount().getEndDate();
            }
            // Initialize comboDishes collection
            if (combo.getComboDishes() != null) {
                combo.getComboDishes().size(); // Force initialization
            }
        });
        
        return comboPage.map(comboMapper::toResponseDTO);
    }
}
