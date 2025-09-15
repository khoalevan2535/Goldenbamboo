package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchSummaryResponseDTO {
    private Long branchId;
    private String branchName;

    private Long defaultBranchMenuId; // id của BranchMenuEntity đánh dấu mặc định
    private Long defaultMenuId;       // id của Menu
    private String defaultMenuName;   // tên Menu

    private Long menuCount;           // số lượng mapping menu của chi nhánh
    private Long schedulesCount;      // tổng số lịch của mọi mapping trong chi nhánh
}


