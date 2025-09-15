package com.poly.restaurant.dtos;

import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    private String currentPassword; // có thể null với tài khoản OAuth chưa có mật khẩu
    private String newPassword;
}
