package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.RoleResponseDTO;
import com.poly.restaurant.entities.RoleEntity;
import java.util.ArrayList;
import java.util.List;

public class RoleMapper {
    public static RoleResponseDTO toResponseDto(RoleEntity entity) {
        if (entity == null) return null;
        return new RoleResponseDTO(entity.getId(), entity.getName());
    }

    public static List<RoleResponseDTO> toResponseDtoList(List<RoleEntity> entities) {
        if (entities == null) return new ArrayList<>();
        List<RoleResponseDTO> list = new ArrayList<>();
        for (RoleEntity entity : entities) {
            list.add(toResponseDto(entity));
        }
        return list;
    }
} 