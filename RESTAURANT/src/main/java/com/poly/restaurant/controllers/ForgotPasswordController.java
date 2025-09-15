//package com.poly.restaurant.controllers;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//import java.util.UUID;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.poly.restaurant.entities.AccountEntity;
//import com.poly.restaurant.repositories.AccountRepository;
//import com.poly.restaurant.services.EmailService;
//
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequestMapping("/api/auth")
//@RequiredArgsConstructor
//public class ForgotPasswordController {
//    private final AccountRepository accountRepo;
//    private final EmailService emailService;
//
//    @PostMapping("/forgot-password")
//    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
//        Optional<AccountEntity> accountOpt = accountRepo.findByEmail(email);
//        if (accountOpt.isEmpty()) {
//            return ResponseEntity.badRequest().body("Email không tồn tại");
//        }
//
//        AccountEntity user = accountOpt.get();
//
//        String token = UUID.randomUUID().toString();
//        user.setResetToken(token);
//        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
//        accountRepo.save(user);
//
//        String resetLink = "http://localhost:3000/reset-password?token=" + token;
//        emailService.sendResetPasswordEmail(user.getEmail(), resetLink);
//
//        return ResponseEntity.ok("Đã gửi email đặt lại mật khẩu");
//    }
//
//}
