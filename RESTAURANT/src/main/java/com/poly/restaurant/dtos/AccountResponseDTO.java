package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.AccountStatus;

import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponseDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String address;
    private Double latitude;
    private Double longitude;
    private AccountStatus status;
    private LocalDateTime createAt;
    
    // Thông tin khóa tài khoản
    private Integer failedAttempts;
    private LocalDateTime lockTime;
    private LocalDateTime lastFailedAttempt;
    
    // Thông tin chi nhánh
    private Long branchId;
    private String branchName;
    
    // Danh sách tên các vai trò
    private Set<String> roles; 
}