package com.poly.restaurant.entities;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.entities.enums.PaymentMethod;

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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "orders") // Tên bảng đã đúng theo quy ước (chữ thường, số nhiều)
public class OrderEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @CreationTimestamp
    @Column(name = "order_date", nullable = false, updatable = false)
    private Timestamp orderDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = true, length = 50)
    private PaymentMethod paymentMethod;

    @Column(name = "order_type", nullable = true, length = 20)
    private String orderType; // "ONLINE" hoặc "COUNTER"

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    @Column(name = "description", nullable = true)
    private String description;

    @PositiveOrZero(message = "Tổng tiền phải lớn hơn hoặc bằng 0")
    @Column(name = "total_amount", nullable = true, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    @Column(name = "customer_phone", nullable = true)
    private String customerPhone;

    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    @Column(name = "customer_email", nullable = true)
    private String customerEmail;

    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    @Column(name = "address", nullable = true)
    private String address;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    @Column(name = "note", nullable = true)
    private String note;

    @PositiveOrZero(message = "Số tiền đặt cọc phải lớn hơn hoặc bằng 0")
    @Column(name = "prepay", nullable = true, precision = 10, scale = 2)
    private BigDecimal prepay = BigDecimal.ZERO;

    // Liên kết với DiscountEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id", nullable = true)
    private DiscountEntity discount;

    // Mã voucher được sử dụng trong đơn hàng
    @Size(max = 50, message = "Mã voucher không được vượt quá 50 ký tự")
    @Column(name = "voucher_code", nullable = true)
    private String voucherCode;

    // OrderDetailEntity đã được xóa - chỉ sử dụng OrderItemEntity

    // Liên kết với OrderItemEntity (cho logic đặt món mới)
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> orderItems = new ArrayList<>();

    // Liên kết với AccountEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false) // Khóa ngoại, không được null
    @NotNull(message = "Tài khoản không được để trống")
    @JsonIgnore
    private AccountEntity account;

    // Liên kết với BranchEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false) // Khóa ngoại, không được null
    @NotNull(message = "Chi nhánh không được để trống")
    @JsonIgnore
    private BranchEntity branch;

    // Liên kết với TableEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = true) // Có thể để null nếu đơn hàng không gắn với bàn
    @JsonBackReference
    private TableEntity table;

    // Liên kết với DeliveryAddressEntity (cho đơn hàng giao hàng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_address_id", nullable = true) // Có thể để null nếu đơn hàng tại chỗ
    @JsonIgnore
    private DeliveryAddressEntity deliveryAddress;

    // Thông tin giao hàng
    @Size(max = 50, message = "Mã vận đơn không được vượt quá 50 ký tự")
    @Column(name = "tracking_number", nullable = true)
    private String trackingNumber;

    @Column(name = "shipping_fee", nullable = true, precision = 10, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "delivery_type", nullable = true, length = 20)
    private String deliveryType; // "pickup", "delivery"
}