package com.poly.restaurant.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "cart_items")
public class CartItemEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private CartEntity cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id")
    private DishEntity dish;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id")
    private ComboEntity combo;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal finalPrice;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id")
    private DiscountEntity discount;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public void calculatePrices() {
        if (unitPrice != null && quantity != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
            this.finalPrice = totalPrice.subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
        }
    }

    public String getItemName() {
        if (dish != null) {
            return dish.getName();
        } else if (combo != null) {
            return combo.getName();
        }
        return "Unknown Item";
    }

    public String getItemImage() {
        if (dish != null) {
            return dish.getImage();
        } else if (combo != null) {
            return combo.getImage();
        }
        return null;
    }

    public String getItemType() {
        if (dish != null) {
            return "dish";
        } else if (combo != null) {
            return "combo";
        }
        return "unknown";
    }

    public Long getItemId() {
        if (dish != null) {
            return dish.getId();
        } else if (combo != null) {
            return combo.getId();
        }
        return null;
    }

    // Validation methods
    public boolean isValid() {
        return (dish != null || combo != null) && 
               quantity != null && quantity > 0 && 
               unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) >= 0;
    }
}






