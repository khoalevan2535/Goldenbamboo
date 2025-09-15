package com.poly.restaurant.services;

import com.poly.restaurant.dtos.PaymentRequestDTO;
import com.poly.restaurant.dtos.PaymentResponseDTO;
import com.poly.restaurant.config.VNPayConfig;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Autowired
    private OrderRepository orderRepository;

    public PaymentResponseDTO createVNPayPaymentUrl(PaymentRequestDTO request) {
        try {
            // Kiểm tra đơn hàng
            OrderEntity order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

            // Tính tổng tiền từ database
            BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return PaymentResponseDTO.builder()
                        .success(false)
                        .message("Không thể thanh toán đơn hàng có tổng tiền bằng 0")
                        .build();
            }

            // Chuyển đổi sang xu (VNPay tính bằng xu)
            String amount = totalAmount.multiply(new BigDecimal(100)).toBigInteger().toString();
            System.out.println("VNPay Amount (in cents): " + amount);

            // Tạo mã giao dịch
            String vnpTxnRef = "ORDER_" + request.getOrderId() + "_" + System.currentTimeMillis();

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
            vnp_Params.put("vnp_Amount", amount);
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_IpAddr", request.getClientIp() != null ? request.getClientIp() : "127.0.0.1");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_OrderInfo", request.getOrderInfo() != null ? request.getOrderInfo() : "Thanh toan don hang #" + request.getOrderId());
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_ReturnUrl", request.getReturnUrl() != null ? request.getReturnUrl() : VNPayConfig.vnp_ReturnUrl);
            vnp_Params.put("vnp_TxnRef", vnpTxnRef);
            vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

            // Tạo thời gian hết hạn (15 phút)
            Calendar c = Calendar.getInstance();
            c.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(c.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            String paymentUrl = VNPayConfig.getPaymentURL(vnp_Params);
            System.out.println("Generated VNPay Payment URL: " + paymentUrl);

            return PaymentResponseDTO.builder()
                    .success(true)
                    .message("Tạo URL thanh toán VNPay thành công")
                    .paymentUrl(paymentUrl)
                    .transactionId(vnpTxnRef)
                    .orderId(request.getOrderId().toString())
                    .amount(totalAmount.longValue())
                    .paymentMethod("VNPAY")
                    .status("PENDING")
                    .build();

        } catch (Exception e) {
            System.err.println("Error creating VNPay payment URL: " + e.getMessage());
            return PaymentResponseDTO.builder()
                    .success(false)
                    .message("Lỗi tạo URL thanh toán VNPay: " + e.getMessage())
                    .build();
        }
    }

    public PaymentResponseDTO verifyVNPayPayment(Map<String, String> params) {
        try {
            String vnpResponseCode = params.get("vnp_ResponseCode");
            String vnpTxnRef = params.get("vnp_TxnRef");
            String vnpAmount = params.get("vnp_Amount");
            String vnpSecureHash = params.get("vnp_SecureHash");

            // Xác minh chữ ký
            if (!verifyVNPayHash(params, vnpSecureHash)) {
                return PaymentResponseDTO.builder()
                        .success(false)
                        .message("Chữ ký VNPay không hợp lệ")
                        .build();
            }

            // Kiểm tra mã phản hồi
            if ("00".equals(vnpResponseCode)) {
                // Thanh toán thành công
                String orderIdStr = vnpTxnRef.split("_")[1];
                Long orderId = Long.parseLong(orderIdStr);

                OrderEntity order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

                // Cập nhật trạng thái thanh toán
                order.setStatus(com.poly.restaurant.entities.enums.OrderStatus.PAID);
                orderRepository.save(order);

                return PaymentResponseDTO.builder()
                        .success(true)
                        .message("Thanh toán VNPay thành công")
                        .transactionId(vnpTxnRef)
                        .orderId(orderId.toString())
                        .amount(Long.parseLong(vnpAmount) / 100)
                        .paymentMethod("VNPAY")
                        .status("SUCCESS")
                        .responseCode(vnpResponseCode)
                        .build();
            } else {
                return PaymentResponseDTO.builder()
                        .success(false)
                        .message("Thanh toán VNPay thất bại")
                        .responseCode(vnpResponseCode)
                        .build();
            }

        } catch (Exception e) {
            return PaymentResponseDTO.builder()
                    .success(false)
                    .message("Lỗi xác minh thanh toán VNPay: " + e.getMessage())
                    .build();
        }
    }

    private boolean verifyVNPayHash(Map<String, String> params, String vnpSecureHash) {
        try {
            // Loại bỏ vnp_SecureHash khỏi params để tính hash
            Map<String, String> paramsForHash = new HashMap<>(params);
            paramsForHash.remove("vnp_SecureHash");
            
            // Tính hash từ params
            String calculatedHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, buildQueryString(paramsForHash));
            return calculatedHash.equals(vnpSecureHash);
        } catch (Exception e) {
            System.err.println("Error verifying VNPay hash: " + e.getMessage());
            return false;
        }
    }

    private String buildQueryString(Map<String, String> params) throws UnsupportedEncodingException {
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