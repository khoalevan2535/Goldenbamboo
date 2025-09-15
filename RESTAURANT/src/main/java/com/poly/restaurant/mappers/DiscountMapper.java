package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.DiscountRequestDTO;
import com.poly.restaurant.dtos.DiscountResponseDTO;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.entities.enums.DiscountStatus;
import java.util.ArrayList;
import java.util.List;

public class DiscountMapper {
    public static DiscountEntity toEntity(DiscountRequestDTO dto) {
        if (dto == null) return null;
        DiscountEntity entity = new DiscountEntity();
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setNewPrice(dto.getNewPrice());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setStatus(DiscountStatus.ACTIVE); // hoặc lấy từ DTO nếu có
        entity.setDescription(dto.getDescription());
        entity.setDishId(dto.getDishId());
        entity.setComboId(dto.getComboId());
        entity.setType(dto.getType());
        return entity;
    }

    public static DiscountResponseDTO toResponseDto(DiscountEntity entity) {
        if (entity == null) {
            System.out.println("❌ DiscountMapper: Entity is null");
            return null;
        }
        
        System.out.println("🔄 DiscountMapper: Mapping entity ID " + entity.getId() + " - " + entity.getName());
        
        DiscountResponseDTO dto = new DiscountResponseDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setNewPrice(entity.getNewPrice());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
        dto.setDishId(entity.getDishId());
        dto.setComboId(entity.getComboId());
        dto.setType(entity.getType());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        System.out.println("📋 DiscountMapper: Basic fields mapped - ID: " + dto.getId() + ", Name: " + dto.getName());
        
        // Không cần map branches nữa vì đã bỏ
        
        System.out.println("✅ DiscountMapper: Entity " + entity.getId() + " mapped successfully");
        return dto;
    }

    public static List<DiscountResponseDTO> toResponseDtoList(List<DiscountEntity> entities) {
        if (entities == null) {
            System.out.println("❌ DiscountMapper: Entity list is null");
            return new ArrayList<>();
        }
        
        System.out.println("🔄 DiscountMapper: Mapping " + entities.size() + " entities");
        List<DiscountResponseDTO> list = new ArrayList<>();
        for (DiscountEntity entity : entities) {
            DiscountResponseDTO dto = toResponseDto(entity);
            if (dto != null) {
                list.add(dto);
            }
        }
        System.out.println("✅ DiscountMapper: Successfully mapped " + list.size() + " DTOs");
        return list;
    }

    public static void updateEntityFromDto(DiscountRequestDTO dto, DiscountEntity entity) {
        if (dto == null || entity == null) return;
        if (dto.getCode() != null) entity.setCode(dto.getCode());
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getNewPrice() != null) entity.setNewPrice(dto.getNewPrice());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getDishId() != null) entity.setDishId(dto.getDishId());
        if (dto.getComboId() != null) entity.setComboId(dto.getComboId());
        if (dto.getType() != null) entity.setType(dto.getType());
        // Không cập nhật status ở đây, hoặc có thể thêm nếu cần
    }
} 