package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.DishRequestDTO;
import com.poly.restaurant.dtos.DishResponseDTO;
import com.poly.restaurant.entities.DishEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DishMapper {

    public static DishEntity toEntity(DishRequestDTO dto) {
        if (dto == null) return null;
        DishEntity entity = new DishEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setBasePrice(dto.getBasePrice());
        
        // Không cần mapping discount fields nữa vì đã chuyển sang quan hệ 1:1
        
        // image sẽ được xử lý và set trong DishService sau khi upload
        return entity;
    }

    public static DishResponseDTO toResponseDTO(DishEntity entity) {
        if (entity == null) return null;
        DishResponseDTO dto = new DishResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setImage(entity.getImage()); // Trả về URL ảnh từ entity
        dto.setDescription(entity.getDescription());
        dto.setBasePrice(entity.getBasePrice());
        dto.setAvailabilityStatus(entity.getAvailabilityStatus());
        dto.setBranchId(entity.getBranch() != null ? entity.getBranch().getId() : null);
        dto.setBranchName(entity.getBranch() != null ? entity.getBranch().getName() : null);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }
        
        // Thêm mapping cho discount fields
        // Mapping discount từ quan hệ 1:1
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
        
        // Optional: inUse flag sẽ được set ở service layer nếu cần batch fill
        return dto;
    }

    public static void updateEntityFromDto(DishRequestDTO dto, DishEntity entity) {
        if (dto == null || entity == null) return;
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getBasePrice() != null) entity.setBasePrice(dto.getBasePrice());
        
        // Không cần update discount fields nữa vì đã chuyển sang quan hệ 1:1
        
        // image sẽ được xử lý và set riêng trong Service (nếu có file mới)
    }

    /**
     * Tính toán giá cuối cùng sau khi áp dụng giảm giá (từ quan hệ 1:1)
     */
    private static BigDecimal calculateFinalPrice(DishEntity entity) {
        if (entity == null || entity.getBasePrice() == null) {
            return BigDecimal.ZERO;
        }
        
        // Nếu có discount và đang active, trả về giá mới
        if (entity.getDiscount() != null && 
            entity.getDiscount().getStatus() == com.poly.restaurant.entities.enums.DiscountStatus.ACTIVE) {
            LocalDateTime now = LocalDateTime.now();
            
            // Kiểm tra thời gian discount
            boolean isInDiscountPeriod = true;
            if (entity.getDiscount().getStartDate() != null && now.isBefore(entity.getDiscount().getStartDate())) {
                isInDiscountPeriod = false;
            }
            if (entity.getDiscount().getEndDate() != null && now.isAfter(entity.getDiscount().getEndDate())) {
                isInDiscountPeriod = false;
            }
            
            if (isInDiscountPeriod) {
                return entity.getDiscount().getNewPrice();
            }
        }
        
        // Trả về giá gốc nếu không có discount hoặc discount không active
        return entity.getBasePrice();
    }
}
