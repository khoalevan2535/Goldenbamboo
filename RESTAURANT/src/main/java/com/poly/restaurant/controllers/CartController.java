package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.services.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/client/cart")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    /**
     * POST /api/client/cart/add
     * Thêm item vào giỏ hàng
     */
    @PostMapping("/add")
    public ResponseEntity<CartResponseDTO> addItemToCart(@Valid @RequestBody CartRequestDTO request) {
        log.info("Adding item to cart: {}", request);

        try {
            CartResponseDTO response = cartService.addItemToCart(request);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error adding item to cart", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * PUT /api/client/cart/items/{itemId}
     * Cập nhật số lượng item trong giỏ hàng
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequestDTO request) {
        log.info("Updating cart item: {} with request: {}", itemId, request);

        try {
            // Set the cart item ID from path variable
            request.setCartItemId(itemId);
            
            CartResponseDTO response = cartService.updateCartItem(request);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating cart item", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * DELETE /api/client/cart/items/{itemId}
     * Xóa item khỏi giỏ hàng
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDTO> removeItemFromCart(@PathVariable Long itemId) {
        log.info("Removing cart item: {}", itemId);

        try {
            CartResponseDTO response = cartService.removeItemFromCart(itemId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            log.error("Error removing cart item", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/cart
     * Lấy giỏ hàng của user (tự động tạo nếu chưa có)
     */
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String sessionId,
            @RequestParam Long branchId) {
        log.info("Getting cart for account: {}, session: {}, branch: {}", accountId, sessionId, branchId);

        try {
            CartResponseDTO response = cartService.getCart(accountId, sessionId, branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting cart", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/client/cart/create
     * Tạo giỏ hàng mới cho user
     */
    @PostMapping("/create")
    public ResponseEntity<CartResponseDTO> createCart(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String sessionId,
            @RequestParam Long branchId) {
        log.info("Creating cart for account: {}, session: {}, branch: {}", accountId, sessionId, branchId);

        try {
            CartResponseDTO response = cartService.createCart(accountId, sessionId, branchId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating cart", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/cart/list
     * Lấy danh sách giỏ hàng của user
     */
    @GetMapping("/list")
    public ResponseEntity<List<CartSummaryDTO>> getUserCarts(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String sessionId) {
        log.info("Getting user carts for account: {}, session: {}", accountId, sessionId);

        try {
            List<CartSummaryDTO> response = cartService.getUserCarts(accountId, sessionId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting user carts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * DELETE /api/client/cart/{cartId}
     * Xóa toàn bộ giỏ hàng
     */
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Map<String, String>> clearCart(@PathVariable Long cartId) {
        log.info("Clearing cart: {}", cartId);

        try {
            cartService.clearCart(cartId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cart cleared successfully");
            response.put("cartId", cartId.toString());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            log.error("Error clearing cart", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/client/cart/cleanup
     * Xóa giỏ hàng đã hết hạn (admin endpoint)
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanupExpiredCarts() {
        log.info("Cleaning up expired carts");

        try {
            cartService.cleanupExpiredCarts();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Expired carts cleaned up successfully");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
        } catch (Exception e) {
            log.error("Error cleaning up expired carts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/cart/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        log.info("Cart service health check");

        try {
            Map<String, String> response = new HashMap<>();
            response.put("status", "UP");
            response.put("service", "CartService");
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
