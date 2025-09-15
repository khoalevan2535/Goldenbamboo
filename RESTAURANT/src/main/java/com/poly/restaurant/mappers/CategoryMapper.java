package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.CategoryRequestDTO;
import com.poly.restaurant.dtos.CategoryResponseDTO;
import com.poly.restaurant.entities.CategoryEntity;
import java.util.ArrayList;
import java.util.List;

public class CategoryMapper {
    public static CategoryEntity toEntity(CategoryRequestDTO dto) {
        if (dto == null) return null;
        CategoryEntity entity = new CategoryEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        // createdBy sẽ được set trong Service
        return entity;
    }

    public static CategoryResponseDTO toResponseDto(CategoryEntity entity) {
        if (entity == null) return null;
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setBranchId(entity.getBranch() != null ? entity.getBranch().getId() : null);
        dto.setBranchName(entity.getBranch() != null ? entity.getBranch().getName() : null); 
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        // inUse sẽ được set ở service (tránh query n+1 tại mapper)
        return dto;
    }

    public static List<CategoryResponseDTO> toResponseDtoList(List<CategoryEntity> entities) {
        if (entities == null) return new ArrayList<>();
        List<CategoryResponseDTO> list = new ArrayList<>();
        for (CategoryEntity entity : entities) {
            list.add(toResponseDto(entity));
        }
        return list;
    }

    public static void updateEntityFromDto(CategoryRequestDTO dto, CategoryEntity entity) {
        if (dto == null || entity == null) return;
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        // Không cập nhật createdBy khi update
    }
} 