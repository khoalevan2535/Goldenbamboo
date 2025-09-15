package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.ComboEntity;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface ComboRepository extends JpaRepository<ComboEntity, Long>, JpaSpecificationExecutor<ComboEntity> {
        // Spring Data JPA sẽ tự động cung cấp các phương thức CRUD cơ bản.
        Optional<ComboEntity> findByName(String name);

        @Override
        @EntityGraph(attributePaths = { "comboDishes", "comboDishes.dish", "branch" })
        List<ComboEntity> findAll();

        @Override
        @EntityGraph(attributePaths = { "comboDishes", "comboDishes.dish", "branch" })
        Optional<ComboEntity> findById(Long id);

        @Override
        @EntityGraph(attributePaths = { "branch", "discount", "comboDishes" })
        Page<ComboEntity> findAll(Specification<ComboEntity> spec, Pageable pageable);

        boolean existsById(Long id);

        // Các method findByOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

        // Thêm method để lấy tất cả combos không có trong danh sách IDs
        Page<ComboEntity> findByIdNotIn(List<Long> ids, Pageable pageable);

        // Theo trạng thái vận hành - đã có ở trên, bỏ duplicate

        // Lấy combos theo branch (kiến trúc mới: combo có branch_id trực tiếp)
        List<ComboEntity> findByBranchId(Long branchId);
        
        long countByBranchIdAndAvailabilityStatus(Long branchId, ItemAvailabilityStatus availabilityStatus);

        // ===== METHODS CHO AVAILABILITY STATUS =====
        
        // Lấy combos theo availability status
        List<ComboEntity> findByAvailabilityStatus(ItemAvailabilityStatus availabilityStatus);
        
        // Method findByOperationalStatusAndAvailabilityStatus đã bị xóa vì operationalStatus không còn tồn tại
        
        // Lấy combos có thể order được (chỉ AVAILABLE) - method riêng
        @Query("SELECT c FROM ComboEntity c WHERE c.availabilityStatus = 'AVAILABLE'")
        List<ComboEntity> findOrderableCombos();
        
        // Method findByOperationalStatusAndAvailabilityStatusNot đã bị xóa vì operationalStatus không còn tồn tại
        
        // ===== METHODS CHO DISCOUNT =====
        
        // Tìm combos có discount
        List<ComboEntity> findByDiscount(DiscountEntity discount);
}