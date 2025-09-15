package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateAccountRoleRequestDTO {
    @NotBlank(message = "Tên vai trò không được để trống")
    private String roleName;
}
