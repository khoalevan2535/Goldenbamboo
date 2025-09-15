package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.ComboDishEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComboDishRepository extends JpaRepository<ComboDishEntity, Long> {
    // Các phương thức CRUD cơ bản như save(), saveAll(), delete() đã có sẵn.

    @Query("select count(cd) > 0 from ComboDishEntity cd where cd.dish.id = :dishId")
    boolean existsByDishId(@Param("dishId") Long dishId);

    /**
     * Tìm tất cả combo chứa món ăn có ID cụ thể
     */
    @Query("select cd from ComboDishEntity cd where cd.dish.id = :dishId")
    List<ComboDishEntity> findByDishId(@Param("dishId") Long dishId);
}