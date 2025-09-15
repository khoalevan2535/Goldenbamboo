package com.poly.restaurant.dtos;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboRequestDTO {
    @NotBlank(message = "Tên combo không được để trống")
    private String name;
    private String description;
    @NotNull(message = "Giá không được để trống")
    private BigDecimal basePrice;
    
    // branchId sẽ được tự động lấy từ loggedInUser
    
    private List<ComboItemDTO> comboItems;
    
    // Can be either a file upload or a Cloudinary URL
    private String image;
}
