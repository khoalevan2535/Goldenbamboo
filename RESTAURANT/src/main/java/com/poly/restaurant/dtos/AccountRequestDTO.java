package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.AccountStatus;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.groups.Default;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequestDTO {

    @NotBlank(message = "Tên không được để trống", groups = Default.class)
    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự")
    private String name;

    @NotBlank(message = "Mật khẩu không được để trống", groups = Default.class)
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    // Làm optional, chỉ yêu cầu một trong hai (email hoặc phone)
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(.+)$", message = "Email không hợp lệ")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private String address;

    private Double latitude;

    private Double longitude;

    private AccountStatus status;

    private Long branchId;
    private Long roleId;

    // Thêm validation nhóm để yêu cầu ít nhất một trong email hoặc phone
    public interface EmailOrPhoneGroup {}
    @NotBlank(message = "Phải cung cấp email hoặc số điện thoại", groups = EmailOrPhoneGroup.class)
    public String getEmailOrPhone() {
        if (email != null && !email.isEmpty()) return email;
        if (phone != null && !phone.isEmpty()) return phone;
        return null;
    }
}