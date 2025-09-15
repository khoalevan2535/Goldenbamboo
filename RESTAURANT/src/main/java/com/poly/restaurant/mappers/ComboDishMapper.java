package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.ComboItemDTO;
import com.poly.restaurant.dtos.ComboDishResponseDTO;
import com.poly.restaurant.entities.ComboDishEntity;
import com.poly.restaurant.entities.ComboEntity;
import com.poly.restaurant.entities.DishEntity;

public class ComboDishMapper {

    public static ComboDishEntity toEntity(ComboItemDTO dto, ComboEntity combo) {
        if (dto == null) return null;
        ComboDishEntity entity = new ComboDishEntity();
        
        DishEntity dish = new DishEntity();
        dish.setId(dto.getDishId()); // dishId từ DTO là Long
        
        entity.setDish(dish);
        entity.setCombo(combo);
        entity.setQuantity(dto.getQuantity());
        
        return entity;
    }

    public static ComboDishResponseDTO toResponseDto(ComboDishEntity entity) {
        if (entity == null) return null;
        ComboDishResponseDTO dto = new ComboDishResponseDTO();
        dto.setId(entity.getId());
        
        if (entity.getCombo() != null) {
            dto.setComboId(entity.getCombo().getId());
            dto.setComboName(entity.getCombo().getName());
        }
        
        if (entity.getDish() != null) {
            dto.setDishId(entity.getDish().getId());
            dto.setDishName(entity.getDish().getName());
        }
        
        dto.setQuantity(entity.getQuantity());
        
        return dto;
    }
} 