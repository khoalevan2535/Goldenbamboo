package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.CategoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientCategoryWithCountsDTO {
    private Long id;
    private String name;
    private String description;
    private CategoryStatus status;
    private String operationalStatus;
    private String slug; // URL-friendly name
    private String imageUrl; // Absolute URL for category image

    // Branch-scoped counts
    private Integer foodCount; // Count of dishes in this category for the branch
    private Integer comboCount; // Count of combos in this category for the branch
    private Integer totalCount; // Total items in this category for the branch

    // Additional metadata
    private Boolean hasItems; // Whether this category has any items in the branch
    private String branchId; // The branch this category data is scoped to
}
