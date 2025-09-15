package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.PaymentRequestDTO;
import com.poly.restaurant.dtos.PaymentResponseDTO;
import com.poly.restaurant.services.PaymentService;
import com.poly.restaurant.services.VNPayService;
import com.poly.restaurant.config.VNPayConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private VNPayService vnPayService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Payment API is working!");
    }

    /**
     * Test endpoint để kiểm tra hash VNPay
     * GET /api/payment/vnpay/test-hash
     */
    @GetMapping("/vnpay/test-hash")
    public ResponseEntity<Map<String, Object>> testVnpayHash() {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Test data
            Map<String, String> testParams = new HashMap<>();
            testParams.put("vnp_Version", "2.1.0");
            testParams.put("vnp_Command", "pay");
            testParams.put("vnp_TmnCode", "WPNKCIRH");
            testParams.put("vnp_Amount", "1000000"); // 10,000 VND
            testParams.put("vnp_CurrCode", "VND");
            testParams.put("vnp_TxnRef", "TEST_123_" + System.currentTimeMillis());
            testParams.put("vnp_OrderInfo", "Test payment");
            testParams.put("vnp_OrderType", "other");
            testParams.put("vnp_Locale", "vn");
            testParams.put("vnp_ReturnUrl", "http://localhost:5173/payment/success");
            testParams.put("vnp_IpAddr", "127.0.0.1");
            testParams.put("vnp_TxnDate", "20241201120000");
            
            // Tạo hash
            String hash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, buildQueryStringForHash(testParams));
            
            response.put("success", true);
            response.put("testParams", testParams);
            response.put("calculatedHash", hash);
            response.put("hashSecret", "UGCA2N7TVIGM9KEVXYN1SLSIX1JEH4WF");
            response.put("tmnCode", "WPNKCIRH");
            response.put("message", "Hash calculation test completed");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("stackTrace", e.getStackTrace());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/vnpay/test")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, Object>> testVnpayConfig() {
        return ResponseEntity.ok(Map.of(
            "tmnCode", VNPayConfig.vnp_TmnCode,
            "payUrl", VNPayConfig.vnp_PayUrl,
            "returnUrl", VNPayConfig.vnp_ReturnUrl,
            "ipnUrl", VNPayConfig.vnp_IpnUrl,
            "status", "VNPay configured with correct TMN Code"
        ));
    }

    @PostMapping("/vnpay/create")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<PaymentResponseDTO> createVnpayPayment(@RequestBody PaymentRequestDTO request) {
        try {
            // Sử dụng VNPayService mới
            PaymentResponseDTO response = vnPayService.createVNPayPaymentUrl(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                PaymentResponseDTO.builder()
                    .success(false)
                    .message("Lỗi tạo URL thanh toán: " + e.getMessage())
                    .build()
            );
        }
    }

    @PostMapping("/vnpay/verify")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<PaymentResponseDTO> verifyVnpayPayment(@RequestBody Map<String, String> params) {
        try {
            PaymentResponseDTO response = paymentService.verifyVnpayPayment(params);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                PaymentResponseDTO.builder()
                    .success(false)
                    .message("Lỗi xác minh thanh toán: " + e.getMessage())
                    .build()
            );
        }
    }

    @PostMapping("/cod/process")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<PaymentResponseDTO> processCodPayment(@RequestBody PaymentRequestDTO request) {
        try {
            PaymentResponseDTO response = paymentService.processCodPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                PaymentResponseDTO.builder()
                    .success(false)
                    .message("Lỗi xử lý thanh toán COD: " + e.getMessage())
                    .build()
            );
        }
    }

    @GetMapping("/vnpay/return")
    @CrossOrigin(origins = "*")
    public ResponseEntity<PaymentResponseDTO> handleVnpayReturn(@RequestParam Map<String, String> params) {
        try {
            PaymentResponseDTO response = paymentService.handleVnpayReturn(params);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                PaymentResponseDTO.builder()
                    .success(false)
                    .message("Lỗi xử lý callback VNPay: " + e.getMessage())
                    .build()
            );
        }
    }

    @PostMapping("/vnpay/ipn")
    @CrossOrigin(origins = "*")
    public ResponseEntity<String> handleVnpayIpn(@RequestParam Map<String, String> params) {
        try {
            System.out.println("VNPay IPN received: " + params);
            PaymentResponseDTO response = paymentService.handleVnpayReturn(params);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok("OK");
            } else {
                return ResponseEntity.badRequest().body("FAIL");
            }
        } catch (Exception e) {
            System.err.println("VNPay IPN error: " + e.getMessage());
            return ResponseEntity.badRequest().body("FAIL");
        }
    }

    private String buildQueryStringForHash(Map<String, String> params) throws Exception {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                if (query.length() > 0) {
                    query.append('&');
                }
                query.append(fieldName).append('=').append(java.net.URLEncoder.encode(fieldValue, "UTF-8"));
            }
        }
        return query.toString();
    }
}




