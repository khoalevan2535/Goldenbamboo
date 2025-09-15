package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.CategoryEntity;
import com.poly.restaurant.entities.DishEntity;
import com.poly.restaurant.entities.ComboEntity;
import com.poly.restaurant.entities.enums.CategoryStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class ClientMenuMapper {

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.placeholder-image:/images/placeholder.jpg}")
    private String placeholderImage;

    public ClientBranchDTO toClientBranchDTO(BranchEntity entity) {
        if (entity == null)
            return null;

        return ClientBranchDTO.builder()
                .id(entity.getId())
                .name(entity.getName() != null ? entity.getName() : "")
                .address(entity.getAddress() != null ? entity.getAddress() : "")
                .phone(entity.getPhone() != null ? entity.getPhone() : "")
                .operationalStatus("ACTIVE") // Branch luôn active
                .build();
    }

    public ClientCategoryDTO toClientCategoryDTO(CategoryEntity entity) {
        if (entity == null)
            return null;

        return ClientCategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName() != null ? entity.getName() : "")
                .description(entity.getDescription() != null ? entity.getDescription() : "")
                .status(entity.getStatus() != null ? entity.getStatus() : CategoryStatus.ACTIVE)
                .slug(generateSlug(entity.getName()))
                .imageUrl(null) // TODO: Add category image support
                .foodCount(0) // Sẽ được cập nhật từ service
                .comboCount(0) // Sẽ được cập nhật từ service
                .totalCount(0) // Sẽ được cập nhật từ service
                .itemCount(0) // Legacy field
                .build();
    }

    public ClientCategoryWithCountsDTO toClientCategoryWithCountsDTO(CategoryEntity entity, Long branchId,
            Integer foodCount, Integer comboCount) {
        if (entity == null)
            return null;

        int totalCount = (foodCount != null ? foodCount : 0) + (comboCount != null ? comboCount : 0);
        boolean hasItems = totalCount > 0;

        return ClientCategoryWithCountsDTO.builder()
                .id(entity.getId())
                .name(entity.getName() != null ? entity.getName() : "")
                .description(entity.getDescription() != null ? entity.getDescription() : "")
                .status(entity.getStatus() != null ? entity.getStatus() : CategoryStatus.ACTIVE)
                .slug(generateSlug(entity.getName()))
                .imageUrl(null) // TODO: Add category image support
                .foodCount(foodCount != null ? foodCount : 0)
                .comboCount(comboCount != null ? comboCount : 0)
                .totalCount(totalCount)
                .hasItems(hasItems)
                .branchId(branchId != null ? branchId.toString() : null)
                .build();
    }

    /**
     * Generate URL-friendly slug from category name
     */
    private String generateSlug(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "";
        }
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .trim();
    }

    public ClientMenuItemDTO toClientMenuItemDTO(DishEntity entity) {
        if (entity == null)
            return null;

        // Tính toán discount giống DishMapper
        BigDecimal basePrice = entity.getBasePrice() != null ? entity.getBasePrice() : BigDecimal.ZERO;
        
        // Mapping discount từ quan hệ 1:1 giống DishMapper
        BigDecimal discountPercentage = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        LocalDateTime discountStartDate = null;
        LocalDateTime discountEndDate = null;
        Boolean discountActive = false;
        BigDecimal finalPrice = basePrice;
        
        if (entity.getDiscount() != null && entity.getBasePrice() != null && entity.getDiscount().getNewPrice() != null) {
            discountAmount = entity.getBasePrice().subtract(entity.getDiscount().getNewPrice());
            discountStartDate = entity.getDiscount().getStartDate();
            discountEndDate = entity.getDiscount().getEndDate();
            // ACTIVE và EXPIRING đều hiển thị giá giảm cho khách order
            discountActive = entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE ||
                           entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRING;
            finalPrice = entity.getDiscount().getNewPrice();
        }

        return ClientMenuItemDTO.builder()
                .id(entity.getId())
                .type("food")
                .name(entity.getName() != null ? entity.getName() : "")
                .description(entity.getDescription() != null ? entity.getDescription() : "")
                .price(basePrice)
                .basePrice(basePrice)
                .discountPercentage(discountPercentage)
                .discountAmount(discountAmount)
                .discountStartDate(discountStartDate)
                .discountEndDate(discountEndDate)
                .discountActive(discountActive)
                .finalPrice(finalPrice)
                .imageUrl(normalizeImageUrl(entity.getImage()))
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : 1L)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "Unknown")
                .branchId(1L) // Tạm thời hardcode, cần thêm branch relationship
                .branchName("Chi nhánh chính") // Tạm thời hardcode
                .available(entity.getAvailabilityStatus() != null &&
                          entity.getAvailabilityStatus().name().equals("AVAILABLE"))
                .status(entity.getAvailabilityStatus() != null ? entity.getAvailabilityStatus().name() : "UNKNOWN")
                .popularity(0) // Tạm thời hardcode
                .build();
    }


    public ClientMenuItemDTO toClientMenuItemDTO(ComboEntity entity) {
        if (entity == null)
            return null;

        // Tính toán discount cho combo giống DishMapper
        BigDecimal basePrice = entity.getBasePrice() != null ? entity.getBasePrice() : BigDecimal.ZERO;
        
        // Mapping discount từ quan hệ 1:1 giống DishMapper
        BigDecimal discountPercentage = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        LocalDateTime discountStartDate = null;
        LocalDateTime discountEndDate = null;
        Boolean discountActive = false;
        BigDecimal finalPrice = basePrice;
        
        if (entity.getDiscount() != null && entity.getBasePrice() != null && entity.getDiscount().getNewPrice() != null) {
            discountAmount = entity.getBasePrice().subtract(entity.getDiscount().getNewPrice());
            discountStartDate = entity.getDiscount().getStartDate();
            discountEndDate = entity.getDiscount().getEndDate();
            // ACTIVE và EXPIRING đều hiển thị giá giảm cho khách order
            discountActive = entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE ||
                           entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRING;
            finalPrice = entity.getDiscount().getNewPrice();
        }

        return ClientMenuItemDTO.builder()
                .id(entity.getId())
                .type("combo")
                .name(entity.getName() != null ? entity.getName() : "")
                .description(entity.getDescription() != null ? entity.getDescription() : "")
                .price(basePrice)
                .basePrice(basePrice)
                .discountPercentage(discountPercentage)
                .discountAmount(discountAmount)
                .discountStartDate(discountStartDate)
                .discountEndDate(discountEndDate)
                .discountActive(discountActive)
                .finalPrice(finalPrice)
                .imageUrl(normalizeImageUrl(entity.getImage()))
                .categoryId(1L) // Tạm thời hardcode, cần thêm category relationship
                .categoryName("Combo") // Tạm thời hardcode
                .branchId(1L) // Tạm thời hardcode, cần thêm branch relationship
                .branchName("Chi nhánh chính") // Tạm thời hardcode
                .available(entity.getAvailabilityStatus() != null &&
                          entity.getAvailabilityStatus().name().equals("AVAILABLE"))
                .status(entity.getAvailabilityStatus() != null ? entity.getAvailabilityStatus().name() : "UNKNOWN")
                .popularity(0) // Tạm thời hardcode
                .build();
    }

    public List<ClientBranchDTO> toClientBranchDTOList(List<BranchEntity> entities) {
        if (entities == null)
            return List.of();
        return entities.stream()
                .map(this::toClientBranchDTO)
                .collect(Collectors.toList());
    }

    public List<ClientCategoryDTO> toClientCategoryDTOList(List<CategoryEntity> entities) {
        if (entities == null)
            return List.of();
        return entities.stream()
                .map(this::toClientCategoryDTO)
                .collect(Collectors.toList());
    }

    public List<ClientMenuItemDTO> toClientMenuItemDTOList(List<DishEntity> dishes) {
        if (dishes == null)
            return List.of();
        return dishes.stream()
                .map(this::toClientMenuItemDTO)
                .collect(Collectors.toList());
    }


    public List<ClientMenuItemDTO> toClientComboDTOList(List<ComboEntity> combos) {
        if (combos == null)
            return List.of();
        return combos.stream()
                .map(this::toClientMenuItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * Chuẩn hóa image URL thành absolute URL
     */
    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return baseUrl + placeholderImage;
        }

        // Nếu đã là absolute URL
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }

        // Nếu là relative URL, thêm base URL
        if (imageUrl.startsWith("/")) {
            return baseUrl + imageUrl;
        }

        // Nếu không có slash, thêm slash
        return baseUrl + "/" + imageUrl;
    }
}
