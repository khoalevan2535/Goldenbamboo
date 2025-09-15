package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.BranchStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BranchRequestDTO {

    @NotBlank(message = "Tên chi nhánh không được để trống")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String province;
    private String district;
    private String ward;
    private String phone;

    private String description;

    private String createdBy;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Trạng thái không được để trống")
    private BranchStatus status; // Dùng Enum để đảm bảo dữ liệu hợp lệ
}