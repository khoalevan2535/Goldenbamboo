package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.OrderStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {

    private Long id;
    private Long tableId;
    private String tableName;
    private Long branchId;
    private String branchName;

    private String customerPhone;
    private String customerEmail;
    private String customerName;
    private String address; // Địa chỉ giao hàng
    private String notes;
    private String paymentMethod; // Phương thức thanh toán
    private String orderType; // "ONLINE" hoặc "COUNTER" - phân biệt order online vs tại quầy
    private BigDecimal prepay; // Số tiền đã thanh toán trước
    private String voucherCode; // Mã voucher nếu có

    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin giá
    private BigDecimal totalAmount; // Tổng tiền sau giảm giá

    // Thông tin khuyến mãi
    private Long discountId;
    private String discountName;
    private String discountType;
    private BigDecimal discountValue;

    // Danh sách món ăn
    private List<OrderItemResponseDTO> items;

    // Thông tin nhân viên
    private Long staffId;
    private String staffName;
}