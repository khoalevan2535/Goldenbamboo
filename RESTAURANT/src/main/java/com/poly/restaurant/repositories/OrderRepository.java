package com.poly.restaurant.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.TableEntity;
import com.poly.restaurant.entities.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
        // Spring Data JPA sẽ tự động cung cấp các phương thức CRUD cơ bản.
        // Các phương thức tìm kiếm phức tạp hơn (ví dụ: tìm theo ngày, theo trạng thái)
        // có thể được thêm vào đây sau này nếu cần.
        boolean existsByTableAndStatusNot(TableEntity table, OrderStatus status);

        // ===== OPTIMIZED ANALYTICS QUERIES =====

        // Basic counts - optimized with native SQL
        @Query(value = "SELECT COUNT(*) FROM orders WHERE created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT COUNT(*) FROM orders WHERE branch_id = :branchId", nativeQuery = true)
        long countByBranchId(@Param("branchId") Long branchId);

        @Query(value = "SELECT COUNT(*) FROM orders WHERE branch_id = :branchId AND created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        long countByBranchIdAndCreatedAtBetween(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        // Revenue calculations - optimized with native SQL
        @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders", nativeQuery = true)
        BigDecimal getTotalRevenue();

        @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        BigDecimal getRevenueBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        BigDecimal getTotalRevenueByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE branch_id = :branchId", nativeQuery = true)
        BigDecimal getTotalRevenueByBranchId(@Param("branchId") Long branchId);

        @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE branch_id = :branchId AND created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        BigDecimal getRevenueByBranchIdBetween(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        // Average calculations - optimized with native SQL
        @Query(value = "SELECT COALESCE(AVG(total_amount), 0) FROM orders", nativeQuery = true)
        BigDecimal getAverageOrderValue();

        @Query(value = "SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        BigDecimal getAverageOrderValue(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE branch_id = :branchId", nativeQuery = true)
        BigDecimal getAverageOrderValueByBranchId(@Param("branchId") Long branchId);

        // Monthly revenue - optimized
        @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE YEAR(created_at) = :year AND MONTH(created_at) = :month", nativeQuery = true)
        BigDecimal getMonthlyRevenue(@Param("year") int year, @Param("month") int month);

        // Revenue by branch - optimized with JOIN
        @Query(value = "SELECT b.name, COALESCE(SUM(o.total_amount), 0) as revenue, COUNT(o.id) as order_count " +
                        "FROM orders o " +
                        "INNER JOIN branches b ON o.branch_id = b.id " +
                        "WHERE o.created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY b.id, b.name " +
                        "ORDER BY revenue DESC", nativeQuery = true)
        List<Object[]> findRevenueByBranchAndDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Revenue by hour - optimized
        @Query(value = "SELECT HOUR(created_at) as hour, COALESCE(SUM(total_amount), 0) as revenue, COUNT(id) as order_count "
                        +
                        "FROM orders " +
                        "WHERE created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY HOUR(created_at) " +
                        "ORDER BY hour", nativeQuery = true)
        List<Object[]> findRevenueByHour(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT HOUR(created_at) as hour, COALESCE(SUM(total_amount), 0) as revenue, COUNT(id) as order_count "
                        +
                        "FROM orders " +
                        "WHERE branch_id = :branchId AND created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY HOUR(created_at) " +
                        "ORDER BY hour", nativeQuery = true)
        List<Object[]> findRevenueByHourAndBranch(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        // Order trends - optimized
        @Query(value = "SELECT DATE(created_at) as order_date, COUNT(id) as order_count, COALESCE(SUM(total_amount), 0) as revenue "
                        +
                        "FROM orders " +
                        "WHERE created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY DATE(created_at) " +
                        "ORDER BY order_date", nativeQuery = true)
        List<Object[]> findOrderTrendsByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT DATE(created_at) as order_date, COUNT(id) as order_count, COALESCE(SUM(total_amount), 0) as revenue "
                        +
                        "FROM orders " +
                        "WHERE branch_id = :branchId AND created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY DATE(created_at) " +
                        "ORDER BY order_date", nativeQuery = true)
        List<Object[]> findOrderTrendsByBranchAndDateRange(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        // Revenue trends - optimized (simplified growth calculation)
        @Query(value = "SELECT DATE(created_at) as order_date, COALESCE(SUM(total_amount), 0) as revenue, 0.0 as growth "
                        +
                        "FROM orders " +
                        "WHERE created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY DATE(created_at) " +
                        "ORDER BY order_date", nativeQuery = true)
        List<Object[]> findRevenueTrendsByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT DATE(created_at) as order_date, COALESCE(SUM(total_amount), 0) as revenue, 0.0 as growth "
                        +
                        "FROM orders " +
                        "WHERE branch_id = :branchId AND created_at BETWEEN :startDate AND :endDate " +
                        "GROUP BY DATE(created_at) " +
                        "ORDER BY order_date", nativeQuery = true)
        List<Object[]> findRevenueTrendsByBranchAndDateRange(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        // Table utilization - optimized
        @Query(value = "SELECT COUNT(DISTINCT table_id) FROM orders WHERE branch_id = :branchId", nativeQuery = true)
        Long countDistinctTablesByBranch(@Param("branchId") Long branchId);

        @Query(value = "SELECT COUNT(DISTINCT table_id) FROM orders WHERE branch_id = :branchId AND created_at BETWEEN :startDate AND :endDate", nativeQuery = true)
        Long countOccupiedTablesByBranchAndDateRange(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        // Methods for order management
        @Query("SELECT o FROM OrderEntity o WHERE o.table.id = :tableId AND o.status IN ('PENDING', 'WAITING_FOR_KITCHEN', 'IN_PROGRESS')")
        Optional<OrderEntity> findActiveOrderByTable(@Param("tableId") Long tableId);

        List<OrderEntity> findByStatus(OrderStatus status);

        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status")
        List<OrderEntity> findByBranchIdAndStatus(@Param("branchId") Long branchId,
                        @Param("status") OrderStatus status);

        // Method để tìm đơn hàng theo branch và status, sắp xếp theo thời gian tạo
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdAndStatusOrderByCreatedAtDesc(@Param("branchId") Long branchId,
                        @Param("status") OrderStatus status);

        // Method để tìm đơn hàng theo số điện thoại khách hàng
        List<OrderEntity> findByCustomerPhone(String customerPhone);

        // Method để tìm đơn hàng theo số điện thoại và sắp xếp theo thời gian tạo
        @Query("SELECT o FROM OrderEntity o WHERE o.customerPhone = :customerPhone ORDER BY o.createdAt DESC")
        List<OrderEntity> findByCustomerPhoneOrderByCreatedAtDesc(@Param("customerPhone") String customerPhone);

        // Method để tìm đơn hàng theo account ID
        @Query("SELECT o FROM OrderEntity o WHERE o.account.id = :accountId ORDER BY o.createdAt DESC")
        List<OrderEntity> findByAccountIdOrderByCreatedAtDesc(@Param("accountId") Long accountId);

        // ===== PAGINATION METHODS FOR INFINITE SCROLL =====

        // Branch-specific pagination methods
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdOrderByCreatedAtDesc(@Param("branchId") Long branchId);

        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdAndStatus(@Param("branchId") Long branchId,
                        @Param("status") String status);

        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdWithSearch(@Param("branchId") Long branchId,
                        @Param("search") String search);

        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdWithSearchAndStatus(@Param("branchId") Long branchId,
                        @Param("search") String search,
                        @Param("status") String status);

        // Global pagination methods (no branch filter)
        @Query("SELECT o FROM OrderEntity o ORDER BY o.createdAt DESC")
        List<OrderEntity> findAllOrderByCreatedAtDesc();

        @Query("SELECT o FROM OrderEntity o WHERE o.status = :status ORDER BY o.createdAt DESC")
        List<OrderEntity> findAllByStatus(@Param("status") String status);

        @Query("SELECT o FROM OrderEntity o WHERE " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "ORDER BY o.createdAt DESC")
        List<OrderEntity> findAllWithSearch(@Param("search") String search);

        @Query("SELECT o FROM OrderEntity o WHERE o.status = :status AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "ORDER BY o.createdAt DESC")
        List<OrderEntity> findAllWithSearchAndStatus(@Param("search") String search,
                        @Param("status") String status);

        // Count methods for pagination
        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status")
        long countByBranchIdAndStatus(@Param("branchId") Long branchId, @Param("status") String status);

        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.branch.id = :branchId AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%')))")
        long countByBranchIdWithSearch(@Param("branchId") Long branchId, @Param("search") String search);

        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%')))")
        long countByBranchIdWithSearchAndStatus(@Param("branchId") Long branchId,
                        @Param("search") String search,
                        @Param("status") String status);

        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status")
        long countAllByStatus(@Param("status") String status);

        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%')))")
        long countAllWithSearch(@Param("search") String search);

        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%')))")
        long countAllWithSearchAndStatus(@Param("search") String search, @Param("status") String status);

        // ===== DAILY ORDERS METHODS =====

        /**
         * Lấy tất cả đơn hàng trong ngày hiện tại cho branch
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND DATE(o.createdAt) = CURRENT_DATE ORDER BY o.createdAt DESC")
        List<OrderEntity> findTodayOrdersByBranch(@Param("branchId") Long branchId);

        /**
         * Lấy đơn hàng theo ngày cụ thể cho branch
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND DATE(o.createdAt) = :date ORDER BY o.createdAt DESC")
        List<OrderEntity> findOrdersByBranchAndDate(@Param("branchId") Long branchId, @Param("date") String date);

        /**
         * Đếm số đơn hàng trong ngày hiện tại cho branch
         */
        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.branch.id = :branchId AND DATE(o.createdAt) = CURRENT_DATE")
        long countTodayOrdersByBranch(@Param("branchId") Long branchId);

        /**
         * Đếm số đơn hàng theo ngày cụ thể cho branch
         */
        @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.branch.id = :branchId AND DATE(o.createdAt) = :date")
        long countOrdersByBranchAndDate(@Param("branchId") Long branchId, @Param("date") String date);

        // ===== PAGINATION METHODS - OPTIMIZED =====

        /**
         * Lấy orders theo branch với pagination (không dùng fetch join để tránh
         * warning)
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId ORDER BY o.createdAt DESC")
        Page<OrderEntity> findByBranchIdOrderByCreatedAtDesc(@Param("branchId") Long branchId, Pageable pageable);

        /**
         * Lấy orders theo branch và status với pagination
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status ORDER BY o.createdAt DESC")
        Page<OrderEntity> findByBranchIdAndStatusOrderByCreatedAtDesc(@Param("branchId") Long branchId,
                        @Param("status") String status, Pageable pageable);

        /**
         * Lấy orders theo branch với search và pagination
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "ORDER BY o.createdAt DESC")
        Page<OrderEntity> findByBranchIdWithSearch(@Param("branchId") Long branchId, @Param("search") String search,
                        Pageable pageable);

        /**
         * Lấy orders theo branch, status và search với pagination
         */
        @Query("SELECT o FROM OrderEntity o WHERE o.branch.id = :branchId AND o.status = :status AND " +
                        "(LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "CAST(o.id AS string) LIKE CONCAT('%', :search, '%') OR " +
                        "LOWER(o.table.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "ORDER BY o.createdAt DESC")
        Page<OrderEntity> findByBranchIdWithSearchAndStatus(@Param("branchId") Long branchId,
                        @Param("search") String search, @Param("status") String status, Pageable pageable);

        // ===== FETCH JOIN METHODS (cho trường hợp cần load đầy đủ) =====

        /**
         * Lấy order với fetch join để load đầy đủ dữ liệu (không dùng pagination)
         */
        @Query("SELECT DISTINCT o FROM OrderEntity o " +
                        "LEFT JOIN FETCH o.branch " +
                        "LEFT JOIN FETCH o.table " +
                        "LEFT JOIN FETCH o.account " +
                        "LEFT JOIN FETCH o.discount " +
                        "LEFT JOIN FETCH o.orderItems oi " +
                        "LEFT JOIN FETCH oi.dish " +
                        "LEFT JOIN FETCH oi.discount " +
                        "WHERE o.id = :orderId")
        Optional<OrderEntity> findByIdWithFetchJoin(@Param("orderId") Long orderId);

        /**
         * Lấy orders với fetch join (không dùng pagination)
         */
        @Query("SELECT DISTINCT o FROM OrderEntity o " +
                        "LEFT JOIN FETCH o.branch " +
                        "LEFT JOIN FETCH o.table " +
                        "LEFT JOIN FETCH o.account " +
                        "LEFT JOIN FETCH o.discount " +
                        "LEFT JOIN FETCH o.orderItems oi " +
                        "LEFT JOIN FETCH oi.dish " +
                        "LEFT JOIN FETCH oi.discount " +
                        "WHERE o.branch.id = :branchId " +
                        "ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdWithFetchJoin(@Param("branchId") Long branchId);

        /**
         * Lấy orders theo branch và khoảng thời gian
         */
        @Query("SELECT o FROM OrderEntity o " +
                        "WHERE o.branch.id = :branchId " +
                        "AND o.createdAt BETWEEN :startDate AND :endDate " +
                        "ORDER BY o.createdAt DESC")
        List<OrderEntity> findByBranchIdAndDateRange(@Param("branchId") Long branchId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}