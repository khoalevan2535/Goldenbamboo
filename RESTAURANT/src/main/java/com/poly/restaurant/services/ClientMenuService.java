package com.poly.restaurant.services;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.entities.*;
import java.util.Optional;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import com.poly.restaurant.entities.enums.BranchStatus;
import com.poly.restaurant.mappers.ClientMenuMapper;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.CategoryRepository;
import com.poly.restaurant.repositories.DishRepository;
import com.poly.restaurant.repositories.ComboRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientMenuService {

    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;
    private final ClientMenuMapper clientMenuMapper;

    /**
     * Lấy danh sách chi nhánh active
     */
    @Transactional(readOnly = true)
    public List<ClientBranchDTO> getActiveBranches() {
        log.info("Fetching active branches for client menu");

        List<BranchEntity> branches = branchRepository.findByStatus(BranchStatus.OPEN);
        return clientMenuMapper.toClientBranchDTOList(branches);
    }

    /**
     * Lấy danh sách category active
     */
    @Transactional(readOnly = true)
    public List<ClientCategoryDTO> getActiveCategories() {
        log.info("Fetching active categories for client menu");

        List<CategoryEntity> categories = categoryRepository.findAll().stream()
                .filter(category -> "ACTIVE".equals(category.getStatus()))
                .collect(Collectors.toList());

        // Cập nhật số lượng items cho mỗi category
        return categories.stream()
                .map(this::enrichCategoryWithCounts)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách category active theo branch với counts
     */
    @Transactional(readOnly = true)
    public List<ClientCategoryWithCountsDTO> getBranchScopedCategories(Long branchId, String type,
            Boolean includeCounts, Boolean showEmpty, String search) {
        log.info(
                "Fetching branch-scoped categories for branch: {}, type: {}, includeCounts: {}, showEmpty: {}, search: {}",
                branchId, type, includeCounts, showEmpty, search);

        // Validate branch
        if (!isBranchActive(branchId)) {
            throw new IllegalArgumentException("Branch not found or not active: " + branchId);
        }

        // Get all approved categories
        List<CategoryEntity> allCategories = categoryRepository.findAll().stream()
                .filter(category -> "ACTIVE".equals(category.getStatus()))
                .collect(Collectors.toList());

        // Filter by search if provided
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allCategories = allCategories.stream()
                    .filter(category -> category.getName() != null &&
                            category.getName().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        // Process each category to get branch-scoped counts
        List<ClientCategoryWithCountsDTO> result = new ArrayList<>();

        for (CategoryEntity category : allCategories) {
            Integer foodCount = null;
            Integer comboCount = null;

            if (includeCounts != null && includeCounts) {
                // Count dishes in this category for the branch
                if ("food".equals(type) || "all".equals(type) || type == null) {
                    foodCount = countDishesInCategoryForBranch(category.getId(), branchId);
                }

                // Count combos in this category for the branch
                if ("combo".equals(type) || "all".equals(type) || type == null) {
                    comboCount = countCombosInCategoryForBranch(category.getId(), branchId);
                }
            }

            int totalCount = (foodCount != null ? foodCount : 0) + (comboCount != null ? comboCount : 0);

            // Apply showEmpty filter
            if (showEmpty != null && !showEmpty && totalCount == 0) {
                continue; // Skip categories with no items
            }

            // Create DTO with counts
            ClientCategoryWithCountsDTO categoryDTO = clientMenuMapper.toClientCategoryWithCountsDTO(
                    category, branchId, foodCount, comboCount);

            result.add(categoryDTO);
        }

        log.info("Found {} categories for branch: {} (filtered from {} total)",
                result.size(), branchId, allCategories.size());

        return result;
    }

    /**
     * Lấy menu items theo branch và filter
     */
    @Transactional(readOnly = true)
    public Page<ClientMenuItemDTO> getMenuItems(Long branchId, Long categoryId, String type,
            String search, Pageable pageable) {
        log.info("Fetching menu items for branch: {}, category: {}, type: {}, search: {}",
                branchId, categoryId, type, search);

        try {
            // Kiểm tra branch có tồn tại và active không
            if (!isBranchActive(branchId)) {
                throw new IllegalArgumentException("Branch not found or not active: " + branchId);
            }

            // Tạo pageable với sort mặc định
            Pageable finalPageable = createPageableWithDefaultSort(pageable);

            List<ClientMenuItemDTO> allItems = new ArrayList<>();

            // Lấy dishes
            if ("food".equals(type) || "all".equals(type) || type == null) {
                List<DishEntity> dishes = getDishesInternal(branchId, categoryId, search);
                if (dishes != null) {
                    allItems.addAll(clientMenuMapper.toClientMenuItemDTOList(dishes));
                }
            }

            // Lấy combos
            if ("combo".equals(type) || "all".equals(type) || type == null) {
                List<ComboEntity> combos = getCombosInternal(branchId, categoryId, search);
                if (combos != null) {
                    allItems.addAll(clientMenuMapper.toClientComboDTOList(combos));
                }
            }

            // Tính tổng số items
            long totalElements = allItems.size();

            return new PageImpl<>(allItems, finalPageable, totalElements);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching menu items for branch: {}", branchId, e);
            throw new RuntimeException("Failed to fetch menu items: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy filter snapshot cho branch
     */
    @Transactional(readOnly = true)
    public ClientMenuFilterDTO getMenuFilters(Long branchId) {
        log.info("Fetching menu filters for branch: {}", branchId);

        // Kiểm tra branch có tồn tại và active không
        if (!isBranchActive(branchId)) {
            throw new IllegalArgumentException("Branch not found or not active: " + branchId);
        }

        // Lấy categories với số lượng items theo branch
        List<ClientCategoryWithCountsDTO> categoriesWithCounts = getBranchScopedCategories(branchId, "all", true, false,
                null);

        // Convert to ClientCategoryDTO for backward compatibility
        List<ClientCategoryDTO> categories = categoriesWithCounts.stream()
                .map(cat -> ClientCategoryDTO.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .description(cat.getDescription())
                        .status(cat.getStatus())
                        .operationalStatus(cat.getOperationalStatus())
                        .slug(cat.getSlug())
                        .imageUrl(cat.getImageUrl())
                        .foodCount(cat.getFoodCount())
                        .comboCount(cat.getComboCount())
                        .totalCount(cat.getTotalCount())
                        .itemCount(cat.getTotalCount()) // Legacy field
                        .build())
                .collect(Collectors.toList());

        // Tính tổng số items theo type - sử dụng branch-scoped data
        Map<String, Integer> itemCounts = new HashMap<>();

        // Lấy dishes và combos theo branch
        List<DishEntity> branchDishes = getDishesInternal(branchId, null, null);
        List<ComboEntity> branchCombos = getCombosInternal(branchId, null, null);

        itemCounts.put("food", branchDishes.size());
        itemCounts.put("combo", branchCombos.size());

        int totalItems = itemCounts.values().stream().mapToInt(Integer::intValue).sum();

        return ClientMenuFilterDTO.builder()
                .categories(categories)
                .itemCounts(itemCounts)
                .totalItems(totalItems)
                .totalCategories(categories.size())
                .build();
    }

    /**
     * Lấy chi tiết một item
     */
    @Transactional(readOnly = true)
    public ClientMenuItemDTO getMenuItem(Long itemId, String type) {
        log.info("Fetching menu item: {} of type: {}", itemId, type);

        if ("food".equals(type)) {
            DishEntity dish = dishRepository.findById(itemId)
                    .filter(d -> ItemAvailabilityStatus.AVAILABLE.equals(d.getAvailabilityStatus()))
                    .orElseThrow(() -> new IllegalArgumentException("Dish not found or not approved: " + itemId));
            return clientMenuMapper.toClientMenuItemDTO(dish);
        } else if ("combo".equals(type)) {
            ComboEntity combo = comboRepository.findById(itemId)
                    .orElseThrow(() -> new IllegalArgumentException("Combo not found: " + itemId));
            return clientMenuMapper.toClientMenuItemDTO(combo);
        } else {
            throw new IllegalArgumentException("Invalid item type: " + type);
        }
    }

    /**
     * Lấy featured items (top 10 theo popularity hoặc mới nhất)
     */
    @Transactional(readOnly = true)
    public List<ClientMenuItemDTO> getFeaturedItems(Long branchId) {
        log.info("Fetching featured items for branch: {}", branchId);

        if (!isBranchActive(branchId)) {
            throw new IllegalArgumentException("Branch not found or not active: " + branchId);
        }

        List<ClientMenuItemDTO> featuredItems = new ArrayList<>();

        // Lấy dishes theo branch (top 10)
        List<DishEntity> branchDishes = getDishesInternal(branchId, null, null);
        List<DishEntity> featuredDishes = branchDishes.stream()
                .limit(10)
                .collect(Collectors.toList());
        featuredItems.addAll(clientMenuMapper.toClientMenuItemDTOList(featuredDishes));

        // Lấy combos theo branch (top 10)
        List<ComboEntity> branchCombos = getCombosInternal(branchId, null, null);
        List<ComboEntity> featuredCombos = branchCombos.stream()
                .limit(10)
                .collect(Collectors.toList());
        featuredItems.addAll(clientMenuMapper.toClientComboDTOList(featuredCombos));

        return featuredItems;
    }

    /**
     * Lấy combos theo branch và filter
     */
    @Transactional(readOnly = true)
    public Page<ClientMenuItemDTO> getCombos(Long branchId, Long categoryId, String search, Pageable pageable) {
        log.info("Fetching combos for branch: {}, category: {}, search: {}", branchId, categoryId, search);

        try {
            // Kiểm tra branch có tồn tại và active không
            if (!isBranchActive(branchId)) {
                throw new IllegalArgumentException("Branch not found or not active: " + branchId);
            }

            // Tạo pageable với sort mặc định
            Pageable finalPageable = createPageableWithDefaultSort(pageable);

            // Lấy combos
            List<ComboEntity> combos = getCombosInternal(branchId, categoryId, search);

            if (combos == null) {
                log.warn("No combos found for branch: {}", branchId);
                return new PageImpl<>(new ArrayList<>(), finalPageable, 0);
            }

            List<ClientMenuItemDTO> comboDTOs = clientMenuMapper.toClientComboDTOList(combos);

            // Tính tổng số combos
            long totalElements = combos.size();

            return new PageImpl<>(comboDTOs, finalPageable, totalElements);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching combos for branch: {}", branchId, e);
            throw new RuntimeException("Failed to fetch combos: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy dishes theo branch và filter
     */
    @Transactional(readOnly = true)
    public Page<ClientMenuItemDTO> getDishes(Long branchId, Long categoryId, String search, Pageable pageable) {
        log.info("Fetching dishes for branch: {}, category: {}, search: {}", branchId, categoryId, search);

        try {
            // Kiểm tra branch có tồn tại và active không
            if (!isBranchActive(branchId)) {
                throw new IllegalArgumentException("Branch not found or not active: " + branchId);
            }

            // Tạo pageable với sort mặc định
            Pageable finalPageable = createPageableWithDefaultSort(pageable);

            // Lấy dishes
            List<DishEntity> dishes = getDishesInternal(branchId, categoryId, search);

            if (dishes == null) {
                log.warn("No dishes found for branch: {}", branchId);
                return new PageImpl<>(new ArrayList<>(), finalPageable, 0);
            }

            List<ClientMenuItemDTO> dishDTOs = clientMenuMapper.toClientMenuItemDTOList(dishes);

            // Tính tổng số dishes
            long totalElements = dishes.size();

            return new PageImpl<>(dishDTOs, finalPageable, totalElements);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching dishes for branch: {}", branchId, e);
            throw new RuntimeException("Failed to fetch dishes: " + e.getMessage(), e);
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    private boolean isBranchActive(Long branchId) {
        return branchRepository.findById(branchId)
                .map(branch -> BranchStatus.OPEN.equals(branch.getStatus()))
                .orElse(false);
    }

    private Pageable createPageableWithDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }

        // Sort mặc định: newest first
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSort);
    }

    private List<DishEntity> getDishesInternal(Long branchId, Long categoryId, String search) {
        try {
            log.info("getDishesInternal called with branchId: {}, categoryId: {}, search: {}", branchId, categoryId,
                    search);

            // Lấy dishes theo branchId
            List<DishEntity> branchDishes = dishRepository.findByBranchId(branchId).stream()
                    .filter(dish -> dish.getAvailabilityStatus() != null && ItemAvailabilityStatus.AVAILABLE.equals(dish.getAvailabilityStatus()))
                    .filter(dish -> categoryId == null || (dish.getCategory() != null && categoryId.equals(dish.getCategory().getId())))
                    .filter(dish -> search == null || search.isEmpty() || 
                            (dish.getName() != null && dish.getName().toLowerCase().contains(search.toLowerCase())))
                    .collect(Collectors.toList());

            log.info("Found {} dishes for branch: {} (simplified approach)", branchDishes.size(), branchId);
            return branchDishes;
        } catch (Exception e) {
            log.error("Error fetching menu dishes for branch: {}", branchId, e);
            return new ArrayList<>();
        }
    }

    private List<ComboEntity> getCombosInternal(Long branchId, Long categoryId, String search) {
        try {
            log.info("getCombosInternal called with branchId: {}, categoryId: {}, search: {}", branchId, categoryId,
                    search);

            // Lấy combos theo branch (kiến trúc mới: combo có branch_id trực tiếp)
            List<ComboEntity> branchCombos = comboRepository.findByBranchId(branchId).stream()
                    .filter(combo -> ItemAvailabilityStatus.AVAILABLE.equals(combo.getAvailabilityStatus()) &&
                            (search == null || search.isEmpty() ||
                                    (combo.getName() != null &&
                                            combo.getName().toLowerCase().contains(search.toLowerCase()))))
                    .collect(Collectors.toList());

            log.info("Found {} combos for branch: {} (filtered from menu relationships)", branchCombos.size(),
                    branchId);
            return branchCombos;
        } catch (Exception e) {
            log.error("Error fetching combos for branch: {}", branchId, e);
            return new ArrayList<>();
        }
    }

    private ClientCategoryDTO enrichCategoryWithCounts(CategoryEntity category) {
        // Đếm số dishes và combos trong category này theo branch
        // TODO: This method should be updated to accept branchId parameter
        // For now, we'll use a simplified approach

        int foodCount = (int) dishRepository.findByAvailabilityStatus(
            ItemAvailabilityStatus.AVAILABLE).stream()
                .filter(dish -> dish.getCategory() != null && category.getId().equals(dish.getCategory().getId()))
                .count();
        int comboCount = 0; // Tạm thời hardcode, cần thêm category relationship cho combo
        int totalCount = foodCount + comboCount;

        ClientCategoryDTO dto = clientMenuMapper.toClientCategoryDTO(category);
        dto.setFoodCount(foodCount);
        dto.setComboCount(comboCount);
        dto.setTotalCount(totalCount);

        return dto;
    }

    /**
     * Count dishes in a specific category that are available in a specific branch
     */
    private Integer countDishesInCategoryForBranch(Long categoryId, Long branchId) {
        try {
            // Lấy dishes trong category và branch cụ thể
            List<DishEntity> dishesInCategory = getDishesInternal(branchId, categoryId, null);
            return dishesInCategory.size();
        } catch (Exception e) {
            log.warn("Error counting dishes in category {} for branch {}", categoryId, branchId, e);
            return 0;
        }
    }

    /**
     * Count combos in a specific category that are available in a specific branch
     */
    private Integer countCombosInCategoryForBranch(Long categoryId, Long branchId) {
        try {
            // Lấy combos trong branch cụ thể
            // TODO: Implement proper category relationship for combos
            List<ComboEntity> branchCombos = getCombosInternal(branchId, null, null);
            return branchCombos.size();
        } catch (Exception e) {
            log.warn("Error counting combos in category {} for branch {}", categoryId, branchId, e);
            return 0;
        }
    }

    /**
     * Check if a dish is available in a specific branch
     */
    private boolean isDishAvailableInBranch(Long dishId, Long branchId) {
        try {
            // Check if the dish is available in the branch (kiến trúc mới: dish có branch_id trực tiếp)
            Optional<DishEntity> dish = dishRepository.findById(dishId);
            if (dish.isPresent() && dish.get().getBranch().getId().equals(branchId)) {
                return true; // Dish is available in this branch
            }
            return false; // Dish not found in this branch
        } catch (Exception e) {
            log.warn("Error checking dish {} availability in branch {}", dishId, branchId, e);
            return false;
        }
    }

    /**
     * Check if a combo is available in a specific branch
     */
    private boolean isComboAvailableInBranch(Long comboId, Long branchId) {
        try {
            // Check if the combo is available in the branch (kiến trúc mới: combo có branch_id trực tiếp)
            Optional<ComboEntity> combo = comboRepository.findById(comboId);
            if (combo.isPresent() && combo.get().getBranch().getId().equals(branchId)) {
                return true; // Combo is available in this branch
            }
            return false; // Combo not found in this branch
        } catch (Exception e) {
            log.warn("Error checking combo {} availability in branch {}", comboId, branchId, e);
            return false;
        }
    }

    /**
     * Lấy 3 món ăn đặc trưng của chi nhánh 1 cho trang home
     * Ưu tiên món ăn có popularity cao và status APPROVED
     */
    @Transactional(readOnly = true)
    public List<ClientMenuItemDTO> getFeaturedMenuItemsForHome() {
        log.info("Fetching featured menu items for home page from branch 1");

        try {
            // Lấy dishes từ chi nhánh 1
            List<DishEntity> branchDishes = dishRepository.findByBranchId(1L);

            // Lấy combos từ chi nhánh 1
            List<ComboEntity> branchCombos = comboRepository.findByBranchId(1L);

            List<ClientMenuItemDTO> featuredItems = new ArrayList<>();

            // Sắp xếp dishes theo createdAt giảm dần (món mới nhất) và lấy 3 món đầu tiên
            List<DishEntity> sortedDishes = branchDishes.stream()
                    .sorted((d1, d2) -> {
                        if (d1.getCreatedAt() == null && d2.getCreatedAt() == null)
                            return 0;
                        if (d1.getCreatedAt() == null)
                            return 1;
                        if (d2.getCreatedAt() == null)
                            return -1;
                        return d2.getCreatedAt().compareTo(d1.getCreatedAt()); // Giảm dần
                    })
                    .limit(3)
                    .collect(Collectors.toList());

            // Thêm dishes vào danh sách
            for (DishEntity dish : sortedDishes) {
                ClientMenuItemDTO item = clientMenuMapper.toClientMenuItemDTO(dish);
                item.setType("food");
                item.setBranchId(1L);
                item.setBranchName("Chi nhánh 1");
                featuredItems.add(item);
            }

            // Nếu chưa đủ 3 items, thêm combos
            if (featuredItems.size() < 3) {
                List<ComboEntity> sortedCombos = branchCombos.stream()
                        .sorted((c1, c2) -> {
                            if (c1.getCreatedAt() == null && c2.getCreatedAt() == null)
                                return 0;
                            if (c1.getCreatedAt() == null)
                                return 1;
                            if (c2.getCreatedAt() == null)
                                return -1;
                            return c2.getCreatedAt().compareTo(c1.getCreatedAt()); // Giảm dần
                        })
                        .limit(3 - featuredItems.size())
                        .collect(Collectors.toList());

                for (ComboEntity combo : sortedCombos) {
                    ClientMenuItemDTO item = clientMenuMapper.toClientMenuItemDTO(combo);
                    item.setType("combo");
                    item.setBranchId(1L);
                    item.setBranchName("Chi nhánh 1");
                    featuredItems.add(item);
                }
            }

            log.info("Found {} featured menu items for home page", featuredItems.size());
            return featuredItems;

        } catch (Exception e) {
            log.error("Error fetching featured menu items for home page", e);
            throw new RuntimeException("Failed to fetch featured menu items", e);
        }
    }
}