package com.poly.restaurant.entities.enums;

/**
 * Trạng thái khả dụng của món ăn/combo
 * - AVAILABLE: Còn hàng - hiển thị và có thể order
 * - OUT_OF_STOCK: Hết hàng - hiển thị nhưng không thể order (disabled)
 * - DISCONTINUED: Ngừng bán - không hiển thị ở chi nhánh
 */
public enum ItemAvailabilityStatus {
    AVAILABLE("Còn hàng"),
    OUT_OF_STOCK("Hết hàng"), 
    DISCONTINUED("Ngừng bán");

    private final String displayName;

    ItemAvailabilityStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Kiểm tra xem item có thể order được không
     */
    public boolean isOrderable() {
        return this == AVAILABLE;
    }

    /**
     * Kiểm tra xem item có hiển thị ở chi nhánh không
     */
    public boolean isVisible() {
        return this == AVAILABLE || this == OUT_OF_STOCK;
    }
}

