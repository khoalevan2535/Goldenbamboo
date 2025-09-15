package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.OrderItemStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderItemResponseDTO {

    private Long id;
    private Long orderId;

    // Thông tin món ăn
    private Long dishId;
    private String dishName;
    private String dishImage;

    private Integer quantity;
    private BigDecimal unitPrice; // Giá gốc (chưa giảm)
    private BigDecimal originalPrice; // Giá gốc (để hiển thị)
    private BigDecimal totalPrice; // unitPrice * quantity

    // Ghi chú đặc biệt
    private String specialInstructions;

    // Trạng thái món ăn
    private OrderItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    // Thông tin khuyến mãi cho món ăn
    private Long discountId;
    private String discountName;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal finalPrice; // Giá sau khi áp dụng khuyến mãi

    // Thông tin bàn và chi nhánh
    private Long tableId;
    private String tableName;
    private Long branchId;
    private String branchName;
}
