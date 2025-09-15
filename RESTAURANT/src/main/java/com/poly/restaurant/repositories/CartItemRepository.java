package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    /**
     * Tìm cart item theo cart ID và item ID
     */
    @Query("SELECT ci FROM CartItemEntity ci WHERE ci.cart.id = :cartId AND " +
           "(ci.dish.id = :itemId OR ci.combo.id = :itemId)")
    Optional<CartItemEntity> findByCartIdAndItemId(@Param("cartId") Long cartId, @Param("itemId") Long itemId);

    /**
     * Tìm cart item theo cart ID và dish ID
     */
    @Query("SELECT ci FROM CartItemEntity ci WHERE ci.cart.id = :cartId AND ci.dish.id = :dishId")
    Optional<CartItemEntity> findByCartIdAndDishId(@Param("cartId") Long cartId, @Param("dishId") Long dishId);

    /**
     * Tìm cart item theo cart ID và combo ID
     */
    @Query("SELECT ci FROM CartItemEntity ci WHERE ci.cart.id = :cartId AND ci.combo.id = :comboId")
    Optional<CartItemEntity> findByCartIdAndComboId(@Param("cartId") Long cartId, @Param("comboId") Long comboId);

    /**
     * Lấy tất cả cart items của một cart
     */
    @Query("SELECT ci FROM CartItemEntity ci WHERE ci.cart.id = :cartId ORDER BY ci.createdAt ASC")
    List<CartItemEntity> findByCartIdOrderByCreatedAtAsc(@Param("cartId") Long cartId);

    /**
     * Lấy cart items với thông tin dish và combo
     */
    @Query("SELECT ci FROM CartItemEntity ci " +
           "LEFT JOIN FETCH ci.dish " +
           "LEFT JOIN FETCH ci.combo " +
           "LEFT JOIN FETCH ci.discount " +
           "WHERE ci.cart.id = :cartId " +
           "ORDER BY ci.createdAt ASC")
    List<CartItemEntity> findByCartIdWithDetails(@Param("cartId") Long cartId);

    /**
     * Đếm số lượng cart items trong cart
     */
    @Query("SELECT COUNT(ci) FROM CartItemEntity ci WHERE ci.cart.id = :cartId")
    long countByCartId(@Param("cartId") Long cartId);

    /**
     * Tính tổng số lượng items trong cart
     */
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItemEntity ci WHERE ci.cart.id = :cartId")
    Integer sumQuantityByCartId(@Param("cartId") Long cartId);

    /**
     * Tính tổng giá trị cart
     */
    @Query("SELECT COALESCE(SUM(ci.finalPrice), 0) FROM CartItemEntity ci WHERE ci.cart.id = :cartId")
    java.math.BigDecimal sumFinalPriceByCartId(@Param("cartId") Long cartId);

    /**
     * Xóa tất cả cart items của một cart
     */
    void deleteByCartId(Long cartId);

    /**
     * Tìm cart item theo ID và đảm bảo thuộc về cart của user
     */
    @Query("SELECT ci FROM CartItemEntity ci " +
           "JOIN ci.cart c " +
           "WHERE ci.id = :itemId AND " +
           "(c.account.id = :accountId OR c.sessionId = :sessionId)")
    Optional<CartItemEntity> findByIdAndCartOwner(@Param("itemId") Long itemId, 
                                                  @Param("accountId") Long accountId, 
                                                  @Param("sessionId") String sessionId);

    /**
     * Kiểm tra xem item đã có trong cart chưa
     */
    @Query("SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END FROM CartItemEntity ci " +
           "WHERE ci.cart.id = :cartId AND " +
           "(ci.dish.id = :itemId OR ci.combo.id = :itemId)")
    boolean existsByCartIdAndItemId(@Param("cartId") Long cartId, @Param("itemId") Long itemId);
}






