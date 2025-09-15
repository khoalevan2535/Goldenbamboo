package com.poly.restaurant.services;

import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.repositories.OrderRepository;
import com.poly.restaurant.repositories.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(OrderCalculationService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    // private final OrderDiscountService orderDiscountService; // Đã xóa service này

    /**
     * Tính toán và cập nhật tổng tiền đơn hàng
     */
    @Transactional
    public void calculateOrderTotal(Long orderId) {
        logger.info("Calculating total for order: {}", orderId);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        // Tính tổng tiền từ các items (sử dụng finalPrice nếu có discount, totalPrice nếu không)
        BigDecimal subtotal = orderItemRepository.findByOrderId(orderId)
                .stream()
                .map(item -> {
                    if (item.getFinalPrice() != null) {
                        // Có discount, sử dụng finalPrice
                        logger.debug("Item {} using final price: {}", item.getId(), item.getFinalPrice());
                        return item.getFinalPrice();
                    } else {
                        // Không có discount, sử dụng totalPrice
                        logger.debug("Item {} using total price: {}", item.getId(), item.getTotalPrice());
                        return item.getTotalPrice();
                    }
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính discount cho đơn hàng
        BigDecimal discountAmount = BigDecimal.ZERO;
        DiscountEntity appliedDiscount = null;
        
        // Không cần tính discount ở đây nữa vì đã chuyển sang quan hệ 1:1
        // Discount sẽ được áp dụng trực tiếp cho từng món ăn/combo

        // Tính tổng tiền cuối cùng
        BigDecimal totalAmount = subtotal.subtract(discountAmount);
        order.setTotalAmount(totalAmount);
        
        orderRepository.save(order);

        logger.info("Order {} calculated - Subtotal: {}, Discount: {}, Total: {}", 
                orderId, subtotal, discountAmount, totalAmount);
    }
}





