package com.poly.restaurant.entities.enums;

public enum DiscountType {
    BRANCH_DISCOUNT("Giảm giá chi nhánh"),
    CUSTOMER_VOUCHER("Voucher khách hàng");
    
    private final String description;
    
    DiscountType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
