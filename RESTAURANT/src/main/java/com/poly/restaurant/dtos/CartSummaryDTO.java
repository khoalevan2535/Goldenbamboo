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
public class CartSummaryDTO {

    private Long cartId;
    private Long branchId;
    private String branchName;
    private Integer totalItems;
    private BigDecimal totalAmount;
    private Boolean isActive;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isEmpty() {
        return totalItems == null || totalItems == 0;
    }
}






