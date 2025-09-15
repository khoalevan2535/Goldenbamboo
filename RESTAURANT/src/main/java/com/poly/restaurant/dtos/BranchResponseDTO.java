package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.BranchStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String province;
    private String district;
    private String ward;
    private String phone;
    private String description;
    private BranchStatus status;
    private String createdBy;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isInUse; // Chi nhánh có đang được sử dụng không

}