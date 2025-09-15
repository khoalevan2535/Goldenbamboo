package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.TableStatus;
import lombok.Data;

@Data
public class TableResponseDTO {
    private Long id;
    private String name;
    private TableStatus status;
    private Long branchId;
    private String branchName;
    private String operationalStatus;
    private String description;
    private Integer seats;
    private String area;
    private String tableType;

    private String notes;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
}