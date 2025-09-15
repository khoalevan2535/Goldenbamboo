package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequestDTO {

    @NotNull(message = "Cart item ID is required")
    private Long cartItemId;

    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private String specialInstructions;

    // Validation method
    public boolean isValid() {
        return cartItemId != null && 
               quantity != null && quantity > 0;
    }
}






