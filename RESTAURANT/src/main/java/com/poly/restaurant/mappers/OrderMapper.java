package com.poly.restaurant.mappers;

import java.util.ArrayList;
import java.util.List;

import com.poly.restaurant.dtos.OrderRequestDTO;
import com.poly.restaurant.dtos.OrderResponseDTO;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.TableEntity;

public class OrderMapper {
    public static OrderEntity toEntity(OrderRequestDTO dto) {
        if (dto == null)
            return null;
        OrderEntity entity = new OrderEntity();
        if (dto.getTableId() != null) {
            TableEntity table = new TableEntity();
            table.setId(dto.getTableId());
            entity.setTable(table);
        }
        entity.setNote(dto.getNotes());
        entity.setAddress(dto.getAddress());
        entity.setCustomerPhone(dto.getCustomerPhone());
        entity.setCustomerEmail(dto.getCustomerEmail());
        // Bỏ qua items, xử lý ở service nếu cần
        return entity;
    }

    public static OrderResponseDTO toResponseDto(OrderEntity entity) {
        if (entity == null)
            return null;
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(entity.getId());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setNotes(entity.getNote());
        dto.setAddress(entity.getAddress());
        dto.setCustomerPhone(entity.getCustomerPhone());
        dto.setCustomerEmail(entity.getCustomerEmail());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setVoucherCode(entity.getVoucherCode());
        // Lấy tên khách hàng từ AccountEntity
        if (entity.getAccount() != null) {
            dto.setCustomerName(entity.getAccount().getName());
        } else {
            dto.setCustomerName("Khách lẻ");
        }
        dto.setCustomerPhone(entity.getCustomerPhone());

        if (entity.getTable() != null) {
            dto.setTableId(entity.getTable().getId());
            dto.setTableName(entity.getTable().getName());
        }
        if (entity.getBranch() != null) {
            dto.setBranchId(entity.getBranch().getId());
            dto.setBranchName(entity.getBranch().getName());
        }
        if (entity.getAccount() != null) {
            dto.setStaffId(entity.getAccount().getId());
            dto.setStaffName(entity.getAccount().getName());
        }
        if (entity.getDiscount() != null) {
            dto.setDiscountId(entity.getDiscount().getId());
            dto.setDiscountName(entity.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(entity.getDiscount().getNewPrice());
        }
        // map order items if loaded
        if (entity.getOrderItems() != null && !entity.getOrderItems().isEmpty()) {
            dto.setItems(OrderItemMapper.toResponseDtoList(entity.getOrderItems()));
        }
        return dto;
    }

    public static List<OrderResponseDTO> toResponseDtoList(List<OrderEntity> entities) {
        if (entities == null)
            return new ArrayList<>();
        List<OrderResponseDTO> list = new ArrayList<>();
        for (OrderEntity entity : entities) {
            list.add(toResponseDto(entity));
        }
        return list;
    }

    public static void updateEntityFromDto(OrderRequestDTO dto, OrderEntity entity) {
        if (dto == null || entity == null)
            return;
        if (dto.getTableId() != null) {
            TableEntity table = new TableEntity();
            table.setId(dto.getTableId());
            entity.setTable(table);
        }
        if (dto.getNotes() != null)
            entity.setNote(dto.getNotes());
        if (dto.getAddress() != null)
            entity.setAddress(dto.getAddress());
        if (dto.getCustomerPhone() != null)
            entity.setCustomerPhone(dto.getCustomerPhone());
        if (dto.getCustomerEmail() != null)
            entity.setCustomerEmail(dto.getCustomerEmail());
        // Customer name sẽ được xử lý trong service để lưu vào description

    }
}