package com.poly.restaurant.entities;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "combos")
public class ComboEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "image")
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false)
    private ItemAvailabilityStatus availabilityStatus = ItemAvailabilityStatus.AVAILABLE;

    @Column(name = "manual_availability_override", nullable = false)
    private Boolean manualAvailabilityOverride = false; // Đánh dấu combo có bị set thủ công hay không

    @Column(name = "base_price")
    private BigDecimal basePrice;

    // Các trường discount trực tiếp
    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    @Column(name = "discount_start_date")
    private LocalDateTime discountStartDate;

    @Column(name = "discount_end_date")
    private LocalDateTime discountEndDate;

    @Column(name = "discount_active")
    private Boolean discountActive;

    // Method để tính final price
    public BigDecimal getFinalPrice() {
        if (basePrice == null) return BigDecimal.ZERO;
        
        if (discountActive != null && discountActive) {
            BigDecimal finalPrice = basePrice;
            
            // Áp dụng discount percentage trước
            if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discountValue = basePrice.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
                finalPrice = basePrice.subtract(discountValue);
            }
            
            // Áp dụng discount amount
            if (discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                finalPrice = finalPrice.subtract(discountAmount);
            }
            
            // Đảm bảo giá không âm
            return finalPrice.compareTo(BigDecimal.ZERO) > 0 ? finalPrice : BigDecimal.ZERO;
        }
        
        return basePrice;
    }

    // Quan hệ với discount (1:1) - legacy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id")
    private DiscountEntity discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private BranchEntity branch;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---------- CÁC MỐI QUAN HỆ RIÊNG CỦA COMBO ----------
    @ToString.Exclude
    @JsonManagedReference
    @OneToMany(mappedBy = "combo", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ComboDishEntity> comboDishes = new HashSet<>();
}