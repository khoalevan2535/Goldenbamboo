package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.OrderRequestDTO;
import com.poly.restaurant.dtos.OrderResponseDTO;
import com.poly.restaurant.dtos.OrderItemRequestDTO;
import com.poly.restaurant.dtos.OrderItemResponseDTO;
import com.poly.restaurant.services.OrderService;
import com.poly.restaurant.services.OrderItemService;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.entities.enums.OrderItemStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.poly.restaurant.sse.OrderSseBroadcaster;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.repositories.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/staff/orders")
@RequiredArgsConstructor
public class StaffOrderController {

    private static final Logger logger = LoggerFactory.getLogger(StaffOrderController.class);
    private final OrderService orderService;
    private final OrderItemService orderItemService;
    private final OrderSseBroadcaster orderSseBroadcaster;
    private final OrderRepository orderRepository;

    /**
     * Tạo đơn hàng mới
     * POST /api/staff/orders
     */
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO request) {
        try {
            logger.info("Staff creating order for table: {}", request.getTableId());
            OrderResponseDTO order = orderService.createOrder(request);
            logger.info("Order created successfully with ID: {}", order.getId());
            orderSseBroadcaster.emitAfterCommit("ORDER_CREATED:" + order.getId());
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating order", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy danh sách đơn hàng với pagination
     * GET /api/staff/orders?branchId={branchId}&page={page}&size={size}
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.info("Staff getting orders for branch: {}, page: {}, size: {}", branchId, page, size);
            
            // Nếu không có branchId, sử dụng branch mặc định (ID = 1)
            if (branchId == null) {
                branchId = 1L;
                logger.info("No branchId provided, using default branch: {}", branchId);
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<OrderEntity> orderPage = orderRepository.findByBranchIdOrderByCreatedAtDesc(branchId, pageable);
            
            List<OrderResponseDTO> orders = orderPage.getContent().stream()
                    .map(orderService::mapToResponseDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("orders", orders);
            response.put("totalElements", orderPage.getTotalElements());
            response.put("totalPages", orderPage.getTotalPages());
            response.put("currentPage", page);
            response.put("size", size);
            response.put("branchId", branchId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting orders for branch: {}", branchId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy danh sách đơn hàng chưa thanh toán trong ngày
     * GET /api/staff/orders/today-unpaid?branchId={branchId}
     */
    @GetMapping("/today-unpaid")
    public ResponseEntity<List<OrderResponseDTO>> getTodayUnpaidOrders(
            @RequestParam(required = false) Long branchId) {
        try {
            logger.info("Staff getting today's unpaid orders for branch: {}", branchId);
            
            // Nếu không có branchId, sử dụng branch mặc định (ID = 1)
            if (branchId == null) {
                branchId = 1L;
                logger.info("No branchId provided, using default branch: {}", branchId);
            }
            
            List<OrderResponseDTO> orders = orderService.getTodayUnpaidOrders(branchId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting today's unpaid orders for branch: {}", branchId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Thanh toán đơn hàng
     * POST /api/staff/orders/{id}/pay
     */
    @PostMapping("/{id}/pay")
    public ResponseEntity<OrderResponseDTO> payOrder(@PathVariable Long id) {
        try {
            logger.info("Staff processing payment for order: {}", id);
            OrderResponseDTO order = orderService.payOrder(id);
            orderSseBroadcaster.emitAfterCommit("ORDER_PAID:" + id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error processing payment for order: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy đơn hàng theo ID
     * GET /api/staff/orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        try {
            logger.info("Staff getting order by ID: {}", id);
            OrderResponseDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting order by ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lấy đơn hàng đang mở theo bàn
     * GET /api/staff/orders/table/{tableId}/active
     */
    @GetMapping("/table/{tableId}/active")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> getActiveOrderByTable(@PathVariable Long tableId) {
        try {
            logger.info("Staff getting active order for table: {}", tableId);
            OrderResponseDTO order = orderService.getActiveOrderByTable(tableId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting active order for table: {}", tableId, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Thêm món vào đơn hàng
     * POST /api/staff/orders/{orderId}/items
     */
    @PostMapping("/{orderId}/items")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderItemResponseDTO> addOrderItem(
            @PathVariable Long orderId,
            @RequestBody OrderItemRequestDTO request) {
        try {
            logger.info("Staff adding item to order: {}", orderId);
            request.setOrderId(orderId);
            OrderItemResponseDTO item = orderItemService.addOrderItem(request);
            logger.info("Item added successfully with ID: {}", item.getId());
            return new ResponseEntity<>(item, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error adding item to order: {}", orderId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cập nhật số lượng món trong đơn hàng
     * PUT /api/staff/orders/{orderId}/items/{itemId}
     */
    @PutMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderItemResponseDTO> updateOrderItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody OrderItemRequestDTO request) {
        try {
            logger.info("Staff updating item {} in order: {}", itemId, orderId);
            request.setOrderId(orderId);
            request.setId(itemId);
            OrderItemResponseDTO item = orderItemService.updateOrderItem(request);
            orderSseBroadcaster.emitAfterCommit("ORDER_ITEM_UPDATED:" + orderId + ":" + itemId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            logger.error("Error updating item {} in order: {}", itemId, orderId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Xóa món khỏi đơn hàng
     * DELETE /api/staff/orders/{orderId}/items/{itemId}
     */
    @DeleteMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> removeOrderItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId) {
        try {
            logger.info("Staff removing item {} from order: {}", itemId, orderId);
            orderItemService.removeOrderItem(orderId, itemId);
            orderSseBroadcaster.emitAfterCommit("ORDER_ITEM_REMOVED:" + orderId + ":" + itemId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error removing item {} from order: {}", itemId, orderId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * PUT /api/staff/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam(required = false) OrderStatus status,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        
        // Lấy status từ requestParam hoặc requestBody
        OrderStatus finalStatus = status;
        if (finalStatus == null && requestBody != null && requestBody.containsKey("status")) {
            try {
                finalStatus = OrderStatus.valueOf(requestBody.get("status").toString());
            } catch (Exception e) {
                logger.error("Invalid status value: {}", requestBody.get("status"));
                return ResponseEntity.badRequest().body(new OrderResponseDTO());
            }
        }
        
        if (finalStatus == null) {
            logger.error("No status provided for order {}", id);
            return ResponseEntity.badRequest().body(new OrderResponseDTO());
        }
        try {
            logger.info("Staff updating order {} status to: {}", id, finalStatus);
            
            // Kiểm tra order có tồn tại không
            OrderEntity order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
            
            // Cập nhật trạng thái đơn giản
            order.setStatus(finalStatus);
            order.setUpdatedAt(LocalDateTime.now());
            OrderEntity savedOrder = orderRepository.save(order);
            
            // Map to DTO
            OrderResponseDTO orderResponse = orderService.mapToResponseDTO(savedOrder);
            
            // Emit SSE event
            orderSseBroadcaster.emitAfterCommit("ORDER_STATUS_UPDATED:" + id + ":" + finalStatus.name());
            
            logger.info("✅ Order {} status updated to {} successfully", id, finalStatus);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            logger.error("❌ Error updating order {} status: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new OrderResponseDTO()
            );
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (PATCH method)
     * PATCH /api/staff/orders/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatusPatch(
            @PathVariable Long id,
            @RequestParam(required = false) OrderStatus status,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        
        // Lấy status từ requestParam hoặc requestBody
        OrderStatus finalStatus = status;
        if (finalStatus == null && requestBody != null && requestBody.containsKey("status")) {
            try {
                finalStatus = OrderStatus.valueOf(requestBody.get("status").toString());
            } catch (Exception e) {
                logger.error("Invalid status value: {}", requestBody.get("status"));
                return ResponseEntity.badRequest().body(new OrderResponseDTO());
            }
        }
        
        if (finalStatus == null) {
            logger.error("No status provided for order {}", id);
            return ResponseEntity.badRequest().body(new OrderResponseDTO());
        }
        
        try {
            logger.info("Staff updating order {} status to: {} (PATCH)", id, finalStatus);
            
            // Kiểm tra order có tồn tại không
            OrderEntity order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
            
            // Cập nhật trạng thái đơn giản
            order.setStatus(finalStatus);
            order.setUpdatedAt(LocalDateTime.now());
            OrderEntity savedOrder = orderRepository.save(order);
            
            // Map to DTO
            OrderResponseDTO orderResponse = orderService.mapToResponseDTO(savedOrder);
            
            // Emit SSE event
            orderSseBroadcaster.emitAfterCommit("ORDER_STATUS_UPDATED:" + id + ":" + finalStatus.name());
            
            logger.info("✅ Order {} status updated to {} successfully (PATCH)", id, finalStatus);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            logger.error("❌ Error updating order {} status (PATCH): {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(new OrderResponseDTO());
        }
    }

    /**
     * Cập nhật trạng thái món ăn
     * PUT /api/staff/orders/{orderId}/items/{itemId}/status
     */
    @PutMapping("/{orderId}/items/{itemId}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderItemResponseDTO> updateOrderItemStatus(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestParam OrderItemStatus status) {
        try {
            logger.info("Staff updating item {} status to: {} in order: {}", itemId, status, orderId);
            OrderItemResponseDTO item = orderItemService.updateOrderItemStatus(orderId, itemId, status);
            orderSseBroadcaster.emitAfterCommit("ORDER_ITEM_STATUS_UPDATED:" + orderId + ":" + itemId + ":" + status.name());
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            logger.error("Error updating item {} status in order: {}", itemId, orderId, e);
            return ResponseEntity.badRequest().build();
        }
    }



    /**
     * SSE stream for realtime order updates
     */
    @GetMapping("/stream")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public SseEmitter streamOrders() {
        return orderSseBroadcaster.register();
    }

    /**
     * Debug endpoint - Lấy tất cả orders trong database
     * GET /api/staff/orders/debug/all
     */
    @GetMapping("/debug/all")
    public ResponseEntity<Map<String, Object>> debugAllOrders() {
        try {
            logger.info("Debug: Getting all orders from database");
            
            List<OrderEntity> allOrders = orderRepository.findAll();
            List<OrderResponseDTO> orderDTOs = allOrders.stream()
                    .map(orderService::mapToResponseDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalOrders", allOrders.size());
            response.put("orders", orderDTOs);
            response.put("message", "All orders retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting all orders for debug", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Debug endpoint - Lấy orders theo branch
     * GET /api/staff/orders/debug/branch/{branchId}
     */
    @GetMapping("/debug/branch/{branchId}")
    public ResponseEntity<Map<String, Object>> debugOrdersByBranch(@PathVariable Long branchId) {
        try {
            logger.info("Debug: Getting orders for branch: {}", branchId);
            
            List<OrderEntity> branchOrders = orderRepository.findTodayOrdersByBranch(branchId);
            List<OrderResponseDTO> orderDTOs = branchOrders.stream()
                    .map(orderService::mapToResponseDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("branchId", branchId);
            response.put("totalOrders", branchOrders.size());
            response.put("orders", orderDTOs);
            response.put("message", "Branch orders retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting branch orders for debug", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Test endpoint để cập nhật trạng thái đơn giản
     * PUT /api/staff/orders/{id}/test-status
     */
    @PutMapping("/{id}/test-status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> testUpdateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            logger.info("Testing status update for order {} to: {}", id, status);
            
            // Kiểm tra order có tồn tại không
            OrderEntity order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
            
            logger.info("✅ Order {} found, current status: {}", id, order.getStatus());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", id);
            response.put("currentStatus", order.getStatus());
            response.put("requestedStatus", status);
            response.put("message", "Order found successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("❌ Test error for order {}: {}", id, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("orderId", id);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}




