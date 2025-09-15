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
public class CartRequestDTO {

    @NotNull(message = "Branch ID is required")
    private Long branchId;

    private Long accountId; // Optional, nếu null thì dùng sessionId

    private String sessionId; // Cho guest users

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Item type is required")
    private String itemType; // "dish" hoặc "combo"

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private String specialInstructions;

    // Validation method
    public boolean isValid() {
        return branchId != null && 
               itemId != null && 
               itemType != null && 
               (itemType.equals("dish") || itemType.equals("combo")) &&
               quantity != null && quantity > 0 &&
               (accountId != null || (sessionId != null && !sessionId.trim().isEmpty()));
    }
}






