package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboDishResponseDTO {
    private Long id;

    // Chỉ trả về ID và tên của Combo để tránh vòng lặp và lộ thông tin quá nhiều
    private Long comboId;
    private String comboName;

    // Chỉ trả về ID và tên của Dish
    private Long dishId;
    private String dishName;
    private int quantity;
    private BigDecimal basePrice;
    private ItemAvailabilityStatus availabilityStatus;
}