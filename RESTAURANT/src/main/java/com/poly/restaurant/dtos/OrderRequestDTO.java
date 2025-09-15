package com.poly.restaurant.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequestDTO {

    @NotNull
    private Long tableId;

    private Long branchId; // Thêm branchId để hỗ trợ delivery order
    private Long accountId; // Thêm accountId để hỗ trợ client orders
    private String sessionId; // Thêm sessionId để hỗ trợ guest users

    private String customerPhone;
    private String customerEmail; // Email khách hàng
    private String customerName; // Tên khách hàng
    private String address; // Địa chỉ giao hàng
    private String notes;
    private String paymentMethod; // Phương thức thanh toán
    private String orderType; // "ONLINE" hoặc "COUNTER" - phân biệt order online vs tại quầy
    
    // Thông tin giao hàng
    private Long deliveryAddressId; // ID địa chỉ giao hàng
    private String deliveryType; // "pickup", "delivery"
    private BigDecimal shippingFee; // Phí vận chuyển

    // Tổng tiền đơn hàng (tính từ frontend)
    private BigDecimal totalAmount;

    // Danh sách món ăn/đồ uống
    private List<OrderItemRequestDTO> items;

    // Thông tin khuyến mãi
    private Long discountId;
    
    // Mã voucher được sử dụng
    private String voucherCode;
}