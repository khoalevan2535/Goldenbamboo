package com.poly.restaurant.services;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.entities.*;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import com.poly.restaurant.entities.enums.BranchStatus;
import com.poly.restaurant.repositories.*;
import com.poly.restaurant.mappers.ClientMenuMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// Removed cache import
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedMenuService {

    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;
    private final ClientMenuMapper clientMenuMapper;

    /**
     * Lấy danh sách chi nhánh active với caching
     */
    // Removed cache annotation
    @Transactional(readOnly = true)
    public List<ClientBranchDTO> getActiveBranches() {
        log.info("Fetching active branches with caching");

        List<BranchEntity> branches = branchRepository.findByStatus(BranchStatus.OPEN);
        return clientMenuMapper.toClientBranchDTOList(branches);
    }

    /**
     * Lấy danh sách category với counts và caching
     */
    // Removed cache annotation
    @Transactional(readOnly = true)
    public List<ClientCategoryWithCountsDTO> getBranchScopedCategories(
            Long branchId, String type, Boolean includeCounts, Boolean showEmpty, String search) {
        
        log.info("Fetching branch-scoped categories for branch: {}, type: {}, includeCounts: {}, showEmpty: {}, search: {}",
                branchId, type, includeCounts, showEmpty, search);

        // Validate branch
        validateBranch(branchId);

        // Get categories with counts
        List<ClientCategoryWithCountsDTO> categories = getCategoriesWithCounts(branchId, type, includeCounts, showEmpty, search);
        
        log.info("Found {} categories for branch: {}", categories.size(), branchId);
        return categories;
    }

    /**
     * Lấy menu items với pagination và caching
     */
    @Transactional(readOnly = true)
    public Page<ClientMenuItemDTO> getMenuItems(
            Long branchId, Long categoryId, String type, String search, Pageable pageable) {
        
        log.info("Fetching menu items for branch: {}, category: {}, type: {}, search: {}, page: {}, size: {}",
                branchId, categoryId, type, search, pageable.getPageNumber(), pageable.getPageSize());

        // Validate inputs
        validateBranch(branchId);
        validateType(type);
        validatePageable(pageable);

        // Get items based on type
        List<ClientMenuItemDTO> allItems = new ArrayList<>();
        
        if ("food".equals(type) || "all".equals(type) || type == null) {
            List<DishEntity> dishes = getDishesWithFilters(branchId, categoryId, search);
            allItems.addAll(clientMenuMapper.toClientMenuItemDTOList(dishes));
        }

        if ("combo".equals(type) || "all".equals(type) || type == null) {
            List<ComboEntity> combos = getCombosWithFilters(branchId, categoryId, search);
            allItems.addAll(clientMenuMapper.toClientComboDTOList(combos));
        }

        // Apply sorting
        applySorting(allItems, pageable.getSort());

        // Apply pagination
        return createPaginatedResult(allItems, pageable);
    }

    /**
     * Lấy featured items với caching
     */
    // Removed cache annotation
    @Transactional(readOnly = true)
    public List<ClientMenuItemDTO> getFeaturedItems(Long branchId) {
        log.info("Fetching featured items for branch: {}", branchId);

        validateBranch(branchId);

        List<ClientMenuItemDTO> featuredItems = new ArrayList<>();

        // Get top dishes by popularity or newest
        List<DishEntity> featuredDishes = getFeaturedDishes(branchId);
        featuredItems.addAll(clientMenuMapper.toClientMenuItemDTOList(featuredDishes));

        // Get top combos by popularity or newest
        List<ComboEntity> featuredCombos = getFeaturedCombos(branchId);
        featuredItems.addAll(clientMenuMapper.toClientComboDTOList(featuredCombos));

        // Sort by creation date and limit to 10
        featuredItems.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return featuredItems.stream().limit(10).collect(Collectors.toList());
    }

    /**
     * Lấy menu filters với caching
     */
    // Removed cache annotation
    @Transactional(readOnly = true)
    public ClientMenuFilterDTO getMenuFilters(Long branchId) {
        log.info("Fetching menu filters for branch: {}", branchId);

        validateBranch(branchId);

        // Get categories with counts
        List<ClientCategoryWithCountsDTO> categoriesWithCounts = getCategoriesWithCounts(
                branchId, "all", true, false, null);

        // Convert to ClientCategoryDTO
        List<ClientCategoryDTO> categories = categoriesWithCounts.stream()
                .map(this::convertToClientCategoryDTO)
                .collect(Collectors.toList());

        // Calculate item counts
        Map<String, Integer> itemCounts = calculateItemCounts(branchId);

        int totalItems = itemCounts.values().stream().mapToInt(Integer::intValue).sum();

        return ClientMenuFilterDTO.builder()
                .categories(categories)
                .itemCounts(itemCounts)
                .totalItems(totalItems)
                .totalCategories(categories.size())
                .build();
    }

    /**
     * Lấy chi tiết menu item
     */
    @Transactional(readOnly = true)
    public ClientMenuItemDTO getMenuItem(Long itemId, String type) {
        log.info("Fetching menu item: {} of type: {}", itemId, type);

        validateType(type);

        if ("food".equals(type)) {
            DishEntity dish = dishRepository.findById(itemId)
                    .filter(d -> ItemAvailabilityStatus.AVAILABLE.equals(d.getAvailabilityStatus()))
                    .orElseThrow(() -> new IllegalArgumentException("Dish not found or not available: " + itemId));
            return clientMenuMapper.toClientMenuItemDTO(dish);
        } else if ("combo".equals(type)) {
            ComboEntity combo = comboRepository.findById(itemId)
                    .filter(c -> ItemAvailabilityStatus.AVAILABLE.equals(c.getAvailabilityStatus()))
                    .orElseThrow(() -> new IllegalArgumentException("Combo not found or not available: " + itemId));
            return clientMenuMapper.toClientMenuItemDTO(combo);
        } else {
            throw new IllegalArgumentException("Invalid item type: " + type);
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    private void validateBranch(Long branchId) {
        if (branchId == null) {
            throw new IllegalArgumentException("Branch ID is required");
        }
        
        boolean branchExists = branchRepository.findById(branchId)
                .map(branch -> BranchStatus.OPEN.equals(branch.getStatus()))
                .orElse(false);
        
        if (!branchExists) {
            throw new IllegalArgumentException("Branch not found or not active: " + branchId);
        }
    }

    private void validateType(String type) {
        if (type != null && !isValidType(type)) {
            throw new IllegalArgumentException("Invalid type: " + type);
        }
    }

    private boolean isValidType(String type) {
        return "food".equals(type) || "combo".equals(type) || "all".equals(type);
    }

    private void validatePageable(Pageable pageable) {
        if (pageable.getPageSize() > 100) {
            throw new IllegalArgumentException("Page size cannot exceed 100");
        }
    }

    private List<ClientCategoryWithCountsDTO> getCategoriesWithCounts(
            Long branchId, String type, Boolean includeCounts, Boolean showEmpty, String search) {
        
        List<CategoryEntity> allCategories = categoryRepository.findAll().stream()
                .filter(category -> "ACTIVE".equals(category.getStatus()))
                .collect(Collectors.toList());

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allCategories = allCategories.stream()
                    .filter(category -> category.getName() != null &&
                            category.getName().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        List<ClientCategoryWithCountsDTO> result = new ArrayList<>();

        for (CategoryEntity category : allCategories) {
            Integer foodCount = null;
            Integer comboCount = null;

            if (includeCounts != null && includeCounts) {
                if ("food".equals(type) || "all".equals(type) || type == null) {
                    foodCount = countDishesInCategoryForBranch(category.getId(), branchId);
                }
                if ("combo".equals(type) || "all".equals(type) || type == null) {
                    comboCount = countCombosInCategoryForBranch(category.getId(), branchId);
                }
            }

            int totalCount = (foodCount != null ? foodCount : 0) + (comboCount != null ? comboCount : 0);

            if (showEmpty != null && !showEmpty && totalCount == 0) {
                continue;
            }

            ClientCategoryWithCountsDTO categoryDTO = clientMenuMapper.toClientCategoryWithCountsDTO(
                    category, branchId, foodCount, comboCount);
            result.add(categoryDTO);
        }

        return result;
    }

    private List<DishEntity> getDishesWithFilters(Long branchId, Long categoryId, String search) {
        return dishRepository.findByBranchId(branchId).stream()
                .filter(dish -> ItemAvailabilityStatus.AVAILABLE.equals(dish.getAvailabilityStatus()) &&
                        (categoryId == null || (dish.getCategory() != null && categoryId.equals(dish.getCategory().getId()))) &&
                        (search == null || search.isEmpty() || 
                                (dish.getName() != null && dish.getName().toLowerCase().contains(search.toLowerCase()))))
                .collect(Collectors.toList());
    }

    private List<ComboEntity> getCombosWithFilters(Long branchId, Long categoryId, String search) {
        return comboRepository.findByBranchId(branchId).stream()
                .filter(combo -> ItemAvailabilityStatus.AVAILABLE.equals(combo.getAvailabilityStatus()) &&
                        (search == null || search.isEmpty() || 
                                (combo.getName() != null && combo.getName().toLowerCase().contains(search.toLowerCase()))))
                .collect(Collectors.toList());
    }

    private List<DishEntity> getFeaturedDishes(Long branchId) {
        return dishRepository.findByBranchId(branchId).stream()
                .filter(dish -> ItemAvailabilityStatus.AVAILABLE.equals(dish.getAvailabilityStatus()))
                .sorted((d1, d2) -> {
                    if (d1.getCreatedAt() == null && d2.getCreatedAt() == null) return 0;
                    if (d1.getCreatedAt() == null) return 1;
                    if (d2.getCreatedAt() == null) return -1;
                    return d2.getCreatedAt().compareTo(d1.getCreatedAt());
                })
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<ComboEntity> getFeaturedCombos(Long branchId) {
        return comboRepository.findByBranchId(branchId).stream()
                .filter(combo -> ItemAvailabilityStatus.AVAILABLE.equals(combo.getAvailabilityStatus()))
                .sorted((c1, c2) -> {
                    if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
                    if (c1.getCreatedAt() == null) return 1;
                    if (c2.getCreatedAt() == null) return -1;
                    return c2.getCreatedAt().compareTo(c1.getCreatedAt());
                })
                .limit(5)
                .collect(Collectors.toList());
    }

    private void applySorting(List<ClientMenuItemDTO> items, Sort sort) {
        if (sort.isSorted()) {
            items.sort((a, b) -> {
                for (Sort.Order order : sort) {
                    int comparison = compareItems(a, b, order.getProperty(), order.getDirection());
                    if (comparison != 0) {
                        return order.getDirection() == Sort.Direction.ASC ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }
    }

    private int compareItems(ClientMenuItemDTO a, ClientMenuItemDTO b, String property, Sort.Direction direction) {
        switch (property) {
            case "price":
                return a.getPrice().compareTo(b.getPrice());
            case "createdAt":
                if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                if (a.getCreatedAt() == null) return 1;
                if (b.getCreatedAt() == null) return -1;
                return a.getCreatedAt().compareTo(b.getCreatedAt());
            case "name":
                return a.getName().compareTo(b.getName());
            default:
                return 0;
        }
    }

    private Page<ClientMenuItemDTO> createPaginatedResult(List<ClientMenuItemDTO> items, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), items.size());
        
        if (start >= items.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, items.size());
        }
        
        List<ClientMenuItemDTO> pageContent = items.subList(start, end);
        return new PageImpl<>(pageContent, pageable, items.size());
    }

    private ClientCategoryDTO convertToClientCategoryDTO(ClientCategoryWithCountsDTO categoryWithCounts) {
        return ClientCategoryDTO.builder()
                .id(categoryWithCounts.getId())
                .name(categoryWithCounts.getName())
                .description(categoryWithCounts.getDescription())
                .status(categoryWithCounts.getStatus())
                .operationalStatus(categoryWithCounts.getOperationalStatus())
                .slug(categoryWithCounts.getSlug())
                .imageUrl(categoryWithCounts.getImageUrl())
                .foodCount(categoryWithCounts.getFoodCount())
                .comboCount(categoryWithCounts.getComboCount())
                .totalCount(categoryWithCounts.getTotalCount())
                .build();
    }

    private Map<String, Integer> calculateItemCounts(Long branchId) {
        Map<String, Integer> itemCounts = new HashMap<>();
        
        List<DishEntity> dishes = getDishesWithFilters(branchId, null, null);
        List<ComboEntity> combos = getCombosWithFilters(branchId, null, null);
        
        itemCounts.put("food", dishes.size());
        itemCounts.put("combo", combos.size());
        
        return itemCounts;
    }

    private Integer countDishesInCategoryForBranch(Long categoryId, Long branchId) {
        return getDishesWithFilters(branchId, categoryId, null).size();
    }

    private Integer countCombosInCategoryForBranch(Long categoryId, Long branchId) {
        // Note: Combos don't have category relationship in current schema
        // This is a placeholder for future implementation
        return getCombosWithFilters(branchId, null, null).size();
    }
}
