package com.poly.restaurant.services;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TempRegistrationService {
    
    // Sử dụng ConcurrentHashMap để thread-safe
    private final Map<String, TempRegistrationData> tempRegistrations = new ConcurrentHashMap<>();
    
    public static class TempRegistrationData {
        private String email;
        private String username;
        private String name;
        private String password;
        private String otp;
        private LocalDateTime otpExpiry;
        private String sessionId;
        
        public TempRegistrationData(String email, String username, String name, String password, String otp, LocalDateTime otpExpiry) {
            this.email = email;
            this.username = username;
            this.name = name;
            this.password = password;
            this.otp = otp;
            this.otpExpiry = otpExpiry;
            this.sessionId = null;
        }
        
        public TempRegistrationData(String email, String username, String name, String password, String otp, LocalDateTime otpExpiry, String sessionId) {
            this.email = email;
            this.username = username;
            this.name = name;
            this.password = password;
            this.otp = otp;
            this.otpExpiry = otpExpiry;
            this.sessionId = sessionId;
        }
        
        // Getters
        public String getEmail() { return email; }
        public String getUsername() { return username; }
        public String getName() { return name; }
        public String getPassword() { return password; }
        public String getOtp() { return otp; }
        public LocalDateTime getOtpExpiry() { return otpExpiry; }
        public String getSessionId() { return sessionId; }
    }
    
    /**
     * Lưu thông tin đăng ký tạm thời
     */
    public void saveTempRegistration(String email, String username, String name, String password, String otp, LocalDateTime otpExpiry) {
        String key = "temp_registration_" + email;
        TempRegistrationData data = new TempRegistrationData(email, username, name, password, otp, otpExpiry);
        tempRegistrations.put(key, data);
        log.info("Temporary registration data saved for email: {}", email);
    }
    
    /**
     * Lưu thông tin đăng ký tạm thời với sessionId
     */
    public void saveTempRegistration(String email, String username, String name, String password, String otp, LocalDateTime otpExpiry, String sessionId) {
        String key = "temp_registration_" + email;
        TempRegistrationData data = new TempRegistrationData(email, username, name, password, otp, otpExpiry, sessionId);
        tempRegistrations.put(key, data);
        log.info("Temporary registration data saved for email: {} with sessionId: {}", email, sessionId);
    }
    
    /**
     * Lấy thông tin đăng ký tạm thời
     */
    public TempRegistrationData getTempRegistration(String email) {
        String key = "temp_registration_" + email;
        return tempRegistrations.get(key);
    }
    
    /**
     * Xóa thông tin đăng ký tạm thời
     */
    public void removeTempRegistration(String email) {
        String key = "temp_registration_" + email;
        tempRegistrations.remove(key);
        log.info("Temporary registration data removed for email: {}", email);
    }
    
    /**
     * Kiểm tra OTP có hợp lệ không
     */
    public boolean isValidOtp(String email, String otp) {
        TempRegistrationData data = getTempRegistration(email);
        if (data == null) {
            return false;
        }
        
        // Kiểm tra OTP có đúng không
        if (!data.getOtp().equals(otp)) {
            return false;
        }
        
        // Kiểm tra OTP có hết hạn không
        if (data.getOtpExpiry().isBefore(LocalDateTime.now())) {
            removeTempRegistration(email); // Xóa dữ liệu hết hạn
            return false;
        }
        
        return true;
    }
    
    /**
     * Dọn dẹp dữ liệu tạm thời hết hạn
     */
    public void cleanupExpiredData() {
        LocalDateTime now = LocalDateTime.now();
        tempRegistrations.entrySet().removeIf(entry -> {
            TempRegistrationData data = entry.getValue();
            if (data.getOtpExpiry().isBefore(now)) {
                log.info("Removing expired temporary registration for email: {}", data.getEmail());
                return true;
            }
            return false;
        });
    }
    
    /**
     * Lấy số lượng đăng ký tạm thời
     */
    public int getTempRegistrationCount() {
        return tempRegistrations.size();
    }
}
