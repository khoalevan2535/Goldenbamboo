package com.poly.restaurant.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TableHistoryDTO {
    private Long id;
    private Long tableId;
    private String tableName;
    private String action;
    private Long userId;
    private String userName;
    private Long orderId;
    private Long reservationId;
    private String notes;
    private String createdAt;
}
