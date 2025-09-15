package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableStatusUpdateDTO {

    @NotNull(message = "Trạng thái mới không được để trống")
    private TableStatus status;
}