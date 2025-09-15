package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.services.CartToOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/client/cart-order")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CartOrderController {

    private final CartToOrderService cartToOrderService;

    /**
     * POST /api/client/cart-order/convert/{cartId}
     * Chuyển đổi giỏ hàng thành đơn hàng
     */
    @PostMapping("/convert/{cartId}")
    public ResponseEntity<OrderResponseDTO> convertCartToOrder(
            @PathVariable Long cartId,
            @Valid @RequestBody OrderRequestDTO orderRequest) {
        
        log.info("Converting cart {} to order with request: {}", cartId, orderRequest);

        try {
            OrderResponseDTO response = cartToOrderService.convertCartToOrder(cartId, orderRequest);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error converting cart to order", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/cart-order/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        log.info("Cart-Order service health check");

        try {
            Map<String, String> response = new HashMap<>();
            response.put("status", "UP");
            response.put("service", "CartToOrderService");
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            log.error("Health check failed", e);
            Map<String, String> response = new HashMap<>();
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.status(503)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        }
    }
}






