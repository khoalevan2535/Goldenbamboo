package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.ComboRequestDTO;
import com.poly.restaurant.dtos.ComboResponseDTO;
import com.poly.restaurant.entities.ComboEntity;
import com.poly.restaurant.entities.ComboDishEntity;
import com.poly.restaurant.dtos.ComboDishResponseDTO;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class ComboMapper {

    public ComboEntity toEntity(ComboRequestDTO dto) {
        if (dto == null) return null;
        ComboEntity entity = new ComboEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setBasePrice(dto.getBasePrice());
        // createdBy và status sẽ được set trong Service
        return entity;
    }

    public void updateEntityFromDto(ComboRequestDTO dto, ComboEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setBasePrice(dto.getBasePrice());
    }

    public ComboResponseDTO toResponseDTO(ComboEntity entity) {
        if (entity == null) return null;
        ComboResponseDTO dto = new ComboResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setImage(entity.getImage());
        dto.setDescription(entity.getDescription());
        dto.setBasePrice(entity.getBasePrice());
        dto.setAvailabilityStatus(entity.getAvailabilityStatus());
        dto.setManualAvailabilityOverride(entity.getManualAvailabilityOverride());
        // Map discount fields từ quan hệ 1:1
        if (entity.getDiscount() != null && entity.getBasePrice() != null && entity.getDiscount().getNewPrice() != null) {
            dto.setDiscountPercentage(BigDecimal.ZERO); // Không dùng percentage nữa
            dto.setDiscountAmount(entity.getBasePrice().subtract(entity.getDiscount().getNewPrice()));
            dto.setDiscountStartDate(entity.getDiscount().getStartDate());
            dto.setDiscountEndDate(entity.getDiscount().getEndDate());
            // ACTIVE và EXPIRING đều hiển thị giá giảm cho khách order
            dto.setDiscountActive(entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE ||
                                 entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.EXPIRING);
            dto.setFinalPrice(entity.getDiscount().getNewPrice());
        } else {
            dto.setDiscountPercentage(BigDecimal.ZERO);
            dto.setDiscountAmount(BigDecimal.ZERO);
            dto.setDiscountStartDate(null);
            dto.setDiscountEndDate(null);
            dto.setDiscountActive(false);
            dto.setFinalPrice(entity.getBasePrice());
        }
        // Safe access to branch to avoid LazyInitializationException
        try {
            dto.setBranchId(entity.getBranch() != null ? entity.getBranch().getId() : null);
            dto.setBranchName(entity.getBranch() != null ? entity.getBranch().getName() : null);
        } catch (Exception e) {
            // If branch is lazy-loaded and session is closed, set null values
            dto.setBranchId(null);
            dto.setBranchName(null);
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Comment out comboDishes mapping to avoid LazyInitializationException
        // Staff API doesn't need detailed combo dishes information
        // if (entity.getComboDishes() != null) {
        //     dto.setComboDishes(entity.getComboDishes().stream()
        //             .map(this::toComboDishResponseDTO)
        //             .collect(Collectors.toList()));
        // }
        return dto;
    }

    public ComboDishResponseDTO toComboDishResponseDTO(ComboDishEntity comboDish) {
        if (comboDish == null) return null;
        ComboDishResponseDTO dto = new ComboDishResponseDTO();
        dto.setDishId(comboDish.getDish().getId());
        dto.setDishName(comboDish.getDish().getName());
        dto.setQuantity(comboDish.getQuantity());
        dto.setBasePrice(comboDish.getDish().getBasePrice());
        dto.setAvailabilityStatus(comboDish.getDish().getAvailabilityStatus()); // Thêm trạng thái món ăn
        return dto;
    }
} 