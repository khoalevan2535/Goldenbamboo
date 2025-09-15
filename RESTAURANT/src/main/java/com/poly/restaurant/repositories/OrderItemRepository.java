package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.OrderItemEntity;
import com.poly.restaurant.entities.enums.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    
    List<OrderItemEntity> findByOrderId(Long orderId);
    
    List<OrderItemEntity> findByStatus(OrderItemStatus status);
    
    List<OrderItemEntity> findByStatusIn(List<OrderItemStatus> statuses);
    
    @Query("SELECT oi FROM OrderItemEntity oi WHERE oi.order.id = :orderId AND oi.status IN :statuses")
    List<OrderItemEntity> findByOrderIdAndStatusIn(@Param("orderId") Long orderId, @Param("statuses") List<OrderItemStatus> statuses);
    
    @Query("SELECT oi FROM OrderItemEntity oi LEFT JOIN FETCH oi.order o LEFT JOIN FETCH oi.dish WHERE oi.status IN :statuses ORDER BY oi.createdAt ASC")
    List<OrderItemEntity> findKitchenItemsByStatusIn(@Param("statuses") List<OrderItemStatus> statuses);
    
    boolean existsByDishId(Long dishId);
    
    // ===== ANALYTICS QUERIES (thay thế OrderDetailRepository) =====
    
    // Top selling dishes with optimized native SQL
    @Query(value = "SELECT " +
                   "COALESCE(d.name, c.name, 'Unknown') as item_name, " +
                   "SUM(oi.quantity) as total_quantity, " +
                   "SUM(oi.quantity * oi.unit_price) as total_revenue, " +
                   "ROUND((SUM(oi.quantity) * 100.0 / (SELECT SUM(oi2.quantity) FROM order_items oi2 " +
                   "INNER JOIN orders o2 ON oi2.order_id = o2.id " +
                   "WHERE o2.created_at BETWEEN :startDate AND :endDate)), 1) as percentage " +
                   "FROM order_items oi " +
                   "INNER JOIN orders o ON oi.order_id = o.id " +
                   "LEFT JOIN dishes d ON oi.dish_id = d.id " +
                   "LEFT JOIN combos c ON oi.combo_id = c.id " +
                   "WHERE o.created_at BETWEEN :startDate AND :endDate " +
                   "GROUP BY COALESCE(d.name, c.name, 'Unknown') " +
                   "ORDER BY total_quantity DESC " +
                   "LIMIT 10", nativeQuery = true)
    List<Object[]> findTopSellingDishesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Top selling dishes by branch with optimized native SQL
    @Query(value = "SELECT " +
                   "COALESCE(d.name, c.name, 'Unknown') as item_name, " +
                   "SUM(oi.quantity) as total_quantity, " +
                   "SUM(oi.quantity * oi.unit_price) as total_revenue, " +
                   "ROUND((SUM(oi.quantity) * 100.0 / (SELECT SUM(oi2.quantity) FROM order_items oi2 " +
                   "INNER JOIN orders o2 ON oi2.order_id = o2.id " +
                   "WHERE o2.branch_id = :branchId AND o2.created_at BETWEEN :startDate AND :endDate)), 1) as percentage " +
                   "FROM order_items oi " +
                   "INNER JOIN orders o ON oi.order_id = o.id " +
                   "LEFT JOIN dishes d ON oi.dish_id = d.id " +
                   "LEFT JOIN combos c ON oi.combo_id = c.id " +
                   "WHERE o.branch_id = :branchId AND o.created_at BETWEEN :startDate AND :endDate " +
                   "GROUP BY COALESCE(d.name, c.name, 'Unknown') " +
                   "ORDER BY total_quantity DESC " +
                   "LIMIT 10", nativeQuery = true)
    List<Object[]> findTopSellingDishesByBranchAndDateRange(@Param("branchId") Long branchId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
