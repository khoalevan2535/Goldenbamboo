package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterOtpRequestDTO {
    
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 20, message = "Username phải có từ 3 đến 20 ký tự")
    private String username;
    
    @NotBlank(message = "Email không được để trống")
    private String email;
    
    private String name;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
}
