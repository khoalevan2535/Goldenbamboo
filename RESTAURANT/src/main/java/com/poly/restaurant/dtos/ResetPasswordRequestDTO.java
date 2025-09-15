package com.poly.restaurant.dtos;

import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    private String email;
    private String otp;
    private String newPassword;
    private String sessionId; // Thêm sessionId để validate OTP
}
