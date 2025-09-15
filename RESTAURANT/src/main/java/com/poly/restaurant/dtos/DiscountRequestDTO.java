package com.poly.restaurant.dtos;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.poly.restaurant.entities.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DiscountRequestDTO {
	
    private String code; // Mã giảm giá (nullable - null cho discount chi nhánh, required cho voucher khách hàng)
    
    @NotBlank
    private String name;
    @NotNull
    private BigDecimal newPrice; // Giá mới (99k, 199k)
    @NotNull
    private LocalDateTime startDate;
    @NotNull
    private LocalDateTime endDate;

    private String description; // Mô tả giảm giá
    
    // Target items
    private Long dishId; // ID của món ăn (nullable)
    private Long comboId; // ID của combo (nullable)
    
    // Loại discount
    private DiscountType type; // BRANCH_DISCOUNT hoặc CUSTOMER_VOUCHER
}