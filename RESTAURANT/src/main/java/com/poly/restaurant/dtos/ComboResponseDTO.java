package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboResponseDTO {
    private Long id;
    private String name;
    private String image;
    private String description;
    private BigDecimal basePrice;
    private ItemAvailabilityStatus availabilityStatus;
    private Boolean manualAvailabilityOverride;
    // Discount fields
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private LocalDateTime discountStartDate;
    private LocalDateTime discountEndDate;
    private Boolean discountActive;
    private BigDecimal finalPrice; // Giá cuối cùng sau khi áp dụng giảm giá
    private Long branchId;
    private String branchName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ComboDishResponseDTO> comboDishes;
    private Boolean inUse;
}