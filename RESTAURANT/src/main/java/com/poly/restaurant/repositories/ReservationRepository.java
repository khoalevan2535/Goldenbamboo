package com.poly.restaurant.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poly.restaurant.entities.ReservationEntity;
import com.poly.restaurant.entities.TableEntity;
import com.poly.restaurant.entities.enums.ReservationStatus;

public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {
	

    // Kiểm tra xem có tồn tại lượt đặt bàn nào cho một bàn cụ thể, trong một khoảng thời gian,
    // và có trạng thái là PENDING hoặc CONFIRMED hay không.
    boolean existsByTableAndReservationTimeBetweenAndStatusIn(
            TableEntity table,
            LocalDateTime startTime,
            LocalDateTime endTime,
            List<ReservationStatus> statuses
    );
    
    // Đếm số lượng reservation theo thời gian và status
    long countByReservationTimeBetweenAndStatusIn(
            LocalDateTime startTime,
            LocalDateTime endTime,
            List<ReservationStatus> statuses
    );
}