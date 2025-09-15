package com.poly.restaurant.services;

import com.poly.restaurant.dtos.OrderRequestDTO;
import com.poly.restaurant.dtos.OrderResponseDTO;
import com.poly.restaurant.dtos.OrderItemRequestDTO;
import com.poly.restaurant.dtos.OrderItemResponseDTO;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.OrderItemEntity;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.entities.enums.OrderItemStatus;
import com.poly.restaurant.repositories.OrderRepository;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.OrderItemRepository;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.poly.restaurant.entities.enums.PaymentMethod;

@Service
@RequiredArgsConstructor
public class ClientOrderService {

    private static final Logger logger = LoggerFactory.getLogger(ClientOrderService.class);

    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;
    private final AccountRepository accountRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Tạo đơn hàng mới từ khách hàng (delivery order)
     */
    @Transactional
    public OrderResponseDTO createClientOrder(OrderRequestDTO request) {
        logger.info("Creating client order for delivery");

        // Kiểm tra branch có tồn tại không
        BranchEntity branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + request.getBranchId()));

        // Lấy account từ request hoặc sử dụng account mặc định
        logger.info("Creating order with account_id: {}", request.getAccountId());
        AccountEntity account;
        if (request.getAccountId() != null) {
            account = accountRepository.findById(request.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Account not found with id: " + request.getAccountId()));
            logger.info("Using account from request: {} (ID: {})", account.getUsername(), account.getId());
        } else {
            // Fallback to default account nếu không có account_id
            account = accountRepository.findById(1L)
                    .orElseThrow(() -> new ResourceNotFoundException("Default account not found"));
            logger.warn("No account_id provided, using default account: {} (ID: {})", account.getUsername(),
                    account.getId());
        }

        // Tạo đơn hàng mới (không cần table)
        OrderEntity order = new OrderEntity();

        // Set thông tin cơ bản
        order.setBranch(branch);
        order.setAccount(account); // Set account từ request
        order.setTable(null); // Không có table cho delivery
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Set payment method
        if (request.getPaymentMethod() != null) {
            try {
                order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
            } catch (IllegalArgumentException e) {
                // Nếu payment method không hợp lệ, set mặc định là CASH
                order.setPaymentMethod(PaymentMethod.CASH);
                logger.warn("Invalid payment method: {}. Using CASH as default", request.getPaymentMethod());
            }
        } else {
            order.setPaymentMethod(PaymentMethod.CASH); // Mặc định
        }

        // Thông tin khách hàng
        order.setCustomerPhone(request.getCustomerPhone());
        order.setCustomerEmail(request.getCustomerEmail()); // Set customer email from request
        order.setAddress(request.getAddress()); // Set address from request
        order.setNote(request.getNotes());

        // Tạo description với thông tin khách hàng
        String description = "Đơn hàng giao hàng - " +
                (request.getItems() != null ? request.getItems().size() : 0) + " món";
        if (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty()) {
            description += " - Khách hàng: " + request.getCustomerName();
        }
        order.setDescription(description);

        // Lưu đơn hàng
        OrderEntity savedOrder = orderRepository.save(order);
        logger.info("Client order created with ID: {}", savedOrder.getId());

        // Xử lý các món ăn
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequestDTO itemRequest : request.getItems()) {
                // Tạo order item
                OrderItemEntity orderItem = new OrderItemEntity();

                orderItem.setOrder(savedOrder);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(BigDecimal.valueOf(itemRequest.getUnitPrice()));
                orderItem.setSpecialInstructions(itemRequest.getNote());
                orderItem.setStatus(OrderItemStatus.PENDING);
                orderItem.setCreatedAt(LocalDateTime.now());
                orderItem.setUpdatedAt(LocalDateTime.now());

                // Set MenuDish nếu có menuDishId (tạm thời bỏ qua vì MenuDishEntity không tồn tại)
                // TODO: Implement menu dish relationship if needed

                orderItemRepository.save(orderItem);
            }
        }

        // Tính tổng tiền
        calculateOrderTotal(savedOrder.getId());

        return mapToResponseDTO(savedOrder);
    }

    /**
     * Lấy đơn hàng theo ID
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getClientOrderById(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToResponseDTO(order);
    }

    /**
     * Lấy đơn hàng theo số điện thoại khách hàng
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getClientOrdersByPhone(String phone) {
        // Sử dụng method có sẵn trong OrderRepository
        List<OrderEntity> orders = orderRepository.findByCustomerPhone(phone);
        return orders.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * Lấy đơn hàng theo account ID của user
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getClientOrdersByAccountId(Long accountId) {
        logger.info("Getting orders for account ID: {}", accountId);

        // Lấy đơn hàng theo account ID
        List<OrderEntity> orders = orderRepository.findByAccountIdOrderByCreatedAtDesc(accountId);

        logger.info("Found {} orders for account ID: {}", orders.size(), accountId);

        return orders.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, String status) {
        logger.info("Updating order {} status to: {}", orderId, status);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status);

            // Kiểm tra quyền hủy đơn hàng - chỉ cho phép hủy khi đang ở trạng thái PENDING
            // hoặc CONFIRMED
            if (newStatus == OrderStatus.CANCELED) {
                if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
                    logger.warn("Cannot cancel order {} in status: {}", orderId, order.getStatus());
                    throw new IllegalArgumentException("Không thể hủy đơn hàng ở trạng thái: " + order.getStatus());
                }
            }

            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());

            OrderEntity updatedOrder = orderRepository.save(order);
            logger.info("Order {} status updated to: {}", orderId, status);

            return mapToResponseDTO(updatedOrder);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid order status: {}", status);
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }

    /**
     * Tính tổng tiền đơn hàng
     */
    private void calculateOrderTotal(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Tính tổng từ order items
        BigDecimal total = orderItemRepository.findByOrderId(orderId)
                .stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);
        orderRepository.save(order);

        logger.info("Order total calculated: {}", total);
    }

    /**
     * Map OrderEntity sang OrderResponseDTO
     */
    private OrderResponseDTO mapToResponseDTO(OrderEntity order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());

        // Customer info
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setAddress(order.getAddress());
        dto.setNotes(order.getNote());
        dto.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "CASH");
        dto.setPrepay(order.getPrepay() != null ? order.getPrepay() : BigDecimal.ZERO);

        // Customer name từ AccountEntity
        if (order.getAccount() != null) {
            dto.setCustomerName(order.getAccount().getName());
        } else {
            dto.setCustomerName("Khách lẻ");
        }

        // Order status and timestamps
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setTotalAmount(order.getTotalAmount());

        // Table info
        if (order.getTable() != null) {
            dto.setTableId(order.getTable().getId());
            dto.setTableName(order.getTable().getName());
        } else {
            dto.setTableId(null);
            dto.setTableName("Khách lẻ");
        }

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

        // Discount info
        if (order.getDiscount() != null) {
            dto.setDiscountId(order.getDiscount().getId());
            dto.setDiscountName(order.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(order.getDiscount().getNewPrice());
        }

        // Order items - load order items từ database
        List<OrderItemEntity> orderItems = orderItemRepository.findByOrderId(order.getId());
        if (orderItems != null && !orderItems.isEmpty()) {
            List<OrderItemResponseDTO> itemDTOs = orderItems.stream()
                    .map(this::mapOrderItemToResponseDTO)
                    .toList();
            dto.setItems(itemDTOs);
        } else {
            dto.setItems(new ArrayList<>());
        }

        // Đảm bảo total_amount được tính đúng
        if (dto.getTotalAmount() == null || dto.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
            // Tính lại total_amount từ order items
            if (orderItems != null && !orderItems.isEmpty()) {
                BigDecimal calculatedTotal = orderItems.stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                dto.setTotalAmount(calculatedTotal);

                // Cập nhật lại vào database
                order.setTotalAmount(calculatedTotal);
                orderRepository.save(order);
            }
        }

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
        }

        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
        dto.setSpecialInstructions(orderItem.getSpecialInstructions());
        dto.setStatus(orderItem.getStatus());
        dto.setCreatedAt(orderItem.getCreatedAt());
        dto.setUpdatedAt(orderItem.getUpdatedAt());
        dto.setCompletedAt(orderItem.getCompletedAt());

        // Discount info for item
        if (orderItem.getDiscount() != null) {
            dto.setDiscountId(orderItem.getDiscount().getId());
            dto.setDiscountName(orderItem.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(orderItem.getDiscount().getNewPrice());
        }

        // Set final_price = total_price (không có discount cho đơn giản)
        dto.setFinalPrice(dto.getTotalPrice());

        // Thông tin bàn và chi nhánh
        if (orderItem.getOrder().getTable() != null) {
            dto.setTableId(orderItem.getOrder().getTable().getId());
            dto.setTableName(orderItem.getOrder().getTable().getName());
        } else {
            dto.setTableId(null);
            dto.setTableName("Khách lẻ");
        }
        dto.setBranchId(orderItem.getOrder().getBranch().getId());
        dto.setBranchName(orderItem.getOrder().getBranch().getName());

        return dto;
    }
}
