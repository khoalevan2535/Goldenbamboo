package com.poly.restaurant.controllers;

import com.poly.restaurant.dto.GHTKOrderRequest;
import com.poly.restaurant.dto.GHTKOrderResponse;
import com.poly.restaurant.services.GHTKService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ghtk")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class GHTKController {

    @Autowired
    private GHTKService ghtkService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody GHTKOrderRequest orderRequest) {
        try {
            GHTKOrderResponse response = ghtkService.createOrder(orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating GHTK order: " + e.getMessage());
        }
    }

    @GetMapping("/test-connection")
    public ResponseEntity<?> testConnection() {
        try {
            boolean isConnected = ghtkService.testConnection();
            return ResponseEntity.ok(isConnected);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error testing connection: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok("GHTK API is working!");
    }

    @GetMapping("/test-credentials")
    public ResponseEntity<?> testCredentials() {
        try {
            // Test với một đơn hàng mẫu
            GHTKOrderRequest testOrder = new GHTKOrderRequest();
            // Tạo test order đơn giản
            GHTKOrderResponse response = ghtkService.createOrder(testOrder);
            return ResponseEntity.ok("GHTK credentials are valid: " + response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("GHTK credentials test failed: " + e.getMessage());
        }
    }
}
