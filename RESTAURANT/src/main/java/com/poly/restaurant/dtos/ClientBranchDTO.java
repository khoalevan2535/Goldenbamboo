package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientBranchDTO {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String status;
    private String operationalStatus;
}
