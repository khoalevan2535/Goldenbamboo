package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.BranchStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBranchStatusRequestDTO {
    @NotNull(message = "Trạng thái không được để trống")
    private BranchStatus status;
}