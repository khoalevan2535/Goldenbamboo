package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountComboResponseDTO {
    private Long id;
    private Double discountPercentage;

    // Trả về ID của MenuCombo và thông tin combo
    private Long menuComboId;
    private Long comboId;
    private String comboName;

    // Chỉ trả về ID và tên của Discount
    private Long discountId;
    private String discountName;
}