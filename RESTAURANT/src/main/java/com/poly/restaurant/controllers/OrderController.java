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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;
    private final OrderItemService orderItemService;

    /**
     * Tạo đơn hàng mới theo luồng nghiệp vụ mới
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO request) {
        try {
            logger.info("Creating new order for table: {}", request.getTableId());
            OrderResponseDTO order = orderService.createOrder(request);
            logger.info("Order created successfully with ID: {}", order.getId());
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating order", e);
            throw e;
        }
    }

    /**
     * Tạo đơn hàng mới - endpoint tạm thời cho frontend
     * POST /api/orders/redis-first
     */
    @PostMapping("/redis-first")
    public ResponseEntity<OrderResponseDTO> createOrderRedisFirst(@RequestBody OrderRequestDTO request) {
        try {
            logger.info("Creating new order (redis-first) for table: {}", request.getTableId());
            OrderResponseDTO order = orderService.createOrder(request);
            logger.info("Order created successfully with ID: {}", order.getId());
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating order (redis-first)", e);
            throw e;
        }
    }

    /**
     * Lấy đơn hàng theo ID
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        try {
            logger.info("Getting order by ID: {}", id);
            OrderResponseDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting order by ID: {}", id, e);
            throw e;
        }
    }

    /**
     * Lấy đơn hàng đang mở theo bàn
     * GET /api/orders/table/{tableId}/active
     */
    @GetMapping("/table/{tableId}/active")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> getActiveOrderByTable(@PathVariable Long tableId) {
        try {
            logger.info("Getting active order for table: {}", tableId);
            OrderResponseDTO order = orderService.getActiveOrderByTable(tableId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting active order for table: {}", tableId, e);
            throw e;
        }
    }

    /**
     * Thêm món vào đơn hàng
     * POST /api/orders/{orderId}/items
     */
    @PostMapping("/{orderId}/items")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderItemResponseDTO> addOrderItem(
            @PathVariable Long orderId,
            @RequestBody OrderItemRequestDTO request) {
        try {
            logger.info("Adding item to order: {}", orderId);
            request.setOrderId(orderId);
            OrderItemResponseDTO item = orderItemService.addOrderItem(request);
            logger.info("Item added successfully with ID: {}", item.getId());
            return new ResponseEntity<>(item, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error adding item to order: {}", orderId, e);
            throw e;
        }
    }

    /**
     * Cập nhật số lượng món trong đơn hàng
     * PUT /api/orders/{orderId}/items/{itemId}
     */
    @PutMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderItemResponseDTO> updateOrderItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody OrderItemRequestDTO request) {
        try {
            logger.info("Updating item {} in order: {}", itemId, orderId);
            request.setOrderId(orderId);
            request.setId(itemId);
            OrderItemResponseDTO item = orderItemService.updateOrderItem(request);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            logger.error("Error updating item {} in order: {}", itemId, orderId, e);
            throw e;
        }
    }

    /**
     * Xóa món khỏi đơn hàng
     * DELETE /api/orders/{orderId}/items/{itemId}
     */
    @DeleteMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> removeOrderItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId) {
        try {
            logger.info("Removing item {} from order: {}", itemId, orderId);
            orderItemService.removeOrderItem(orderId, itemId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error removing item {} from order: {}", itemId, orderId, e);
            throw e;
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        try {
            logger.info("Updating order {} status to: {}", id, status);
            OrderResponseDTO order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error updating order {} status", id, e);
            throw e;
        }
    }

    /**
     * Thanh toán đơn hàng
     * POST /api/orders/{id}/pay
     */
    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> payOrder(@PathVariable Long id) {
        try {
            logger.info("Processing payment for order: {}", id);
            OrderResponseDTO order = orderService.payOrder(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error processing payment for order: {}", id, e);
            throw e;
        }
    }

    /**
     * Hoàn thành đơn hàng
     * POST /api/orders/{id}/complete
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> completeOrder(@PathVariable Long id) {
        try {
            logger.info("Completing order: {}", id);
            OrderResponseDTO order = orderService.completeOrder(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error completing order: {}", id, e);
            throw e;
        }
    }

    /**
     * Lấy danh sách đơn hàng chưa thanh toán trong ngày
     * GET /api/orders/today-unpaid?branchId={branchId}
     */
    @GetMapping("/today-unpaid")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getTodayUnpaidOrders(
            @RequestParam(required = false) Long branchId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity loggedInUser) {
        try {
            // Nếu là manager, tự động filter theo branch của họ
            if (loggedInUser != null && loggedInUser.getRole() != null && 
                "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
                branchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
            }
            
            logger.info("Getting today's unpaid orders for branch: {}", branchId);
            List<OrderResponseDTO> orders = orderService.getTodayUnpaidOrders(branchId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting today's unpaid orders for branch: {}", branchId, e);
            throw e;
        }
    }
}