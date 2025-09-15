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
public class VNPayRequestDTO {
    private BigDecimal amount;
    private String orderInfo;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String returnUrl;
    private String cancelUrl;
    private String orderId; // Optional: custom order ID
}






