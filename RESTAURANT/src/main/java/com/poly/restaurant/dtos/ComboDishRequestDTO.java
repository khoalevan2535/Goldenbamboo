package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboDishRequestDTO {

    // Không cần id khi tạo mới

    @NotNull(message = "ID Combo không được để trống")
    private Integer comboId;

    @NotNull(message = "ID Món ăn không được để trống")
    private Integer dishId;
    
}