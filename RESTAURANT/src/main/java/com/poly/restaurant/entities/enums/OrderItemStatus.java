package com.poly.restaurant.entities.enums;

public enum OrderItemStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận, chờ bếp làm
    IN_PROGRESS,    // Đang chế biến
    READY,          // Đã sẵn sàng
    SERVED,         // Đã phục vụ cho khách
    CANCELLED,      // Đã hủy
    COMPLETED       // Hoàn thành
}
