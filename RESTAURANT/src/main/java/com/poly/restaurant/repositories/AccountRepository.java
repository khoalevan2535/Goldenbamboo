package com.poly.restaurant.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.poly.restaurant.entities.AccountEntity;

@Repository
public interface AccountRepository extends JpaRepository<AccountEntity, Long> {

    Optional<AccountEntity> findByUsername(String username);

    // SỬA LẠI TÊN PHƯƠNG THỨC Ở ĐÂY
    Optional<AccountEntity> findByPhone(String phone);
    
    Optional<AccountEntity> findByRefreshToken(String token);
    
    Optional<AccountEntity> findByEmail(String email);
    
    Optional<AccountEntity> findByResetOtp(String resetOtp);
    
    @Query("SELECT a FROM AccountEntity a WHERE a.role.name = :role AND (:keyword = '' OR LOWER(a.name) LIKE %:keyword% OR LOWER(a.username) LIKE %:keyword% OR a.phone LIKE %:keyword%)")
    List<AccountEntity> findByRoleAndKeyword(@Param("role") String role, @Param("keyword") String keyword);

    @Query("SELECT a FROM AccountEntity a LEFT JOIN FETCH a.branch WHERE a.id = :id")
    Optional<AccountEntity> findByIdWithBranch(@Param("id") Long id);

    @Query("SELECT a FROM AccountEntity a LEFT JOIN FETCH a.role WHERE a.id = :id")
    Optional<AccountEntity> findByIdWithRole(@Param("id") Long id);

    @Query("SELECT a FROM AccountEntity a LEFT JOIN FETCH a.role WHERE a.username = :username")
    Optional<AccountEntity> findByUsernameWithRole(@Param("username") String username);

    @Query("SELECT a FROM AccountEntity a LEFT JOIN FETCH a.role WHERE a.phone = :phone")
    Optional<AccountEntity> findByPhoneWithRole(@Param("phone") String phone);

    @Query("SELECT a FROM AccountEntity a LEFT JOIN FETCH a.role WHERE a.email = :email")
    Optional<AccountEntity> findByEmailWithRole(@Param("email") String email);

    // Tìm tài khoản chưa xác thực có OTP hết hạn
    List<AccountEntity> findByStatusAndOtpExpiryBefore(com.poly.restaurant.entities.enums.AccountStatus status, java.time.LocalDateTime otpExpiry);
    
    // Tìm tài khoản theo email hoặc username
    @Query("SELECT a FROM AccountEntity a WHERE a.email = :email OR a.username = :username")
    Optional<AccountEntity> findByEmailOrUsername(@Param("email") String email, @Param("username") String username);
    
    // Tìm tài khoản bị khóa tạm thời và đã quá thời gian khóa
    List<AccountEntity> findByStatusAndLockTimeBefore(com.poly.restaurant.entities.enums.AccountStatus status, java.time.LocalDateTime lockTime);
    
    // Tìm tài khoản có lần thất bại cuối cùng trước thời gian chỉ định
    List<AccountEntity> findByLastFailedAttemptBefore(java.time.LocalDateTime lastFailedAttempt);
    
    // Đếm số tài khoản theo danh sách role
    @Query("SELECT COUNT(a) FROM AccountEntity a WHERE a.role.name IN :roles")
    Long countByRoleIn(@Param("roles") List<String> roles);
    
    // Đếm số tài khoản theo branch
    @Query("SELECT COUNT(a) FROM AccountEntity a WHERE a.branch.id = :branchId")
    Long countByBranchId(@Param("branchId") Long branchId);

}

