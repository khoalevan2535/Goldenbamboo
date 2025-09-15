package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDetailRequestDTO {
    // Không cần id khi tạo mới

    @Positive(message = "Số lượng phải lớn hơn 0")
    private int quantity;

    private Long dishId;  // nullable, chỉ set nếu là món ăn
    private Long comboId; // nullable, chỉ set nếu là combo
}