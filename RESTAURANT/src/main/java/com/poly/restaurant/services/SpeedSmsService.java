package com.poly.restaurant.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class SpeedSmsService {

    @Value("${speedsms.access.token:Z9qunOLViqyssFS3KzDadCGGtv-rO-I7}")
    private String accessToken;

    @Value("${speedsms.app.id:TMadjkT5Mjw4kezoeoQaJiVuxAsc81mW}")
    private String appId;

    @Value("${speedsms.api.url:https://api.speedsms.vn/index.php/sms/send}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SpeedSmsService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Gửi SMS OTP qua SpeedSMS API
     */
    public boolean sendOtpSms(String phoneNumber, String otp) {
        try {
            // Format số điện thoại
            String formattedPhone = formatPhoneNumber(phoneNumber);
            
            log.info("Original phone: {}, Formatted phone: {}", phoneNumber, formattedPhone);
            
            // Tạo message
            String message = String.format("Ma OTP cua ban la: %s. Ma co hieu luc trong 10 phut. Khong chia se ma nay voi ai.", otp);
            
            // Tạo request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to", formattedPhone);
            requestBody.put("content", message);
            requestBody.put("sms_type", 2); // 2 = Brand name
            requestBody.put("sender", "GoldenBamboo"); // Brand name

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            // Tạo request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            log.info("Sending SMS to: {}, OTP: {}, Access Token: {}", formattedPhone, otp, accessToken);
            log.info("Request URL: {}", apiUrl);
            log.info("Request data: {}", requestBody);

            // Gửi request
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            log.info("SpeedSMS API Response Status: {}", response.getStatusCode());
            log.info("SpeedSMS API Response Body: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse response
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.has("status") && "success".equals(responseJson.get("status").asText())) {
                    log.info("SMS sent successfully to: {}", formattedPhone);
                    return true;
                } else {
                    String errorMsg = responseJson.has("message") ? responseJson.get("message").asText() : "Unknown error";
                    log.error("SMS sending failed. Error: {}", errorMsg);
                    log.error("Full response: {}", response.getBody());
                }
            } else {
                log.error("SMS API request failed with status: {}", response.getStatusCode());
                log.error("Response body: {}", response.getBody());
            }

        } catch (Exception e) {
            log.error("Error sending SMS via SpeedSMS: {}", e.getMessage(), e);
        }

        return false;
    }

    /**
     * Gửi OTP qua SpeedSMS 2FA API
     */
    public boolean sendOtpVia2FA(String phoneNumber, String otp) {
        try {
            // Format số điện thoại
            String formattedPhone = formatPhoneNumber(phoneNumber);
            
            log.info("Sending 2FA OTP to: {}, OTP: {}", formattedPhone, otp);
            
            // Tạo request body cho 2FA
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("app_id", appId);
            requestBody.put("phone", formattedPhone);

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            // Tạo request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            String twoFaUrl = "https://api.speedsms.vn/index.php/2fa/send";

            log.info("2FA Request URL: {}", twoFaUrl);
            log.info("2FA Request data: {}", requestBody);

            // Gửi request
            ResponseEntity<String> response = restTemplate.exchange(
                twoFaUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            log.info("SpeedSMS 2FA API Response Status: {}", response.getStatusCode());
            log.info("SpeedSMS 2FA API Response Body: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse response
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.has("status") && "success".equals(responseJson.get("status").asText())) {
                    log.info("2FA OTP sent successfully to: {}", formattedPhone);
                    return true;
                } else {
                    String errorMsg = responseJson.has("message") ? responseJson.get("message").asText() : "Unknown error";
                    log.error("2FA OTP sending failed. Error: {}", errorMsg);
                    log.error("Full response: {}", response.getBody());
                }
            } else {
                log.error("2FA API request failed with status: {}", response.getStatusCode());
                log.error("Response body: {}", response.getBody());
            }

        } catch (Exception e) {
            log.error("Error sending 2FA OTP via SpeedSMS: {}", e.getMessage(), e);
        }

        return false;
    }

    /**
     * Verify OTP qua SpeedSMS 2FA API
     */
    public boolean verifyOtp(String phoneNumber, String otp) {
        try {
            // Format số điện thoại
            String formattedPhone = formatPhoneNumber(phoneNumber);
            
            log.info("Verifying 2FA OTP for: {}, OTP: {}", formattedPhone, otp);
            
            // Tạo request body cho verify
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("app_id", appId);
            requestBody.put("phone", formattedPhone);
            requestBody.put("code", otp);

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            // Tạo request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            String verifyUrl = "https://api.speedsms.vn/index.php/2fa/verify";

            log.info("2FA Verify URL: {}", verifyUrl);
            log.info("2FA Verify data: {}", requestBody);

            // Gửi request
            ResponseEntity<String> response = restTemplate.exchange(
                verifyUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            log.info("SpeedSMS 2FA Verify API Response Status: {}", response.getStatusCode());
            log.info("SpeedSMS 2FA Verify API Response Body: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse response
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.has("status") && "success".equals(responseJson.get("status").asText())) {
                    log.info("2FA OTP verified successfully for: {}", formattedPhone);
                    return true;
                } else {
                    String errorMsg = responseJson.has("message") ? responseJson.get("message").asText() : "Unknown error";
                    log.error("2FA OTP verification failed. Error: {}", errorMsg);
                    log.error("Full response: {}", response.getBody());
                }
            } else {
                log.error("2FA Verify API request failed with status: {}", response.getStatusCode());
                log.error("Response body: {}", response.getBody());
            }

        } catch (Exception e) {
            log.error("Error verifying 2FA OTP via SpeedSMS: {}", e.getMessage(), e);
        }

        return false;
    }

    /**
     * Format số điện thoại để phù hợp với SpeedSMS API
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Loại bỏ tất cả ký tự không phải số
        String cleaned = phoneNumber.replaceAll("[^0-9]", "");
        
        // Nếu số điện thoại bắt đầu bằng 0, thay thế bằng 84
        if (cleaned.startsWith("0")) {
            cleaned = "84" + cleaned.substring(1);
        }
        // Nếu số điện thoại bắt đầu bằng +84, loại bỏ +
        else if (cleaned.startsWith("84")) {
            // Giữ nguyên
        }
        // Nếu không có 84, thêm 84
        else if (!cleaned.startsWith("84")) {
            cleaned = "84" + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Test SpeedSMS API connection và credentials
     */
    public boolean testApiConnection() {
        try {
            log.info("Testing SpeedSMS API connection...");
            log.info("Access Token: {}", accessToken);
            log.info("App ID: {}", appId);
            log.info("API URL: {}", apiUrl);
            
            // Test với số điện thoại test
            String testPhone = "84987654321";
            String testMessage = "Test message from GoldenBamboo app";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to", testPhone);
            requestBody.put("content", testMessage);
            requestBody.put("sms_type", 2);
            requestBody.put("sender", "GoldenBamboo");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            log.info("Test API Response Status: {}", response.getStatusCode());
            log.info("Test API Response Body: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.has("status") && "success".equals(responseJson.get("status").asText())) {
                    log.info("SpeedSMS API test successful!");
                    return true;
                } else {
                    String errorMsg = responseJson.has("message") ? responseJson.get("message").asText() : "Unknown error";
                    log.error("SpeedSMS API test failed. Error: {}", errorMsg);
                }
            }

        } catch (Exception e) {
            log.error("Error testing SpeedSMS API: {}", e.getMessage(), e);
        }

        return false;
    }
}
