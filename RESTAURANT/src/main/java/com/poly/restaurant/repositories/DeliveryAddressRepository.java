package com.poly.restaurant.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.poly.restaurant.entities.DeliveryAddressEntity;

@Repository
public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddressEntity, Long> {
    
    /**
     * Tìm tất cả địa chỉ giao hàng của một tài khoản
     */
    List<DeliveryAddressEntity> findByAccountIdOrderByIsDefaultDescCreatedAtDesc(Long accountId);
    
    /**
     * Tìm địa chỉ mặc định của một tài khoản
     */
    Optional<DeliveryAddressEntity> findByAccountIdAndIsDefaultTrue(Long accountId);
    
    /**
     * Kiểm tra xem tài khoản có địa chỉ mặc định không
     */
    boolean existsByAccountIdAndIsDefaultTrue(Long accountId);
    
    /**
     * Đếm số lượng địa chỉ của một tài khoản
     */
    long countByAccountId(Long accountId);
    
    /**
     * Tìm địa chỉ giao hàng theo ID và account ID (để đảm bảo bảo mật)
     */
    Optional<DeliveryAddressEntity> findByIdAndAccountId(Long id, Long accountId);
    
    /**
     * Tìm địa chỉ giao hàng theo chi nhánh
     */
    @Query("SELECT da FROM DeliveryAddressEntity da WHERE da.branch.id = :branchId")
    List<DeliveryAddressEntity> findByBranchId(@Param("branchId") Long branchId);
    
    /**
     * Tìm địa chỉ giao hàng trong khu vực (theo tỉnh/thành phố)
     */
    @Query("SELECT da FROM DeliveryAddressEntity da WHERE da.province = :province")
    List<DeliveryAddressEntity> findByProvince(@Param("province") String province);
}