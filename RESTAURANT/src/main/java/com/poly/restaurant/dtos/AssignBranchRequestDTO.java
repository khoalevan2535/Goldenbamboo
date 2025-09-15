package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignBranchRequestDTO {
    private Long branchId;
} 