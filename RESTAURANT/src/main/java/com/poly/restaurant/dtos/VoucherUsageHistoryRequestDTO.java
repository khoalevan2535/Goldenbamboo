package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VoucherUsageHistoryRequestDTO {
    
    @NotNull(message = "Voucher ID không được để trống")
    private Long voucherId;
    
    @NotNull(message = "Order ID không được để trống")
    private Long orderId;
    
    private String customerPhone;
    
    private String customerName;
    
    @NotBlank(message = "Mã voucher không được để trống")
    private String voucherCode;
    
    @NotNull(message = "Số tiền gốc không được để trống")
    @Positive(message = "Số tiền gốc phải lớn hơn 0")
    private BigDecimal originalAmount;
    
    @NotNull(message = "Số tiền giảm không được để trống")
    @Positive(message = "Số tiền giảm phải lớn hơn 0")
    private BigDecimal discountAmount;
    
    @NotNull(message = "Số tiền cuối cùng không được để trống")
    @Positive(message = "Số tiền cuối cùng phải lớn hơn 0")
    private BigDecimal finalAmount;
}
