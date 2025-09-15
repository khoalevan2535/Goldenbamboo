package com.poly.restaurant.entities;

import java.time.LocalDateTime; // Sử dụng LocalDateTime
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.poly.restaurant.entities.enums.AccountStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter; // Thay thế @Data
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "accounts")
public class AccountEntity implements UserDetails {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thêm lại username cho nhân viên
    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "name", nullable = true)
    private String name;

    @Column(name = "password") // Mật khẩu có thể null cho khách hàng dùng OTP
    private String password;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "phone", unique = true, nullable = true)
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @Column(name = "reset_otp")
    private String resetOtp;

    // Các trường cho việc kích hoạt tài khoản nhân viên
    @Column(name = "activation_token")
    private String activationToken;

    @Column(name = "activation_token_expiry")
    private LocalDateTime activationTokenExpiry;

    // Các trường cho việc khóa tài khoản
    @Column(name = "failed_attempts", columnDefinition = "INT DEFAULT 0")
    private Integer failedAttempts = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "last_failed_attempt")
    private LocalDateTime lastFailedAttempt;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AccountStatus status;

    @CreationTimestamp
    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt; // Đổi sang LocalDateTime

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updateAt; // Đổi sang LocalDateTime

    // Mỗi tài khoản chỉ có một vai trò
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private RoleEntity role;

    // Các mối quan hệ khác giữ nguyên...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private BranchEntity branch;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderEntity> orders = new ArrayList<>();

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReservationEntity> reservations = new ArrayList<>();

    // PHẦN IMPLEMENT THÊM

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Trả về danh sách quyền của người dùng
        if (this.role == null)
            return List.of();
        return List.of(new SimpleGrantedAuthority(this.role.getName()));
    }

    @Override
    public String getUsername() {
        // Trả về trường dùng để đăng nhập.
        // Ưu tiên: username > email
        if (this.username != null) {
            return this.username;
        } else {
            return this.email;
        }
    }

    @Override
    public boolean isAccountNonExpired() {
        // Tài khoản không bao giờ hết hạn
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Dựa vào status của bạn để quyết định tài khoản có bị khóa hay không
        return this.status != AccountStatus.LOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // Mật khẩu không bao giờ hết hạn
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Dựa vào status để quyết định tài khoản có được kích hoạt hay không
        return this.status == AccountStatus.ACTIVE;
    }

    @Column(length = 500) // Cho phép lưu chuỗi token dài
    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;
}