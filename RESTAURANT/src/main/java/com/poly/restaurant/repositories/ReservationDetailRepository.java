package com.poly.restaurant.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poly.restaurant.entities.ReservationDetailEntity;

public interface ReservationDetailRepository extends JpaRepository<ReservationDetailEntity,Long> {
	boolean existsByComboId(Long comboId);
}
