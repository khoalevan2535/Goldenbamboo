package com.poly.restaurant.dtos;

import lombok.Data;

@Data
public class UpdateOrderItemQuantityRequestDTO {
    private int newQuantity;
}