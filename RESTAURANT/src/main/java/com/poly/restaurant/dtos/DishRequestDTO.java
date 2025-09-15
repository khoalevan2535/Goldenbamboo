package com.poly.restaurant.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DishRequestDTO {
    @NotBlank(message = "Tên món ăn không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal basePrice;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;

    // branchId sẽ được tự động lấy từ loggedInUser

    // Có thể là URL từ Cloudinary hoặc null
    private String image;

    // Thêm các field discount
    private BigDecimal discountPercentage; // Phần trăm giảm giá (0-100)
    private BigDecimal discountAmount; // Số tiền giảm giá cố định
    private LocalDateTime discountStartDate; // Ngày bắt đầu giảm giá
    private LocalDateTime discountEndDate; // Ngày kết thúc giảm giá
    private Boolean discountActive = false; // Trạng thái giảm giá
}
