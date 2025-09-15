package com.poly.restaurant.entities;

import com.poly.restaurant.entities.enums.DayOfWeek;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "branch_operating_hours")
public class BranchOperatingHours implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private BranchEntity branch;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;

    @Column(name = "is_open", nullable = false)
    private boolean isOpen = true;

    @Column(name = "description")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructor tiện lợi
    public BranchOperatingHours(BranchEntity branch, DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime) {
        this.branch = branch;
        this.dayOfWeek = dayOfWeek;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.isOpen = true;
    }

    // Kiểm tra xem thời gian hiện tại có trong giờ bán hàng không
    public boolean isCurrentlyOpen() {
        if (!isOpen) {
            return false;
        }
        
        LocalTime now = LocalTime.now();
        return !now.isBefore(openTime) && !now.isAfter(closeTime);
    }

    // Lấy thời gian bán hàng dạng string
    public String getOperatingHoursString() {
        if (!isOpen) {
            return "Nghỉ";
        }
        return openTime.toString() + " - " + closeTime.toString();
    }
}
