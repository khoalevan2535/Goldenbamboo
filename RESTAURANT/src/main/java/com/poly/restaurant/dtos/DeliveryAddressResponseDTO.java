package com.poly.restaurant.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAddressResponseDTO {
    
    private Long id;
    private Long accountId;
    private Long branchId;
    private String branchName;
    private String recipientName;
    private String phoneNumber;
    private String address;
    private String province;
    private String district;
    private String ward;
    private String fullAddress;
    private String shortAddress;
    private String notes;
    private Boolean isDefault;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}