package com.poly.restaurant.entities.enums;

public enum OrderStatus {
    PENDING, //Đang chờ xử lý
    CONFIRMED, //Đã xác nhận
    PREPARING, // Đang chuẩn bị
    READY_FOR_PICKUP, //Sẵn sàng để lấy hàng / giao đi
    DELIVERED, //Đã giao hàng
    COMPLETED, // Hoàn thành
    CANCELED, //Đã hủy
    REFUNDED, //Đã hoàn tiền
    PAID, //Đã thanh toán
    COD_PENDING //Chờ thanh toán tiền mặt
}