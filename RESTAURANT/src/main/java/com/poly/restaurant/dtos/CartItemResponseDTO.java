package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDTO {

    private Long id;
    private Long cartId;
    private Long itemId;
    private String itemName;
    private String itemImage;
    private String itemType; // "dish" hoặc "combo"
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Discount information
    private Long discountId;
    private String discountName;
    private String discountType;
    private BigDecimal discountValue;

    // Helper methods
    public boolean isDish() {
        return "dish".equals(itemType);
    }

    public boolean isCombo() {
        return "combo".equals(itemType);
    }

    public BigDecimal getFinalPrice() {
        if (finalPrice != null) {
            return finalPrice;
        }
        // Calculate final price if not set
        BigDecimal total = totalPrice != null ? totalPrice : BigDecimal.ZERO;
        BigDecimal discount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        return total.subtract(discount);
    }
}






