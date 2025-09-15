package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {

    /**
     * Tìm giỏ hàng active của user trong branch cụ thể
     */
    @Query("SELECT c FROM CartEntity c WHERE c.account.id = :accountId AND c.branch.id = :branchId AND c.isActive = true")
    Optional<CartEntity> findActiveCartByAccountAndBranch(@Param("accountId") Long accountId, @Param("branchId") Long branchId);

    /**
     * Tìm giỏ hàng active của session (cho guest users)
     */
    @Query("SELECT c FROM CartEntity c WHERE c.sessionId = :sessionId AND c.branch.id = :branchId AND c.isActive = true")
    Optional<CartEntity> findActiveCartBySessionAndBranch(@Param("sessionId") String sessionId, @Param("branchId") Long branchId);

    /**
     * Lấy tất cả giỏ hàng của user
     */
    @Query("SELECT c FROM CartEntity c WHERE c.account.id = :accountId ORDER BY c.updatedAt DESC")
    List<CartEntity> findByAccountIdOrderByUpdatedAtDesc(@Param("accountId") Long accountId);

    /**
     * Lấy tất cả giỏ hàng của session
     */
    @Query("SELECT c FROM CartEntity c WHERE c.sessionId = :sessionId ORDER BY c.updatedAt DESC")
    List<CartEntity> findBySessionIdOrderByUpdatedAtDesc(@Param("sessionId") String sessionId);

    /**
     * Tìm giỏ hàng đã hết hạn
     */
    @Query("SELECT c FROM CartEntity c WHERE c.expiresAt < :now AND c.isActive = true")
    List<CartEntity> findExpiredCarts(@Param("now") LocalDateTime now);

    /**
     * Đếm số lượng giỏ hàng active của user trong branch
     */
    @Query("SELECT COUNT(c) FROM CartEntity c WHERE c.account.id = :accountId AND c.branch.id = :branchId AND c.isActive = true")
    long countActiveCartsByAccountAndBranch(@Param("accountId") Long accountId, @Param("branchId") Long branchId);

    /**
     * Tìm giỏ hàng theo ID và đảm bảo thuộc về user hoặc session
     */
    @Query("SELECT c FROM CartEntity c WHERE c.id = :cartId AND (c.account.id = :accountId OR c.sessionId = :sessionId)")
    Optional<CartEntity> findByIdAndAccountOrSession(@Param("cartId") Long cartId, @Param("accountId") Long accountId, @Param("sessionId") String sessionId);

    /**
     * Lấy giỏ hàng với cart items (eager loading)
     */
    @Query("SELECT c FROM CartEntity c LEFT JOIN FETCH c.cartItems WHERE c.id = :cartId")
    Optional<CartEntity> findByIdWithItems(@Param("cartId") Long cartId);

    /**
     * Lấy giỏ hàng active với cart items
     */
    @Query("SELECT c FROM CartEntity c LEFT JOIN FETCH c.cartItems WHERE c.account.id = :accountId AND c.branch.id = :branchId AND c.isActive = true")
    Optional<CartEntity> findActiveCartWithItemsByAccountAndBranch(@Param("accountId") Long accountId, @Param("branchId") Long branchId);

    /**
     * Lấy giỏ hàng active với cart items cho session
     */
    @Query("SELECT c FROM CartEntity c LEFT JOIN FETCH c.cartItems WHERE c.sessionId = :sessionId AND c.branch.id = :branchId AND c.isActive = true")
    Optional<CartEntity> findActiveCartWithItemsBySessionAndBranch(@Param("sessionId") String sessionId, @Param("branchId") Long branchId);
}






