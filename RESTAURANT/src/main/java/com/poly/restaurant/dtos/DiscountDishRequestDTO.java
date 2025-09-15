package com.poly.restaurant.dtos;

import lombok.Data;

@Data
public class DiscountDishRequestDTO {
    private Long discountId;
    private Long dishId;
}