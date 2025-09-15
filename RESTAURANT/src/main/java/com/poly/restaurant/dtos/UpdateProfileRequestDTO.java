package com.poly.restaurant.dtos;

import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    private String name;
    private String phone;
    private String avatarUrl;
    private String address;
}
