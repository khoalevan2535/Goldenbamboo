package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    
    private boolean success;
    private String message;
    private String paymentUrl; // URL thanh toán VNPay
    private String transactionId; // Mã giao dịch
    private String orderId; // Mã đơn hàng
    private Long amount; // Số tiền
    private String paymentMethod; // Phương thức thanh toán
    private String status; // Trạng thái thanh toán
    private String responseCode; // Mã phản hồi từ VNPay
}