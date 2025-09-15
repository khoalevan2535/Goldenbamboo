package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.DiscountStatus;
import com.poly.restaurant.entities.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountResponseDTO {
    private Long id;
    private String code; // Mã giảm giá
    private String name;
    private BigDecimal newPrice; // Giá mới
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private DiscountStatus status;
    private String description;
    
    // Target items
    private Long dishId; // ID của món ăn (nullable)
    private Long comboId; // ID của combo (nullable)
    
    // Loại discount
    private DiscountType type; // BRANCH_DISCOUNT hoặc CUSTOMER_VOUCHER
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}