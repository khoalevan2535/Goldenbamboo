package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {

    private Long id;
    private Long accountId;
    private String accountName;
    private String sessionId;
    private Long branchId;
    private String branchName;
    private BigDecimal totalAmount;
    private Integer totalItems;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private List<CartItemResponseDTO> cartItems;

    // Helper methods
    public boolean isEmpty() {
        return cartItems == null || cartItems.isEmpty();
    }

    public int getItemCount() {
        return cartItems != null ? cartItems.size() : 0;
    }

    public BigDecimal getTotalAmount() {
        if (totalAmount != null) {
            return totalAmount;
        }
        // Calculate from cart items if totalAmount is null
        if (cartItems != null) {
            return cartItems.stream()
                    .map(CartItemResponseDTO::getFinalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return BigDecimal.ZERO;
    }

    public Integer getTotalItems() {
        if (totalItems != null) {
            return totalItems;
        }
        // Calculate from cart items if totalItems is null
        if (cartItems != null) {
            return cartItems.stream()
                    .mapToInt(CartItemResponseDTO::getQuantity)
                    .sum();
        }
        return 0;
    }
}






