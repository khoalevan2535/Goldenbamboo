package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayResponseDTO {
    private boolean success;
    private String message;
    private String paymentUrl;
    private String orderId;
    private String transactionId;
}






