package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    
    @NotNull(message = "Order ID không được để trống")
    private Long orderId;
    
    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 1, message = "Số tiền tối thiểu là 1 VND")
    private Long amount;
    
    private String orderInfo;
    private String returnUrl;
    private String cancelUrl;
    private String paymentMethod; // VNPAY, COD
    private String clientIp; // IP của client
}