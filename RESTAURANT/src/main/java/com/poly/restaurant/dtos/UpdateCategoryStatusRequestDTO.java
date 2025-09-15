package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCategoryStatusRequestDTO {
    
    @NotNull(message = "Trạng thái không được để trống")
    private String status;
} 