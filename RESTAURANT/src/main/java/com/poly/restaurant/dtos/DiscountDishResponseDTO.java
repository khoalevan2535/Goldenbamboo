package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDishResponseDTO {
    private Long id;

    // Chỉ trả về ID và tên của Discount
    private Long discountId;
    private String discountName;

    // Trả về ID của Dish và thông tin món ăn
    private Long dishId;
    private String dishName;
}