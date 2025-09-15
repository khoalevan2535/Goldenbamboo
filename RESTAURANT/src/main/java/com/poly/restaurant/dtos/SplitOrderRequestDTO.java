package com.poly.restaurant.dtos;

import java.util.List;
import lombok.Data;

@Data
public class SplitOrderRequestDTO {
    @Data
    public static class SplitItem {
        private Long orderDetailId;
        private Integer quantity; // số lượng chuyển sang đơn mới
    }

    private List<SplitItem> items;
    private Long assignTableId; // tùy chọn: gán đơn mới vào bàn nào
}

























