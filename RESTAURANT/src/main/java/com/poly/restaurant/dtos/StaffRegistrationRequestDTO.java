package com.poly.restaurant.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StaffRegistrationRequestDTO {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    // Mật khẩu không bắt buộc nếu có email (sẽ được tạo tự động)
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String name;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Email không hợp lệ")
    private String email; // Email tùy chọn

    @NotBlank(message = "Vai trò không được để trống")
    private String roleName; // Ví dụ: "ROLE_MANAGER", "ROLE_STAFF"

    // Có thể null nếu tạo tài khoản ADMIN
    private Long branchId;
}