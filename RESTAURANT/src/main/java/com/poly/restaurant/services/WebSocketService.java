package com.poly.restaurant.services;

import com.poly.restaurant.dtos.OrderResponseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Thông báo có đơn hàng mới
     */
    public void notifyNewOrder(OrderResponseDTO order) {
        try {
            String destination = "/topic/orders/new";
            messagingTemplate.convertAndSend(destination, order);
            logger.info("✅ WebSocket notification sent for new order: {}", order.getId());
        } catch (Exception e) {
            logger.error("❌ Failed to send WebSocket notification for new order: {}", e.getMessage());
        }
    }

    /**
     * Thông báo trạng thái đơn hàng thay đổi
     */
    public void notifyOrderStatusChanged(OrderResponseDTO order) {
        try {
            String destination = "/topic/orders/status-changed";
            messagingTemplate.convertAndSend(destination, order);
            logger.info("✅ WebSocket notification sent for order status change: {}", order.getId());
        } catch (Exception e) {
            logger.error("❌ Failed to send WebSocket notification for order status change: {}", e.getMessage());
        }
    }

    /**
     * Thông báo đơn hàng đã thanh toán
     */
    public void notifyOrderPaid(OrderResponseDTO order) {
        try {
            String destination = "/topic/orders/paid";
            messagingTemplate.convertAndSend(destination, order);
            logger.info("✅ WebSocket notification sent for order paid: {}", order.getId());
        } catch (Exception e) {
            logger.error("❌ Failed to send WebSocket notification for order paid: {}", e.getMessage());
        }
    }

    /**
     * Thông báo cập nhật danh sách đơn hàng
     */
    public void notifyOrdersListUpdated(Long branchId) {
        try {
            String destination = "/topic/orders/list-updated";
            messagingTemplate.convertAndSend(destination, branchId);
            logger.info("✅ WebSocket notification sent for orders list update: branch {}", branchId);
        } catch (Exception e) {
            logger.error("❌ Failed to send WebSocket notification for orders list update: {}", e.getMessage());
        }
    }
}





