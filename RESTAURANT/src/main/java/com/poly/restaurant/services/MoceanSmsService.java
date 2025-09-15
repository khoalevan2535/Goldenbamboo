package com.poly.restaurant.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class MoceanSmsService {

    @Value("${mocean.api.key:5e438a11}")
    private String apiKey;

    @Value("${mocean.api.secret:a493899d}")
    private String apiSecret;

    @Value("${mocean.api.url:https://rest.moceanapi.com/rest/2/sms}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MoceanSmsService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Gửi SMS OTP qua MOCEAN API
     */
    public boolean sendOtpSms(String phoneNumber, String otp) {
        try {
            // Format số điện thoại (thêm +84 nếu chưa có)
            String formattedPhone = formatPhoneNumber(phoneNumber);
            
            log.info("Original phone: {}, Formatted phone: {}", phoneNumber, formattedPhone);
            
            // Tạo message
            String message = String.format("Ma OTP cua ban la: %s. Ma co hieu luc trong 10 phut. Khong chia se ma nay voi ai.", otp);
            
            // Tạo form data
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("mocean-api-key", apiKey);
            formData.add("mocean-api-secret", apiSecret);
            formData.add("mocean-to", formattedPhone);
            formData.add("mocean-from", "RESTAURANT");
            formData.add("mocean-text", message);
            formData.add("mocean-dlr-mask", "1");

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Tạo request entity
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(formData, headers);

            log.info("Sending SMS to: {}, OTP: {}, API Key: {}", formattedPhone, otp, apiKey);
            log.info("Request URL: {}", apiUrl);
            log.info("Request data: {}", formData);

            // Gửi request
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            log.info("MOCEAN API Response Status: {}", response.getStatusCode());
            log.info("MOCEAN API Response Body: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse response
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.has("messages") && responseJson.get("messages").isArray()) {
                    JsonNode messages = responseJson.get("messages");
                    if (messages.size() > 0) {
                        JsonNode firstMessage = messages.get(0);
                        String status = firstMessage.has("status") ? firstMessage.get("status").asText() : "";
                        
                        if ("0".equals(status)) {
                            log.info("SMS sent successfully to: {}", formattedPhone);
                            return true;
                        } else {
                            String errorMsg = firstMessage.has("err-text") ? firstMessage.get("err-text").asText() : "Unknown error";
                            log.error("SMS sending failed. Status: {}, Error: {}", status, errorMsg);
                            log.error("Full response: {}", response.getBody());
                        }
                    }
                } else if (responseJson.has("status")) {
                    // Kiểm tra status trực tiếp
                    String status = responseJson.get("status").asText();
                    if ("0".equals(status)) {
                        log.info("SMS sent successfully to: {}", formattedPhone);
                        return true;
                    } else {
                        String errorMsg = responseJson.has("err-text") ? responseJson.get("err-text").asText() : "Unknown error";
                        log.error("SMS sending failed. Status: {}, Error: {}", status, errorMsg);
                        log.error("Full response: {}", response.getBody());
                    }
                }
                
                log.error("Unexpected response format: {}", response.getBody());
            } else {
                log.error("SMS API request failed with status: {}", response.getStatusCode());
                log.error("Response body: {}", response.getBody());
            }

        } catch (Exception e) {
            log.error("Error sending SMS via MOCEAN: {}", e.getMessage(), e);
        }

        return false;
    }

    /**
     * Format số điện thoại để phù hợp với MOCEAN API
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Loại bỏ tất cả ký tự không phải số
        String cleaned = phoneNumber.replaceAll("[^0-9]", "");
        
        // Nếu số điện thoại bắt đầu bằng 0, thay thế bằng +84
        if (cleaned.startsWith("0")) {
            cleaned = "+84" + cleaned.substring(1);
        }
        // Nếu số điện thoại bắt đầu bằng 84, thêm +
        else if (cleaned.startsWith("84")) {
            cleaned = "+" + cleaned;
        }
        // Nếu không có +, thêm +
        else if (!cleaned.startsWith("+")) {
            cleaned = "+" + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Test MOCEAN API connection và credentials
     */
    public boolean testApiConnection() {
        try {
            log.info("Testing MOCEAN API connection...");
            log.info("API Key: {}", apiKey);
            log.info("API Secret: {}", apiSecret);
            log.info("API URL: {}", apiUrl);
            
            // Test với số điện thoại test
            String testPhone = "+84987654321";
            String testMessage = "Test message from RESTAURANT app";
            
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("mocean-api-key", apiKey);
            formData.add("mocean-api-secret", apiSecret);
            formData.add("mocean-to", testPhone);
            formData.add("mocean-from", "RESTAURANT");
            formData.add("mocean-text", testMessage);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(formData, headers);

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
                
                if (responseJson.has("messages") && responseJson.get("messages").isArray()) {
                    JsonNode messages = responseJson.get("messages");
                    if (messages.size() > 0) {
                        JsonNode firstMessage = messages.get(0);
                        String status = firstMessage.has("status") ? firstMessage.get("status").asText() : "";
                        
                        if ("0".equals(status)) {
                            log.info("MOCEAN API test successful!");
                            return true;
                        } else {
                            String errorMsg = firstMessage.has("err-text") ? firstMessage.get("err-text").asText() : "Unknown error";
                            log.error("MOCEAN API test failed. Status: {}, Error: {}", status, errorMsg);
                        }
                    }
                } else if (responseJson.has("status")) {
                    String status = responseJson.get("status").asText();
                    if ("0".equals(status)) {
                        log.info("MOCEAN API test successful!");
                        return true;
                    } else {
                        String errorMsg = responseJson.has("err-text") ? responseJson.get("err-text").asText() : "Unknown error";
                        log.error("MOCEAN API test failed. Status: {}, Error: {}", status, errorMsg);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error testing MOCEAN API: {}", e.getMessage(), e);
        }

        return false;
    }
}
