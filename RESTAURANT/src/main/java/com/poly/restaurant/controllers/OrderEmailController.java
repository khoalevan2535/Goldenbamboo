package com.poly.restaurant.controllers;

import com.poly.restaurant.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderEmailController {

    private static final Logger logger = LoggerFactory.getLogger(OrderEmailController.class);
    private final EmailService emailService;

    /**
     * Gửi email xác nhận đặt hàng thành công
     * POST /api/email/order-confirmation
     */
    @PostMapping("/order-confirmation")
    public ResponseEntity<Map<String, Object>> sendOrderConfirmationEmail(@RequestBody Map<String, Object> request) {
        try {
            // Lấy thông tin từ request
            String email = (String) request.get("email");
            String customerName = (String) request.get("customerName");
            Long orderId = Long.valueOf(request.get("orderId").toString());
            String totalAmount = (String) request.get("totalAmount");
            String address = (String) request.get("address");

            // Validate required fields
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email is required"));
            }

            if (orderId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Order ID is required"));
            }

            // Format order date
            String orderDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            // Gửi email
            emailService.sendOrderConfirmationEmail(
                    email,
                    customerName,
                    orderId,
                    orderDate,
                    totalAmount != null ? totalAmount : "0",
                    address);

            logger.info("Order confirmation email sent successfully to: {} for order: {}", email, orderId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order confirmation email sent successfully",
                    "orderId", orderId,
                    "email", email));

        } catch (MessagingException e) {
            logger.error("Failed to send order confirmation email: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to send email: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error sending order confirmation email: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Test endpoint để kiểm tra gửi email
     * POST /api/email/test-order-confirmation
     */
    @PostMapping("/test-order-confirmation")
    public ResponseEntity<Map<String, Object>> testOrderConfirmationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email is required"));
            }

            // Test data
            String customerName = "Test Customer";
            Long orderId = 999L;
            String orderDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            String totalAmount = "150,000 VNĐ";
            String address = "123 Test Street, Test City";

            // Gửi email test
            emailService.sendOrderConfirmationEmail(
                    email,
                    customerName,
                    orderId,
                    orderDate,
                    totalAmount,
                    address);

            logger.info("Test order confirmation email sent successfully to: {}", email);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test order confirmation email sent successfully",
                    "email", email));

        } catch (MessagingException e) {
            logger.error("Failed to send test order confirmation email: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to send test email: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error sending test order confirmation email: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }
}
