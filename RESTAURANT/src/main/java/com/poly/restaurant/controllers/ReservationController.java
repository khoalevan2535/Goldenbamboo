package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.ReservationRequestDTO;
import com.poly.restaurant.dtos.ReservationResponseDTO;
import com.poly.restaurant.services.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasRole('USER','ADMIN','STAFF')") // Chỉ người dùng có vai trò USER mới được đặt bàn
    public ResponseEntity<ReservationResponseDTO> createReservation(@Valid @RequestBody ReservationRequestDTO request) {
        ReservationResponseDTO response = reservationService.createReservation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Sau này bạn có thể thêm các API khác ở đây:
    // - API cho nhân viên xem và xác nhận đặt bàn
    // - API cho người dùng xem lại lịch sử đặt bàn của họ
    // - API để hủy đặt bàn
}