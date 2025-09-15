package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.CategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository
        extends JpaRepository<CategoryEntity, Long>, JpaSpecificationExecutor<CategoryEntity> {
    Optional<CategoryEntity> findByName(String name);

    @Query("SELECT c FROM CategoryEntity c WHERE :name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<CategoryEntity> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
}