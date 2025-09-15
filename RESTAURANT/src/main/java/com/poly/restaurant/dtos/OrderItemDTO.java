package com.poly.restaurant.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDTO {
    private Long dishId;
    private Long comboId;
    private Integer quantity;
    private Integer discountPercentage;
    private BigDecimal price;
    private String itemType; // "dish" or "combo"
    private Long itemId;
}


