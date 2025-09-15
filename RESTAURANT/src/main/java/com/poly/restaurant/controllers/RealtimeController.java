package com.poly.restaurant.controllers;

import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poly.restaurant.dtos.OrderResponseDTO;
import com.poly.restaurant.services.WebSocketService;
import com.poly.restaurant.entities.enums.OrderStatus;

@RestController
@RequestMapping("/api/realtime")
public class RealtimeController {

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Get realtime connection statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getRealtimeStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("websocket", Map.of(
            "status", "ACTIVE",
            "endpoint", "/ws",
            "description", "STOMP WebSocket with SockJS support",
            "topics", new String[]{
                "/topic/orders/new",
                "/topic/orders/status-changed", 
                "/topic/orders/paid",
                "/topic/orders/list-updated",
                "/topic/test"
            }
        ));
        
        stats.put("system", Map.of(
            "messagingTemplate", messagingTemplate != null ? "AVAILABLE" : "UNAVAILABLE",
            "webSocketService", webSocketService != null ? "AVAILABLE" : "UNAVAILABLE",
            "stompEnabled", true
        ));
        
        stats.put("totalConnections", "Dynamic (STOMP WebSocket)");
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Send test order update
     */
    @PostMapping("/test/order")
    public ResponseEntity<Map<String, String>> testOrderUpdate(@RequestBody Map<String, String> request) {
        String orderId = request.get("orderId");
        String status = request.get("status");
        String message = request.get("message");
        
        // Tạo test order response
        OrderResponseDTO testOrder = new OrderResponseDTO();
        testOrder.setId(Long.parseLong(orderId));
        testOrder.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        testOrder.setNotes(message);
        
        // Gửi notification qua WebSocket
        webSocketService.notifyOrderStatusChanged(testOrder);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order update sent successfully via STOMP WebSocket");
        response.put("orderId", orderId);
        response.put("status", status);
        response.put("topic", "/topic/orders/status-changed");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Send test new order notification
     */
    @PostMapping("/test/new-order")
    public ResponseEntity<Map<String, String>> testNewOrder(@RequestBody Map<String, String> request) {
        String orderId = request.get("orderId");
        String items = request.get("items");
        String totalAmount = request.get("totalAmount");
        
        // Tạo test order response
        OrderResponseDTO testOrder = new OrderResponseDTO();
        testOrder.setId(Long.parseLong(orderId));
        testOrder.setNotes(items);
        testOrder.setTotalAmount(new BigDecimal(totalAmount != null ? totalAmount : "100000"));
        
        // Gửi notification qua WebSocket
        webSocketService.notifyNewOrder(testOrder);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "New order notification sent successfully via STOMP WebSocket");
        response.put("orderId", orderId);
        response.put("items", items);
        response.put("topic", "/topic/orders/new");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Send test order paid notification
     */
    @PostMapping("/test/order-paid")
    public ResponseEntity<Map<String, String>> testOrderPaid(@RequestBody Map<String, String> request) {
        String orderId = request.get("orderId");
        String totalAmount = request.get("totalAmount");
        
        // Tạo test order response
        OrderResponseDTO testOrder = new OrderResponseDTO();
        testOrder.setId(Long.parseLong(orderId));
        testOrder.setStatus(OrderStatus.PAID);
        testOrder.setTotalAmount(new BigDecimal(totalAmount != null ? totalAmount : "100000"));
        
        // Gửi notification qua WebSocket
        webSocketService.notifyOrderPaid(testOrder);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order paid notification sent successfully via STOMP WebSocket");
        response.put("orderId", orderId);
        response.put("status", "PAID");
        response.put("topic", "/topic/orders/paid");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Send test orders list update
     */
    @PostMapping("/test/list-update")
    public ResponseEntity<Map<String, String>> testOrdersListUpdate(@RequestBody Map<String, String> request) {
        String branchId = request.get("branchId");
        
        // Gửi notification qua WebSocket
        webSocketService.notifyOrdersListUpdated(Long.parseLong(branchId));
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Orders list update notification sent successfully via STOMP WebSocket");
        response.put("branchId", branchId);
        response.put("topic", "/topic/orders/list-updated");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get WebSocket endpoints info
     */
    @GetMapping("/endpoints")
    public ResponseEntity<Map<String, Object>> getEndpoints() {
        Map<String, Object> endpoints = new HashMap<>();
        
        endpoints.put("websocket", Map.of(
            "url", "ws://localhost:8080/ws",
            "sockjs", "http://localhost:8080/ws",
            "description", "STOMP WebSocket endpoint with SockJS fallback",
            "topics", new String[]{
                "/topic/orders/new",
                "/topic/orders/status-changed",
                "/topic/orders/paid", 
                "/topic/orders/list-updated",
                "/topic/test"
            },
            "appDestinations", new String[]{
                "/app/test",
                "/app/order-update"
            }
        ));
        
        endpoints.put("testPage", Map.of(
            "url", "http://localhost:8080/websocket-test.html",
            "description", "WebSocket test interface"
        ));
        
        return ResponseEntity.ok(endpoints);
    }

    /**
     * Health check for realtime system
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getRealtimeHealth() {
        Map<String, Object> health = new HashMap<>();
        
        boolean messagingTemplateAvailable = messagingTemplate != null;
        boolean webSocketServiceAvailable = webSocketService != null;
        boolean isHealthy = messagingTemplateAvailable && webSocketServiceAvailable;
        
        health.put("status", isHealthy ? "HEALTHY" : "DEGRADED");
        health.put("messagingTemplate", messagingTemplateAvailable ? "AVAILABLE" : "UNAVAILABLE");
        health.put("webSocketService", webSocketServiceAvailable ? "AVAILABLE" : "UNAVAILABLE");
        health.put("stompEnabled", true);
        health.put("websocketType", "STOMP with SockJS");
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }
}
