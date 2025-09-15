package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BranchComboRequestDTO {
    @NotNull(message = "ID chi nhánh không được để trống")
    private Integer branchId;

    @NotNull(message = "ID combo không được để trống")
    private Integer comboId;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải là số dương")
    private BigDecimal price;

    @NotNull(message = "Trạng thái không được để trống")
    private ItemAvailabilityStatus status;
}