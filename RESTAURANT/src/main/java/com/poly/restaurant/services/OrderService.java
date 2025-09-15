package com.poly.restaurant.services;

import com.poly.restaurant.dtos.OrderRequestDTO;
import com.poly.restaurant.dtos.OrderResponseDTO;
import com.poly.restaurant.dtos.OrderItemRequestDTO;
import com.poly.restaurant.dtos.OrderItemResponseDTO;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.OrderItemEntity;
import com.poly.restaurant.entities.TableEntity;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.dtos.VoucherUsageHistoryRequestDTO;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.entities.enums.OrderItemStatus;
import com.poly.restaurant.entities.enums.PaymentMethod;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.repositories.OrderRepository;
import com.poly.restaurant.repositories.TableRepository;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.DiscountRepository;
import com.poly.restaurant.repositories.AccountRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final BranchRepository branchRepository;
    private final DiscountRepository discountRepository;
    private final OrderItemService orderItemService;
    private final AccountRepository accountRepository;
    private final OrderCalculationService orderCalculationService;
    // Removed SimpleCacheService dependency
    private final WebSocketService webSocketService;
    private final VoucherUsageHistoryService voucherUsageHistoryService;

    /**
     * Tạo đơn hàng mới
     * Luồng: DB -> Cache -> WebSocket
     */
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        logger.info("Creating new order for table: {}", request.getTableId());

        // 1. Chuẩn bị và lưu đơn hàng vào Database
        OrderEntity order = prepareOrderEntity(request);
        OrderEntity savedOrder = orderRepository.save(order);
        logger.info("✅ Order saved to database with ID: {}", savedOrder.getId());

        // 2. Xử lý order items nếu có
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequestDTO itemRequest : request.getItems()) {
                itemRequest.setOrderId(savedOrder.getId());
                orderItemService.addOrderItem(itemRequest);
            }
            logger.info("✅ {} order items added", request.getItems().size());
        }

        // 3. Tính toán tổng tiền nếu không được cung cấp từ frontend
        if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
            orderCalculationService.calculateOrderTotal(savedOrder.getId());
            // Lấy lại order sau khi tính toán
            savedOrder = orderRepository.findById(savedOrder.getId()).orElse(savedOrder);
            logger.info("✅ Total amount calculated and updated");
        }

        // 4. Lưu lịch sử sử dụng voucher nếu có
        if (savedOrder.getVoucherCode() != null && !savedOrder.getVoucherCode().trim().isEmpty()) {
            try {
                saveVoucherUsageHistory(savedOrder, request);
                logger.info("✅ Voucher usage history saved");
            } catch (Exception e) {
                logger.error("❌ Failed to save voucher usage history: {}", e.getMessage());
                // Không throw exception để không làm fail order creation
            }
        }

        // Removed cache operations

        // 7. Gửi thông báo WebSocket
        try {
            OrderResponseDTO orderResponse = mapToResponseDTO(savedOrder);
            webSocketService.notifyOrderStatusChanged(orderResponse);
            logger.info("✅ WebSocket notification sent");
        } catch (Exception e) {
            logger.error("❌ Failed to send WebSocket notification: {}", e.getMessage());
        }

        return mapToResponseDTO(savedOrder);
    }

    /**
     * Cập nhật trạng thái đơn hàng (thanh toán)
     * Luồng: DB -> Redis -> WebSocket
     */
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        logger.info("Updating order status - ID: {}, Status: {}", orderId, status);

        // 1. Cập nhật trong Database chính TRƯỚC
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        OrderEntity savedOrder = orderRepository.save(order);
        logger.info("✅ Order status updated in database");

        // Removed cache operations

        // 4. Gửi thông báo WebSocket
        try {
            OrderResponseDTO orderResponse = mapToResponseDTO(savedOrder);
            webSocketService.notifyOrderStatusChanged(orderResponse);
            logger.info("✅ WebSocket notification sent");
        } catch (Exception e) {
            logger.error("❌ Failed to send WebSocket notification: {}", e.getMessage());
        }

        return mapToResponseDTO(savedOrder);
    }

    /**
     * Thanh toán đơn hàng - cập nhật thành PAID
     */
    @Transactional
    public OrderResponseDTO payOrder(Long orderId) {
        logger.info("Processing payment for order: {}", orderId);
        return updateOrderStatus(orderId, OrderStatus.PAID);
    }

    /**
     * Lấy danh sách đơn hàng chưa thanh toán trong ngày
     * Ưu tiên lấy từ Redis cache, fallback về database
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getTodayUnpaidOrders(Long branchId) {
        logger.info("Getting today's unpaid orders for branch: {}", branchId);

        // Removed cache operations - always get from database

        // 2. Fallback: lấy từ database
        try {
            List<OrderEntity> orders = orderRepository.findTodayOrdersByBranch(branchId);
            List<OrderResponseDTO> orderDTOs = orders.stream()
                    .filter(order -> order.getStatus() != OrderStatus.PAID &&
                            order.getStatus() != OrderStatus.COMPLETED)
                    .map(this::mapToResponseDTO)
                    .collect(Collectors.toList());

            // Removed cache operations

            logger.info("✅ Returning {} unpaid orders from database", orderDTOs.size());
            return orderDTOs;
        } catch (Exception e) {
            logger.error("❌ Failed to get orders from database: {}", e.getMessage());
            throw new RuntimeException("Failed to get today's unpaid orders", e);
        }
    }

    /**
     * Chuẩn bị OrderEntity từ OrderRequestDTO
     */
    private OrderEntity prepareOrderEntity(OrderRequestDTO request) {
        // Kiểm tra bàn có tồn tại không (cho phép null nếu không chọn bàn)
        TableEntity table = null;
        if (request.getTableId() != null) {
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Table not found with id: " + request.getTableId()));
        }

        // Lấy account từ SecurityContext hoặc sử dụng account mặc định cho test
        AccountEntity currentAccount;
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Current username: {}", username);

            // Thử tìm bằng username trước, nếu không có thì tìm bằng email
            currentAccount = accountRepository.findByUsername(username)
                    .orElseGet(() -> {
                        logger.info("User not found by username, trying email: {}", username);
                        return accountRepository.findByEmail(username)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Account not found for user/email: " + username));
                    });
            logger.info("Found account: {} (ID: {})", currentAccount.getUsername(), currentAccount.getId());
        } catch (Exception e) {
            // Nếu không có authentication, sử dụng account mặc định cho test
            logger.warn("No authentication found, using default account for testing");
            currentAccount = accountRepository.findById(1L) // Sử dụng account ID 1 làm mặc định
                    .orElseThrow(() -> new ResourceNotFoundException("Default account not found"));
            logger.info("Using default account: {} (ID: {})", currentAccount.getUsername(), currentAccount.getId());
        }

        // Tạo đơn hàng mới
        OrderEntity order = new OrderEntity();
        order.setTable(table);

        // Nếu không có table, lấy branch từ account
        if (table != null) {
            order.setBranch(table.getBranch());
        } else {
            // Lấy branch từ account hiện tại
            order.setBranch(currentAccount.getBranch());
        }

        order.setAccount(currentAccount);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        
        // Set order type
        order.setOrderType(request.getOrderType() != null ? request.getOrderType() : "COUNTER");

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

        // Cập nhật thông tin đơn hàng
        order.setCustomerPhone(request.getCustomerPhone());
        order.setCustomerEmail(request.getCustomerEmail()); // Set customer email from request
        order.setAddress(request.getAddress()); // Set address from request
        order.setNote(request.getNotes()); // Map notes to note field
        order.setDescription(request.getNotes()); // Map notes to description
        order.setPrepay(BigDecimal.ZERO); // Set prepay default value

        // Lưu customer name vào description nếu có
        if (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty()) {
            String currentDesc = order.getDescription() != null ? order.getDescription() : "";
            order.setDescription(currentDesc + " - Khách hàng: " + request.getCustomerName());
        }
        order.setUpdatedAt(LocalDateTime.now());

        // Xử lý khuyến mãi nếu có
        if (request.getDiscountId() != null) {
            DiscountEntity discount = discountRepository.findById(request.getDiscountId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Discount not found with id: " + request.getDiscountId()));
            order.setDiscount(discount);
        }

        // Xử lý voucher code nếu có
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            order.setVoucherCode(request.getVoucherCode().trim());
        }

        return order;
    }

    /**
     * Lấy đơn hàng theo ID
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        return mapToResponseDTO(order);
    }

    /**
     * Lấy đơn hàng đang mở theo bàn
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getActiveOrderByTable(Long tableId) {
        OrderEntity order = orderRepository.findActiveOrderByTable(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("No active order found for table: " + tableId));

        return mapToResponseDTO(order);
    }

    /**
     * Hoàn thành đơn hàng
     */
    @Transactional
    public OrderResponseDTO completeOrder(Long orderId) {
        logger.info("Completing order: {}", orderId);
        return updateOrderStatus(orderId, OrderStatus.COMPLETED);
    }

    /**
     * Tính tổng tiền đơn hàng
     */
    @Transactional
    public void calculateOrderTotal(Long orderId) {
        // Sử dụng OrderCalculationService để tránh circular dependency
        orderCalculationService.calculateOrderTotal(orderId);
    }

    /**
     * Tính toán số tiền giảm giá
     */
    private BigDecimal calculateDiscountAmount(BigDecimal subtotal, DiscountEntity discount) {
        // Với hệ thống mới, discount chỉ có newPrice
        // Không cần tính toán phức tạp, chỉ cần trả về số tiền giảm
        return BigDecimal.ZERO; // Sẽ được tính ở frontend dựa trên newPrice
    }

    /**
     * Map OrderEntity sang OrderResponseDTO - Public method để RedisCacheService có
     * thể sử dụng
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO mapToResponseDTO(OrderEntity order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());

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

        // Customer info
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setAddress(order.getAddress());
        dto.setNotes(order.getNote()); // Use note field instead of notes
        dto.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "CASH");
        dto.setOrderType(order.getOrderType() != null ? order.getOrderType() : "COUNTER");

        // Order status and timestamps
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // Total amount
        dto.setTotalAmount(order.getTotalAmount());

        // Discount info
        if (order.getDiscount() != null) {
            dto.setDiscountId(order.getDiscount().getId());
            dto.setDiscountName(order.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(order.getDiscount().getNewPrice());
        }

        // Staff info
        if (order.getAccount() != null) {
            dto.setStaffId(order.getAccount().getId());
            dto.setStaffName(order.getAccount().getUsername());
        }

        // Order items - map to OrderItemResponseDTO
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream()
                    .map(this::mapToOrderItemResponseDTO)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        return dto;
    }

    /**
     * Map OrderItemEntity sang OrderItemResponseDTO
     */
    @Transactional(readOnly = true)
    private OrderItemResponseDTO mapToOrderItemResponseDTO(OrderItemEntity item) {
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setId(item.getId());
        dto.setOrderId(item.getOrder().getId());
        
        // TODO: Implement menu dish relationship if needed
        // if (item.getMenuDish() != null) {
        //     dto.setMenuDishId(item.getMenuDish().getId());
        //     // Lấy thông tin từ DishEntity
        //     if (item.getMenuDish().getDish() != null) {
        //         dto.setDishId(item.getMenuDish().getDish().getId());
        //         dto.setDishName(item.getMenuDish().getDish().getName());
        //         dto.setDishImage(item.getMenuDish().getDish().getImage());
        //     }
        // }

        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        dto.setSpecialInstructions(item.getSpecialInstructions());
        dto.setStatus(item.getStatus());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        dto.setCompletedAt(item.getCompletedAt());

        // Discount info for item
        if (item.getDiscount() != null) {
            dto.setDiscountId(item.getDiscount().getId());
            dto.setDiscountName(item.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(item.getDiscount().getNewPrice());
        }

        dto.setFinalPrice(item.getFinalPrice());

        // Table and branch info
        if (item.getOrder() != null && item.getOrder().getTable() != null) {
            dto.setTableId(item.getOrder().getTable().getId());
            dto.setTableName(item.getOrder().getTable().getName());
        }
        if (item.getOrder() != null && item.getOrder().getBranch() != null) {
            dto.setBranchId(item.getOrder().getBranch().getId());
            dto.setBranchName(item.getOrder().getBranch().getName());
        }

        return dto;
    }

    /**
     * Lưu lịch sử sử dụng voucher
     */
    private void saveVoucherUsageHistory(OrderEntity order, OrderRequestDTO request) {
        if (order.getVoucherCode() == null || order.getVoucherCode().trim().isEmpty()) {
            return;
        }

        // Tìm voucher theo code
        Optional<DiscountEntity> voucherOpt = discountRepository.findByCode(order.getVoucherCode());
        if (!voucherOpt.isPresent()) {
            logger.warn("Voucher not found with code: {}", order.getVoucherCode());
            return;
        }

        DiscountEntity voucher = voucherOpt.get();
        
        // Tính toán số tiền
        BigDecimal originalAmount = order.getTotalAmount();
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalAmount = originalAmount;

        // Nếu có discount được áp dụng, tính toán số tiền giảm
        if (order.getDiscount() != null) {
            // Tính số tiền giảm dựa trên giá gốc và giá mới
            // Giả sử discount.newPrice là giá sau giảm cho toàn bộ đơn hàng
            // Hoặc có thể tính dựa trên từng item trong order
            discountAmount = originalAmount.subtract(voucher.getNewPrice());
            finalAmount = voucher.getNewPrice();
        }

        // Tạo request DTO
        VoucherUsageHistoryRequestDTO historyRequest = new VoucherUsageHistoryRequestDTO();
        historyRequest.setVoucherId(voucher.getId());
        historyRequest.setOrderId(order.getId());
        historyRequest.setCustomerPhone(request.getCustomerPhone());
        historyRequest.setCustomerName("Khách hàng tại quầy"); // Default customer name
        historyRequest.setVoucherCode(order.getVoucherCode());
        historyRequest.setOriginalAmount(originalAmount);
        historyRequest.setDiscountAmount(discountAmount);
        historyRequest.setFinalAmount(finalAmount);

        // Lưu lịch sử
        voucherUsageHistoryService.saveVoucherUsage(historyRequest);
        
        logger.info("Voucher usage history saved for order {} with voucher {}", 
                   order.getId(), order.getVoucherCode());
    }
}