package com.poly.restaurant.entities.enums;

public enum DiscountStatus {
    ACTIVE,     // Đang diễn ra
    SCHEDULED,  // Đã lên lịch, chưa tới ngày
    EXPIRING,   // Sắp hết hạn (còn < 24h)
    EXPIRED,    // Đã hết hạn
    REPLACED    // Đã bị thay thế bởi discount mới hơn
}