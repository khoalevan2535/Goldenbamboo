package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PromoteToStaffRequestDTO {
    private Long branchId;
} 