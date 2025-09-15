package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import lombok.Data;

@Data
public class DishStatusUpdateDTO {
    private ItemAvailabilityStatus status;
}
