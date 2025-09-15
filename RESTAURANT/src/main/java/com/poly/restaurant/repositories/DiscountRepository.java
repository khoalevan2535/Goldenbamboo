package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.entities.enums.DiscountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<DiscountEntity, Long> {
    // Spring Data JPA sẽ tự động cung cấp các phương thức CRUD cơ bản.
    
    // Tìm discount theo status và startDate
    List<DiscountEntity> findByStatusAndStartDateLessThanEqual(DiscountStatus status, LocalDateTime dateTime);
    
    // Tìm discount theo status và endDate
    List<DiscountEntity> findByStatusAndEndDateLessThan(DiscountStatus status, LocalDateTime dateTime);
    
    // Tìm discount theo code
    Optional<DiscountEntity> findByCode(String code);
}