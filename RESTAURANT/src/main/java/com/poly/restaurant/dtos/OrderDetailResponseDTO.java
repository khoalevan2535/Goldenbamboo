package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponseDTO {
    private Long id;
    private int quantity;
    private BigDecimal price;
    private String name; // Tên món/combo tại thời điểm đặt hàng
    private Integer discountPercentage;

    // Thay vì itemId và isCombo, chúng ta sẽ có menuItemId và menuItemName
    private Long menuItemId;
    private String menuItemName; // Tên MenuItem tại thời điểm đặt hàng (có thể khác name nếu tên đổi)

    // Chỉ trả về ID của Order liên kết, không phải toàn bộ OrderEntity
    private Long orderId;
    private Long dishId;   // nullable, chỉ set nếu là món ăn
    private Long comboId;  // nullable, chỉ set nếu là combo
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}