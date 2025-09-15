package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDTO {
    
    @NotBlank(message = "Số điện thoại hoặc email không được để trống")
    private String loginIdentifier; // Có thể là email, username hoặc phone
    
    private String password; // Mật khẩu (optional nếu dùng OTP)
    
    private String otp; // OTP (optional nếu dùng password)
    
    private String loginMethod; // "password" hoặc "otp"
}