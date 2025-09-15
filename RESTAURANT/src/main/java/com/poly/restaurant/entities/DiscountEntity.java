package com.poly.restaurant.entities;

import com.poly.restaurant.entities.enums.DiscountStatus;
import com.poly.restaurant.entities.enums.DiscountType;
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
@Table(name = "discounts")
public class DiscountEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = true)
    private String code; // Mã giảm giá (nullable cho BRANCH_DISCOUNT, required cho CUSTOMER_VOUCHER)

    private String name;
    
    @Column(name = "new_price", nullable = false)
    private BigDecimal newPrice; // Giá mới (99k, 199k)
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private DiscountStatus status;

    private String description;

    // Quan hệ với dish (nullable)
    @Column(name = "dish_id")
    private Long dishId;

    // Quan hệ với combo (nullable)
    @Column(name = "combo_id")
    private Long comboId;

    // Loại discount: BRANCH_DISCOUNT (giảm giá chi nhánh) hoặc CUSTOMER_VOUCHER (voucher khách hàng)
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private DiscountType type;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}