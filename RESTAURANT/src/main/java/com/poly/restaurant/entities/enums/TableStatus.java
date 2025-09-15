package com.poly.restaurant.entities.enums;

public enum TableStatus {
    AVAILABLE,      // Bàn trống, sẵn sàng phục vụ
    OCCUPIED,       // Bàn đang có khách
    RESERVED,       // Bàn đã được đặt trước
    UNAVAILABLE     // Bàn không sử dụng (đang sửa chữa, etc.)
}