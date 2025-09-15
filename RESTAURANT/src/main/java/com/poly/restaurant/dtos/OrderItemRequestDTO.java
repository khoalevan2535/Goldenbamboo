package com.poly.restaurant.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
public class OrderItemRequestDTO {

    private Long id; // ID của order item (cho update)
    private Long orderId; // ID của order

    // Có thể là dishId hoặc comboId (không bắt buộc cả hai)
    private Long dishId; // ID của dish
    private Long comboId; // ID của combo


    @NotNull
    @Min(1)
    private Integer quantity;

    // Ghi chú đặc biệt cho món ăn (ít cay, không đá, thêm topping...)
    private String specialInstructions;

    // Giá của món ăn tại thời điểm đặt (có thể thay đổi)
    private Double unitPrice;

    // Thông tin khuyến mãi cho món ăn cụ thể
    private Long discountId;

    // Phần trăm giảm giá cho món này
    private Double discountPercentage;

    // Ghi chú cho món
    private String note;
}