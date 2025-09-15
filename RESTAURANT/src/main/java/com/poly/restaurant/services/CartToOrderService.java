package com.poly.restaurant.services;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.entities.*;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.entities.enums.OrderItemStatus;
import com.poly.restaurant.entities.enums.PaymentMethod;
import com.poly.restaurant.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartToOrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AccountRepository accountRepository;

    /**
     * Chuyển đổi giỏ hàng thành đơn hàng
     */
    @Transactional
    public OrderResponseDTO convertCartToOrder(Long cartId, OrderRequestDTO orderRequest) {
        log.info("Converting cart {} to order with request: {}", cartId, orderRequest);

        // Lấy giỏ hàng với items
        CartEntity cart = cartRepository.findByIdWithItems(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));

        if (cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Validate cart ownership
        validateCartOwnership(cart, orderRequest.getAccountId(), orderRequest.getSessionId());

        // Tạo đơn hàng mới
        OrderEntity order = createOrderFromCart(cart, orderRequest);

        // Tạo order items từ cart items
        List<OrderItemEntity> orderItems = createOrderItemsFromCartItems(cart.getCartItems(), order);

        // Tính tổng tiền
        calculateOrderTotal(order, orderItems);

        // Lưu đơn hàng
        OrderEntity savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        // Deactivate cart sau khi chuyển đổi
        cart.setIsActive(false);
        cartRepository.save(cart);

        log.info("Successfully converted cart {} to order {}", cartId, savedOrder.getId());

        return mapToOrderResponseDTO(savedOrder, orderItems);
    }

    /**
     * Tạo đơn hàng từ giỏ hàng
     */
    private OrderEntity createOrderFromCart(CartEntity cart, OrderRequestDTO orderRequest) {
        OrderEntity order = new OrderEntity();

        // Set thông tin cơ bản
        order.setBranch(cart.getBranch());
        order.setTable(null); // Không có table cho delivery
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Set account
        if (orderRequest.getAccountId() != null) {
            AccountEntity account = accountRepository.findById(orderRequest.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + orderRequest.getAccountId()));
            order.setAccount(account);
        } else if (cart.getAccount() != null) {
            order.setAccount(cart.getAccount());
        } else {
            // Fallback to default account
            AccountEntity defaultAccount = accountRepository.findById(1L)
                    .orElseThrow(() -> new IllegalArgumentException("Default account not found"));
            order.setAccount(defaultAccount);
        }

        // Set payment method
        if (orderRequest.getPaymentMethod() != null) {
            try {
                order.setPaymentMethod(PaymentMethod.valueOf(orderRequest.getPaymentMethod()));
            } catch (IllegalArgumentException e) {
                order.setPaymentMethod(PaymentMethod.CASH);
                log.warn("Invalid payment method: {}. Using CASH as default", orderRequest.getPaymentMethod());
            }
        } else {
            order.setPaymentMethod(PaymentMethod.CASH);
        }

        // Thông tin khách hàng
        order.setCustomerPhone(orderRequest.getCustomerPhone());
        order.setNote(orderRequest.getNotes());
        order.setDescription("Đơn hàng từ giỏ hàng - " + cart.getTotalItems() + " món");

        return order;
    }

    /**
     * Tạo order items từ cart items
     */
    private List<OrderItemEntity> createOrderItemsFromCartItems(List<CartItemEntity> cartItems, OrderEntity order) {
        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (CartItemEntity cartItem : cartItems) {
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setDiscountAmount(cartItem.getDiscountAmount());
            orderItem.setFinalPrice(cartItem.getFinalPrice());
            orderItem.setSpecialInstructions(cartItem.getSpecialInstructions());
            orderItem.setStatus(OrderItemStatus.PENDING);
            orderItem.setCreatedAt(LocalDateTime.now());
            orderItem.setUpdatedAt(LocalDateTime.now());

            // Set dish or combo
            if (cartItem.getDish() != null) {
                orderItem.setDish(cartItem.getDish());
            } else if (cartItem.getCombo() != null) {
                orderItem.setCombo(cartItem.getCombo());
            }

            // Set discount if exists
            if (cartItem.getDiscount() != null) {
                orderItem.setDiscount(cartItem.getDiscount());
            }

            orderItems.add(orderItem);
        }

        return orderItems;
    }

    /**
     * Tính tổng tiền đơn hàng
     */
    private void calculateOrderTotal(OrderEntity order, List<OrderItemEntity> orderItems) {
        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItemEntity::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(totalAmount);
    }

    /**
     * Validate cart ownership
     */
    private void validateCartOwnership(CartEntity cart, Long accountId, String sessionId) {
        if (cart.getAccount() != null) {
            // User cart
            if (accountId == null || !cart.getAccount().getId().equals(accountId)) {
                throw new IllegalArgumentException("Cart does not belong to the specified account");
            }
        } else if (cart.getSessionId() != null) {
            // Guest cart
            if (sessionId == null || !cart.getSessionId().equals(sessionId)) {
                throw new IllegalArgumentException("Cart does not belong to the specified session");
            }
        } else {
            throw new IllegalArgumentException("Invalid cart ownership");
        }
    }

    /**
     * Map OrderEntity sang OrderResponseDTO
     */
    private OrderResponseDTO mapToOrderResponseDTO(OrderEntity order, List<OrderItemEntity> orderItems) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());

        // Customer info
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setNotes(order.getNote());
        dto.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "CASH");
        dto.setPrepay(order.getPrepay() != null ? order.getPrepay() : BigDecimal.ZERO);

        // Customer name và address từ AccountEntity
        if (order.getAccount() != null) {
            dto.setCustomerName(order.getAccount().getName());
            // TODO: Add setCustomerAddress method to OrderResponseDTO
            // dto.setCustomerAddress(order.getAccount().getAddress());
        } else {
            dto.setCustomerName("Khách lẻ");
            // TODO: Add setCustomerAddress method to OrderResponseDTO
            // dto.setCustomerAddress("Không có địa chỉ");
        }

        // Order status and timestamps
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setTotalAmount(order.getTotalAmount());

        // Table info
        dto.setTableId(null);
        dto.setTableName("Khách lẻ");

        // Branch info
        if (order.getBranch() != null) {
            dto.setBranchId(order.getBranch().getId());
            dto.setBranchName(order.getBranch().getName());
        }

        // Staff info
        if (order.getAccount() != null) {
            dto.setStaffId(order.getAccount().getId());
            dto.setStaffName(order.getAccount().getUsername());
        }

        // Order items
        List<OrderItemResponseDTO> itemDTOs = orderItems.stream()
                .map(this::mapOrderItemToResponseDTO)
                .toList();
        dto.setItems(itemDTOs);

        return dto;
    }

    /**
     * Map OrderItemEntity sang OrderItemResponseDTO
     */
    private OrderItemResponseDTO mapOrderItemToResponseDTO(OrderItemEntity orderItem) {
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setId(orderItem.getId());
        dto.setOrderId(orderItem.getOrder().getId());

        // Thông tin món ăn
        if (orderItem.getDish() != null) {
            dto.setDishId(orderItem.getDish().getId());
            dto.setDishName(orderItem.getDish().getName());
            dto.setDishImage(orderItem.getDish().getImage());
        } else if (orderItem.getCombo() != null) {
            dto.setDishId(orderItem.getCombo().getId());
            dto.setDishName(orderItem.getCombo().getName());
            dto.setDishImage(orderItem.getCombo().getImage());
        }

        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getTotalPrice());
        dto.setSpecialInstructions(orderItem.getSpecialInstructions());
        dto.setStatus(orderItem.getStatus());
        dto.setCreatedAt(orderItem.getCreatedAt());
        dto.setUpdatedAt(orderItem.getUpdatedAt());
        dto.setCompletedAt(orderItem.getCompletedAt());

        // Discount info for item
        if (orderItem.getDiscount() != null) {
            dto.setDiscountId(orderItem.getDiscount().getId());
            dto.setDiscountName(orderItem.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE");
            dto.setDiscountValue(orderItem.getDiscount().getNewPrice());
        }

        // Set final_price
        dto.setFinalPrice(orderItem.getFinalPrice());

        // Thông tin bàn và chi nhánh
        dto.setTableId(null);
        dto.setTableName("Khách lẻ");
        dto.setBranchId(orderItem.getOrder().getBranch().getId());
        dto.setBranchName(orderItem.getOrder().getBranch().getName());

        return dto;
    }
}
