package com.poly.restaurant.services;

import com.poly.restaurant.dtos.ReservationRequestDTO;
import com.poly.restaurant.dtos.ReservationResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.ReservationEntity;
import com.poly.restaurant.entities.TableEntity;
import com.poly.restaurant.entities.enums.ReservationStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.ReservationMapper;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.ReservationRepository;
import com.poly.restaurant.repositories.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AccountRepository accountRepository;
    private final TableRepository tableRepository;
    private final BranchRepository branchRepository;

    @Transactional
    public ReservationResponseDTO createReservation(ReservationRequestDTO request) {
        // 1. Lấy thông tin người dùng đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        AccountEntity account = accountRepository.findByUsername(username)
                .or(() -> accountRepository.findByPhone(username))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        // 2. Tìm các thực thể liên quan
        TableEntity table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn"));
        BranchEntity branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh"));

        // 3. Logic nghiệp vụ: Kiểm tra xem bàn có trống vào thời điểm đó không
        // Giả sử một lượt đặt bàn kéo dài 2 tiếng
        LocalDateTime startTime = request.getReservationTime().minusHours(2);
        LocalDateTime endTime = request.getReservationTime().plusHours(2);
        boolean isOccupied = reservationRepository.existsByTableAndReservationTimeBetweenAndStatusIn(
                table,
                startTime,
                endTime,
                Arrays.asList(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)
        );

        if (isOccupied) {
            throw new IllegalStateException("Bàn đã có người đặt trong khoảng thời gian này.");
        }

        // 4. Tạo đối tượng ReservationEntity
        ReservationEntity reservation = new ReservationEntity();
        reservation.setAccount(account);
        reservation.setTable(table);
        reservation.setBranch(branch);
        reservation.setReservationTime(request.getReservationTime());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setNotes(request.getNotes());
        reservation.setStatus(ReservationStatus.PENDING); // Mặc định là chờ xác nhận

        // 5. Lưu và trả về DTO
        ReservationEntity savedReservation = reservationRepository.save(reservation);
        return ReservationMapper.toResponseDto(savedReservation);
    }
}