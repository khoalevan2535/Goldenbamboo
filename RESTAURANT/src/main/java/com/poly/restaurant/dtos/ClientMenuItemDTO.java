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
public class ClientMenuItemDTO {
    private Long id;
    private Long menu_dish_id; // ID của món ăn trong menu
    private String type; // "food" hoặc "combo"
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal basePrice; // Giá gốc
    private String imageUrl; // Absolute URL
    
    // Discount fields giống DishResponseDTO
    private BigDecimal discountPercentage; // Phần trăm giảm giá (0-100)
    private BigDecimal discountAmount; // Số tiền giảm giá cố định
    private LocalDateTime discountStartDate; // Ngày bắt đầu giảm giá
    private LocalDateTime discountEndDate; // Ngày kết thúc giảm giá
    @Builder.Default
    private Boolean discountActive = false; // Trạng thái giảm giá
    private BigDecimal finalPrice; // Giá cuối cùng sau khi áp dụng giảm giá
    private Long categoryId;
    private String categoryName;
    private Long branchId;
    private String branchName;
    private Boolean available;
    private String status;
    private Integer popularity;
    private LocalDateTime createdAt;
}
