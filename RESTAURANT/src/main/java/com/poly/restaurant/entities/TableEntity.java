package com.poly.restaurant.entities;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.poly.restaurant.entities.enums.TableStatus;

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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tables")
public class TableEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50) 
    private String name; 

    @Column(name = "description")
    private String description;

    @Column(name = "seats", nullable = false)
    private Integer seats;

    @Column(name = "area", nullable = false, length = 100)
    private String area;

    @Column(name = "table_type", length = 50)
    private String tableType = "STANDARD";

    @Column(name = "capacity_min")
    private Integer capacityMin = 2;

    @Column(name = "capacity_max")
    private Integer capacityMax = 8;

    @Column(name = "is_vip")
    private Boolean isVip = false;

    @Column(name = "price_per_hour", precision = 10, scale = 2)
    private java.math.BigDecimal pricePerHour = java.math.BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by")
    private String createdBy;

    @Enumerated(EnumType.STRING) 
    @Column(name = "status")
    private TableStatus status;


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "table", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<OrderEntity> orders;

    @OneToMany(mappedBy = "table", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<ReservationEntity> reservations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnore
    private BranchEntity branch;
}
