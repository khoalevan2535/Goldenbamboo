package com.poly.restaurant.entities;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.poly.restaurant.entities.enums.BranchStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "branches")
public class BranchEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Tên chi nhánh không được để trống")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @Column(nullable = true)
    private String province;

    @Column(nullable = true)
    private String district;

    @Column(nullable = true)
    private String ward;

    @Column(nullable = true)
    private String phone;

    @Column(name = "description")
    private String description;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    private Double latitude;
    private Double longitude;

    // Dùng Enum cho trạng thái, rõ ràng và dễ mở rộng
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BranchStatus status;

    // --- CÁC MỐI QUAN HỆ HAI CHIỀU ---
    // (mappedBy trỏ đến tên trường trong các Entity tương ứng)

    @OneToMany(mappedBy = "branch")
    @JsonIgnore // Dùng JsonIgnore để tránh lỗi lặp vô hạn khi trả về JSON
    private List<AccountEntity> accounts;

    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<OrderEntity> orders;

    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<ReservationEntity> reservations;

    // Giả sử TableEntity và MenuEntity cũng có quan hệ với Branch
    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<TableEntity> tables;

    // Các món ăn thuộc về chi nhánh này
    @OneToMany(mappedBy = "branch", fetch = jakarta.persistence.FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<DishEntity> dishes = new LinkedHashSet<>();

    // Các combo thuộc về chi nhánh này
    @OneToMany(mappedBy = "branch", fetch = jakarta.persistence.FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<ComboEntity> combos = new LinkedHashSet<>();

    // Giờ bán hàng của chi nhánh
    @OneToMany(mappedBy = "branch", fetch = jakarta.persistence.FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<BranchOperatingHours> operatingHours = new LinkedHashSet<>();

    // --- THÊM CÁC MỐI QUAN HỆ NÀY ---

    // --- CÁC METHOD TIỆN ÍCH ---
    
    /**
     * Kiểm tra chi nhánh có đang hoạt động không
     */
    public boolean isActive() {
        return status != null && status.isOpen();
    }

    /**
     * Kiểm tra chi nhánh có đang hoạt động không
     */
    public boolean canOperate() {
        return status != null && status.canOperate();
    }

    /**
     * Kiểm tra chi nhánh có đang đóng cửa không
     */
    public boolean isClosed() {
        return status != null && status.isClosed();
    }

    /**
     * Kiểm tra chi nhánh có ngừng hoạt động không
     */
    public boolean isInactive() {
        return status != null && status.isInactive();
    }

    /**
     * Lấy tên hiển thị của trạng thái
     */
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Không xác định";
    }

    /**
     * Đặt trạng thái hoạt động
     */
    public void setActive() {
        this.status = BranchStatus.OPEN;
    }

    /**
     * Đặt trạng thái dừng hoạt động
     */
    public void setInactive() {
        this.status = BranchStatus.INACTIVE;
    }

    /**
     * Đặt trạng thái bảo trì
     */
    public void setMaintenance() {
        this.status = BranchStatus.MAINTENANCE;
    }

    /**
     * Đặt trạng thái đóng cửa vĩnh viễn
     */
    public void setClosed() {
        this.status = BranchStatus.CLOSED;
    }
}