package com.poly.restaurant.entities.enums;

public enum ReservationStatus {
    PENDING,    // Chờ xác nhận
    CONFIRMED,  // Đã xác nhận
    CANCELED,   // Đã hủy
    COMPLETED   // Đã hoàn thành (khách đã đến và đi)
}