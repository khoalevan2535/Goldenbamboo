package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.AccountStatus;
import lombok.Data;

@Data
public class StaffUpdateRequestDTO {
    private String name;
    private String roleName; // "ROLE_MANAGER", "ROLE_STAFF"
    private Long branchId;
    private AccountStatus status;
} 