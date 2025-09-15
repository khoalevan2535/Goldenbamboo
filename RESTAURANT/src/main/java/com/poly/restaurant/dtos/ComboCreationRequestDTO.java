package com.poly.restaurant.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ComboCreationRequestDTO {

    @NotBlank(message = "Tên combo không được để trống")
    private String name;

    private String description;
    
    private BigDecimal price;

    @NotEmpty(message = "Combo phải có ít nhất một món ăn")
    @Valid // Đảm bảo các item bên trong cũng được validate
    private List<ComboItemDTO> dishes;
}