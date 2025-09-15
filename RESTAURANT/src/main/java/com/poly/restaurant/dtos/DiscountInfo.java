package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountInfo {
    private Long id;
    private String code;
    private String name;
    private BigDecimal newPrice;
    private String startDate;
    private String endDate;
    private String status;
    private String description;
}


