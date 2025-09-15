package com.poly.restaurant.mappers;

import java.util.ArrayList;
import java.util.List;

import com.poly.restaurant.dtos.OrderItemResponseDTO;
import com.poly.restaurant.entities.OrderItemEntity;

public class OrderItemMapper {

    public static OrderItemResponseDTO toResponseDto(OrderItemEntity entity) {
        if (entity == null)
            return null;

        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        
        // unitPrice = giá gốc (chưa giảm)
        // finalPrice = giá sau giảm (nếu có discount)
        dto.setUnitPrice(entity.getUnitPrice()); // Giá gốc
        dto.setOriginalPrice(entity.getUnitPrice()); // Giá gốc để hiển thị
        dto.setTotalPrice(entity.getTotalPrice());
        dto.setFinalPrice(entity.getFinalPrice());
        dto.setSpecialInstructions(entity.getSpecialInstructions());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCompletedAt(entity.getCompletedAt());

        // Map dish info if present
        if (entity.getDish() != null) {
            dto.setDishId(entity.getDish().getId());
            dto.setDishName(entity.getDish().getName());
            dto.setDishImage(entity.getDish().getImage());
        }

        // Map discount info if present
        if (entity.getDiscount() != null) {
            dto.setDiscountId(entity.getDiscount().getId());
            dto.setDiscountName(entity.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(entity.getDiscount().getNewPrice());
        }

        // Map order info if present
        if (entity.getOrder() != null) {
            dto.setOrderId(entity.getOrder().getId());
            if (entity.getOrder().getTable() != null) {
                dto.setTableId(entity.getOrder().getTable().getId());
                dto.setTableName(entity.getOrder().getTable().getName());
            }
            if (entity.getOrder().getBranch() != null) {
                dto.setBranchId(entity.getOrder().getBranch().getId());
                dto.setBranchName(entity.getOrder().getBranch().getName());
            }
        }

        return dto;
    }

    public static List<OrderItemResponseDTO> toResponseDtoList(List<OrderItemEntity> entities) {
        if (entities == null)
            return new ArrayList<>();

        List<OrderItemResponseDTO> list = new ArrayList<>();
        for (OrderItemEntity entity : entities) {
            list.add(toResponseDto(entity));
        }
        return list;
    }
}