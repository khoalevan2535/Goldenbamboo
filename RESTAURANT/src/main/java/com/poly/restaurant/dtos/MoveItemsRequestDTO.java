package com.poly.restaurant.dtos;

import java.util.List;
import lombok.Data;

@Data
public class MoveItemsRequestDTO {
    @Data
    public static class MoveItem {
        private Long orderDetailId;
        private Integer quantity;
    }

    private Long targetOrderId;
    private List<MoveItem> items;
}

























