package com.poly.restaurant.dtos;

import java.util.List;
import lombok.Data;

@Data
public class MergeOrdersRequestDTO {
    private Long targetOrderId;
    private List<Long> sourceOrderIds;
}

























