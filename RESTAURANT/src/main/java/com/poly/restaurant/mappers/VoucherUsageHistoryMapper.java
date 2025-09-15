package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.VoucherUsageHistoryRequestDTO;
import com.poly.restaurant.dtos.VoucherUsageHistoryResponseDTO;
import com.poly.restaurant.entities.VoucherUsageHistoryEntity;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.entities.OrderEntity;

import java.time.LocalDateTime;

public class VoucherUsageHistoryMapper {
    
    public static VoucherUsageHistoryEntity toEntity(VoucherUsageHistoryRequestDTO dto, 
                                                     DiscountEntity voucher, 
                                                     OrderEntity order) {
        VoucherUsageHistoryEntity entity = new VoucherUsageHistoryEntity();
        entity.setVoucher(voucher);
        entity.setOrder(order);
        entity.setCustomerPhone(dto.getCustomerPhone());
        entity.setCustomerName(dto.getCustomerName());
        entity.setVoucherCode(dto.getVoucherCode());
        entity.setOriginalAmount(dto.getOriginalAmount());
        entity.setDiscountAmount(dto.getDiscountAmount());
        entity.setFinalAmount(dto.getFinalAmount());
        entity.setUsedAt(LocalDateTime.now());
        return entity;
    }
    
    public static VoucherUsageHistoryResponseDTO toResponseDto(VoucherUsageHistoryEntity entity) {
        VoucherUsageHistoryResponseDTO dto = new VoucherUsageHistoryResponseDTO();
        dto.setId(entity.getId());
        
        if (entity.getVoucher() != null) {
            dto.setVoucherId(entity.getVoucher().getId());
            dto.setVoucherName(entity.getVoucher().getName());
        }
        
        dto.setVoucherCode(entity.getVoucherCode());
        
        if (entity.getOrder() != null) {
            dto.setOrderId(entity.getOrder().getId());
        }
        
        dto.setCustomerPhone(entity.getCustomerPhone());
        dto.setCustomerName(entity.getCustomerName());
        dto.setOriginalAmount(entity.getOriginalAmount());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setFinalAmount(entity.getFinalAmount());
        dto.setUsedAt(entity.getUsedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
}
