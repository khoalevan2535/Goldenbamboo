package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.VoucherUsageHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherUsageHistoryRepository extends JpaRepository<VoucherUsageHistoryEntity, Long> {
    
    // Tìm lịch sử sử dụng voucher theo voucher ID
    List<VoucherUsageHistoryEntity> findByVoucherIdOrderByUsedAtDesc(Long voucherId);
    
    // Tìm lịch sử sử dụng voucher theo order ID
    Optional<VoucherUsageHistoryEntity> findByOrderId(Long orderId);
    
    // Tìm lịch sử sử dụng voucher theo mã voucher
    List<VoucherUsageHistoryEntity> findByVoucherCodeOrderByUsedAtDesc(String voucherCode);
    
    // Tìm lịch sử sử dụng voucher theo số điện thoại khách hàng
    List<VoucherUsageHistoryEntity> findByCustomerPhoneOrderByUsedAtDesc(String customerPhone);
    
    // Tìm lịch sử sử dụng voucher trong khoảng thời gian
    @Query("SELECT v FROM VoucherUsageHistoryEntity v WHERE v.usedAt BETWEEN :startDate AND :endDate ORDER BY v.usedAt DESC")
    List<VoucherUsageHistoryEntity> findByUsedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                        @Param("endDate") LocalDateTime endDate);
    
    // Đếm số lần sử dụng voucher
    long countByVoucherId(Long voucherId);
    
    // Đếm số lần sử dụng voucher theo mã
    long countByVoucherCode(String voucherCode);
    
    // Tìm lịch sử sử dụng voucher với phân trang
    Page<VoucherUsageHistoryEntity> findByVoucherIdOrderByUsedAtDesc(Long voucherId, Pageable pageable);
    
    // Tìm lịch sử sử dụng voucher theo khách hàng với phân trang
    Page<VoucherUsageHistoryEntity> findByCustomerPhoneOrderByUsedAtDesc(String customerPhone, Pageable pageable);
    
    // Tìm lịch sử sử dụng voucher trong khoảng thời gian với phân trang
    @Query("SELECT v FROM VoucherUsageHistoryEntity v WHERE v.usedAt BETWEEN :startDate AND :endDate ORDER BY v.usedAt DESC")
    Page<VoucherUsageHistoryEntity> findByUsedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                        @Param("endDate") LocalDateTime endDate, 
                                                        Pageable pageable);
    
    // Tìm voucher được sử dụng nhiều nhất
    @Query("SELECT v.voucher.id, COUNT(v) as usageCount FROM VoucherUsageHistoryEntity v GROUP BY v.voucher.id ORDER BY usageCount DESC")
    List<Object[]> findMostUsedVouchers(Pageable pageable);
    
    // Tìm khách hàng sử dụng voucher nhiều nhất
    @Query("SELECT v.customerPhone, COUNT(v) as usageCount FROM VoucherUsageHistoryEntity v WHERE v.customerPhone IS NOT NULL GROUP BY v.customerPhone ORDER BY usageCount DESC")
    List<Object[]> findMostActiveCustomers(Pageable pageable);
    
    // Tìm lịch sử sử dụng voucher với filter
    @Query("SELECT v FROM VoucherUsageHistoryEntity v WHERE " +
           "(:voucherCode IS NULL OR v.voucherCode LIKE %:voucherCode%) AND " +
           "(:customerPhone IS NULL OR v.customerPhone LIKE %:customerPhone%) AND " +
           "(:startDate IS NULL OR v.usedAt >= :startDate) AND " +
           "(:endDate IS NULL OR v.usedAt <= :endDate) " +
           "ORDER BY v.usedAt DESC")
    Page<VoucherUsageHistoryEntity> findByFilters(@Param("voucherCode") String voucherCode,
                                                  @Param("customerPhone") String customerPhone,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate,
                                                  Pageable pageable);
}
