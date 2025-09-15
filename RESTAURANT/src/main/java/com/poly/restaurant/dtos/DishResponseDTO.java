package com.poly.restaurant.dtos;

import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime; // Thêm import cho LocalDateTime
// Không cần List<> imports nếu không bao gồm các List quan hệ
// import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DishResponseDTO {
    // Các trường kế thừa từ MenuItemEntity
    private Long id;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private String image;
    private ItemAvailabilityStatus availabilityStatus;
    private Long branchId;
    private String branchName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thêm thông tin về category để hiển thị
    private Long categoryId;
    private String categoryName;

    // Bỏ qua List<ComboDishEntity> để giữ DTO gọn
    // và tránh vòng lặp/dữ liệu thừa. Nếu cần, có thể thêm sau và sử dụng các Mapper tương ứng.
    // private List<ComboDishResponseDTO> comboDishes;
    // private List<MenuDishResponseDTO> menuDishes;

    // Flag chỉ để FE biết có thể xóa hay không
    private Boolean inUse;

    // Thêm các field discount
    private BigDecimal discountPercentage; // Phần trăm giảm giá (0-100)
    private BigDecimal discountAmount; // Số tiền giảm giá cố định
    private LocalDateTime discountStartDate; // Ngày bắt đầu giảm giá
    private LocalDateTime discountEndDate; // Ngày kết thúc giảm giá
    private Boolean discountActive = false; // Trạng thái giảm giá

    // Thêm field tính toán giá sau giảm
    private BigDecimal finalPrice; // Giá cuối cùng sau khi áp dụng giảm giá
}