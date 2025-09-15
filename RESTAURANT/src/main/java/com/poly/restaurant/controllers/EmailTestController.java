package com.poly.restaurant.controllers;

import com.poly.restaurant.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class EmailTestController {
    
    private final EmailService emailService;
    
    @PostMapping("/email")
    public ResponseEntity<String> testEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("email");
            if (to == null || to.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            String code = "123456";
            log.info("Testing email sending to: {}", to);
            
            emailService.sendVerificationCode(to, code);
            
            log.info("Email sent successfully to: {}", to);
            return ResponseEntity.ok("Email sent successfully to: " + to);
            
        } catch (MessagingException e) {
            log.error("Email sending failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Email failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during email sending: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Unexpected error: " + e.getMessage());
        }
    }
    
    @GetMapping("/email-config")
    public ResponseEntity<Map<String, String>> getEmailConfig() {
        // Chỉ trả về thông tin cấu hình cơ bản, không bao gồm password
        Map<String, String> config = Map.of(
            "host", "smtp.gmail.com",
            "port", "587",
            "username", "goldenbamboo.res@gmail.com",
            "auth", "true",
            "starttls", "true"
        );
        
        return ResponseEntity.ok(config);
    }
}
