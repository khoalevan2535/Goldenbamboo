package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.OrderResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    /**
     * Test endpoint để gửi message qua WebSocket
     */
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public String testMessage(String message) {
        log.info("Received test message: {}", message);
        return "Server received: " + message;
    }

    /**
     * Endpoint để gửi order update qua WebSocket
     */
    @MessageMapping("/order-update")
    @SendTo("/topic/orders/status-changed")
    public OrderResponseDTO handleOrderUpdate(OrderResponseDTO order) {
        log.info("Received order update: {}", order.getId());
        return order;
    }
}





