package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.DayOfWeek;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchOperatingHoursDTO {
    private Long id;
    private Long branchId;
    private DayOfWeek dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean isOpen;
    private String description;
    private String dayDisplayName;
    private String operatingHoursString;
}
