package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAccountStatusRequestDTO {
    
    @NotNull(message = "Trạng thái không được để trống")
    private AccountStatus status;
} 