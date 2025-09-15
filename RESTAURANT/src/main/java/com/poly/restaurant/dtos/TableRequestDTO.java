package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.TableStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableRequestDTO {

	@NotBlank(message = "Tên bàn không được để trống")
	@Size(max = 50, message = "Tên bàn không được vượt quá 50 ký tự") 
    private String name;

    @NotNull(message = "Trạng thái bàn không được để trống")
    private TableStatus status;

    private String description;
    
    @NotNull(message = "Số ghế không được để trống")
    private Integer seats;
    
    @Size(max = 100, message = "Khu vực không được vượt quá 100 ký tự")
    private String area;
    
    private String tableType = "STANDARD";
    
    private String notes;
    
    private String createdBy;

    // Nhận ID của Branch từ client để thiết lập mối quan hệ
    @NotNull(message = "ID Chi nhánh không được để trống")
    private Long branchId;
}