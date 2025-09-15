package com.poly.restaurant.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class VNPayConfig {

    @Value("${vnpay.tmn-code}")
    private String tmnCodeValue;

    @Value("${vnpay.hash-secret}")
    private String secretKeyValue;

    @Value("${vnpay.pay-url}")
    private String payUrlValue;

    @Value("${vnpay.return-url}")
    private String returnUrlValue;

    @Value("${vnpay.ipn-url}")
    private String ipnUrlValue;

    public static String vnp_TmnCode;
    public static String secretKey;
    public static String vnp_PayUrl;
    public static String vnp_ReturnUrl;
    public static String vnp_IpnUrl;

    @PostConstruct
    private void init() {
        vnp_TmnCode = this.tmnCodeValue;
        secretKey = this.secretKeyValue;
        vnp_PayUrl = this.payUrlValue;
        vnp_ReturnUrl = this.returnUrlValue;
        vnp_IpnUrl = this.ipnUrlValue;
        
        System.out.println("🔧 VNPay Config initialized:");
        System.out.println("   TMN Code: " + vnp_TmnCode);
        System.out.println("   Pay URL: " + vnp_PayUrl);
        System.out.println("   Return URL: " + vnp_ReturnUrl);
        System.out.println("   IPN URL: " + vnp_IpnUrl);
    }

    public static String getPaymentURL(Map<String, String> params) throws UnsupportedEncodingException {
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_Locale", "vn");
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        String amount = params.get("vnp_Amount");
        if (amount == null || Long.parseLong(amount) <= 0) {
            throw new IllegalArgumentException("Số tiền không hợp lệ");
        }

        // Sort parameters by key
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString())).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                if (itr.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String vnp_SecureHash = hmacSHA512(secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        return vnp_PayUrl + "?" + query.toString();
    }

    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }
}