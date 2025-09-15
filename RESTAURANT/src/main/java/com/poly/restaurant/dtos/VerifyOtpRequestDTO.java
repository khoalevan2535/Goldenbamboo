package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequestDTO {
    
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String email; // Có thể là email hoặc phone
    
    @NotBlank(message = "Mã OTP không được để trống")
    private String otp;
    
    private String sessionId; // Thêm sessionId để track OTP session
}
