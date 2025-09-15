package com.poly.restaurant.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailRequestDTO {
    // Không cần id khi tạo mới

    private Long dishId;  // nullable, chỉ set nếu là món ăn
    private Long comboId; // nullable, chỉ set nếu là combo

    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private int quantity;

    @NotNull(message = "Giá không được để trống")
    private BigDecimal price; // Giá tại thời điểm đặt hàng

    @NotNull(message = "Tên không được để trống")
    private String name; // Tên tại thời điểm đặt hàng

    private Integer discountPercentage; // % giảm giá tại thời điểm đặt hàng (có thể null)
}