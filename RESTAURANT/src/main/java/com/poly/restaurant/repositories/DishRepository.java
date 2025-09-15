package com.poly.restaurant.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.poly.restaurant.entities.DishEntity;
import com.poly.restaurant.entities.DiscountEntity;
// Bỏ ApprovalStatus - chỉ dùng OperationalStatus
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;

@Repository
public interface DishRepository extends JpaRepository<DishEntity, Long>, JpaSpecificationExecutor<DishEntity> {

        @EntityGraph(attributePaths = { "category" })
        Optional<DishEntity> findByName(String name);

        @Override
        @EntityGraph(attributePaths = { "category" })
        Optional<DishEntity> findById(Long id);

        @Override
        @EntityGraph(attributePaths = { "branch", "discount", "category" })
        Page<DishEntity> findAll(Specification<DishEntity> spec, Pageable pageable);

        @Override
        @EntityGraph(attributePaths = { "category" })
        List<DishEntity> findAll();

        boolean existsByCategoryId(Long categoryId);

        long countByCategoryId(Long categoryId);

        @EntityGraph(attributePaths = { "category" })
        List<DishEntity> findByCategoryId(Long categoryId);

        // Method existsByCategoryIdAndOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

        // Các method findByOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

        // Thêm method để lấy tất cả dishes không có trong danh sách IDs
        @EntityGraph(attributePaths = { "category" })
        Page<DishEntity> findByIdNotIn(List<Long> ids, Pageable pageable);

        // Theo trạng thái vận hành - đã có ở trên, bỏ duplicate

        // Lấy dishes theo branch trực tiếp (không cần menu nữa)
    @EntityGraph(attributePaths = { "category" })
    List<DishEntity> findByBranchId(Long branchId);
    
    long countByBranchIdAndAvailabilityStatus(Long branchId, ItemAvailabilityStatus availabilityStatus);
        
        // Các method findByOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

        // ===== METHODS CHO AVAILABILITY STATUS =====
        
        // Lấy dishes theo availability status
        @EntityGraph(attributePaths = { "category" })
        List<DishEntity> findByAvailabilityStatus(ItemAvailabilityStatus availabilityStatus);
        
        // Method findByOperationalStatusAndAvailabilityStatus đã bị xóa vì operationalStatus không còn tồn tại
        
        // Lấy dishes có thể order được (chỉ AVAILABLE) - method riêng
        @EntityGraph(attributePaths = { "category" })
        @Query("SELECT d FROM DishEntity d WHERE d.availabilityStatus = 'AVAILABLE'")
        List<DishEntity> findOrderableDishes();
        
        // Method findByOperationalStatusAndAvailabilityStatusNot đã bị xóa vì operationalStatus không còn tồn tại
        
        // ===== METHODS CHO DISCOUNT =====
        
        // Tìm dishes có discount
        List<DishEntity> findByDiscount(DiscountEntity discount);
}