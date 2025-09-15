package com.poly.restaurant.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.poly.restaurant.dtos.PaymentRequestDTO;
import com.poly.restaurant.dtos.PaymentResponseDTO;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.repositories.OrderRepository;

@Service
public class PaymentService {

	@Autowired
	private OrderRepository orderRepository;

	// VNPay Configuration - Thay thế bằng thông tin thật từ VNPay
	@Value("${vnpay.tmn-code:DEMO}")
	private String vnpTmnCode;

	@Value("${vnpay.hash-secret:DEMO}")
	private String vnpHashSecret;

	@Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
	private String vnpPayUrl;

	@Value("${vnpay.return-url:http://localhost:8080/api/payment/vnpay/return}")
	private String vnpReturnUrl;

    public PaymentResponseDTO createVnpayPaymentUrl(PaymentRequestDTO request) {
        try {
            // Kiểm tra đơn hàng
            OrderEntity order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

            // Tính tổng tiền từ database thay vì tin tưởng dữ liệu từ frontend
            BigDecimal calculatedTotal = calculateOrderTotal(order);
            
            // Kiểm tra xem số tiền từ frontend có khớp với tính toán không
            if (request.getAmount() != null && request.getAmount() != calculatedTotal.longValue()) {
                return PaymentResponseDTO.builder()
                        .success(false)
                        .message("Số tiền không khớp với đơn hàng. Tổng tiền thực tế: " + calculatedTotal)
                        .build();
            }

            // Sử dụng số tiền đã tính toán từ database
            long paymentAmount = calculatedTotal.longValue();
            
            if (paymentAmount <= 0) {
                return PaymentResponseDTO.builder()
                        .success(false)
                        .message("Không thể thanh toán đơn hàng có tổng tiền bằng 0")
                        .build();
            }

            // Tạo mã giao dịch
            String vnpTxnRef = "ORDER_" + request.getOrderId() + "_" + System.currentTimeMillis();

			// Tạo thời gian giao dịch
			String vnpTxnDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

			// Tạo các tham số cho VNPay
			Map<String, String> vnpParams = new HashMap<>();
			vnpParams.put("vnp_Version", "2.1.0");
			vnpParams.put("vnp_Command", "pay");
			vnpParams.put("vnp_TmnCode", vnpTmnCode);
			vnpParams.put("vnp_Amount", String.valueOf(paymentAmount * 100)); // VNPay tính bằng xu
			vnpParams.put("vnp_CurrCode", "VND");
			vnpParams.put("vnp_TxnRef", vnpTxnRef);
			vnpParams.put("vnp_OrderInfo", request.getOrderInfo() != null ? request.getOrderInfo()
					: "Thanh toan don hang #" + request.getOrderId());
			vnpParams.put("vnp_OrderType", "other");
			vnpParams.put("vnp_Locale", "vn");
			vnpParams.put("vnp_ReturnUrl", request.getReturnUrl() != null ? request.getReturnUrl() : vnpReturnUrl);
			// Lấy IP thực từ request hoặc sử dụng IP mặc định
			String clientIp = request.getClientIp() != null ? request.getClientIp() : "127.0.0.1";
			vnpParams.put("vnp_IpAddr", clientIp);
			vnpParams.put("vnp_TxnDate", vnpTxnDate);

			// Tạo chuỗi hash
			String vnpSecureHash = createVnpayHash(vnpParams);

			// Tạo URL thanh toán
			StringBuilder vnpUrl = new StringBuilder(vnpPayUrl);
			vnpUrl.append("?");

			for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
				vnpUrl.append(entry.getKey());
				vnpUrl.append("=");
				vnpUrl.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
				vnpUrl.append("&");
			}
			vnpUrl.append("vnp_SecureHash=").append(vnpSecureHash);

			return PaymentResponseDTO.builder().success(true).message("Tạo URL thanh toán thành công")
					.paymentUrl(vnpUrl.toString()).transactionId(vnpTxnRef).orderId(request.getOrderId().toString())
					.amount(paymentAmount).paymentMethod("VNPAY").status("PENDING").build();

		} catch (Exception e) {
			return PaymentResponseDTO.builder().success(false).message("Lỗi tạo URL thanh toán: " + e.getMessage())
					.build();
		}
	}

	public PaymentResponseDTO verifyVnpayPayment(Map<String, String> params) {
		try {
			String vnpResponseCode = params.get("vnp_ResponseCode");
			String vnpTxnRef = params.get("vnp_TxnRef");
			String vnpAmount = params.get("vnp_Amount");
			String vnpSecureHash = params.get("vnp_SecureHash");

			// Xác minh chữ ký
			if (!verifyVnpayHash(params, vnpSecureHash)) {
				return PaymentResponseDTO.builder().success(false).message("Chữ ký không hợp lệ").build();
			}

			// Kiểm tra mã phản hồi
			if ("00".equals(vnpResponseCode)) {
				// Thanh toán thành công
				// Cập nhật trạng thái đơn hàng
				String orderIdStr = vnpTxnRef.split("_")[1];
				Long orderId = Long.parseLong(orderIdStr);

				OrderEntity order = orderRepository.findById(orderId)
						.orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

				// Cập nhật trạng thái thanh toán
				order.setStatus(OrderStatus.PAID);
				orderRepository.save(order);

				return PaymentResponseDTO.builder().success(true).message("Thanh toán thành công")
						.transactionId(vnpTxnRef).orderId(orderId.toString()).amount(Long.parseLong(vnpAmount) / 100)
						.paymentMethod("VNPAY").status("SUCCESS").responseCode(vnpResponseCode).build();
			} else {
				return PaymentResponseDTO.builder().success(false).message("Thanh toán thất bại")
						.responseCode(vnpResponseCode).build();
			}

		} catch (Exception e) {
			return PaymentResponseDTO.builder().success(false).message("Lỗi xác minh thanh toán: " + e.getMessage())
					.build();
		}
	}

	public PaymentResponseDTO processCodPayment(PaymentRequestDTO request) {
		try {
			// Kiểm tra đơn hàng
			OrderEntity order = orderRepository.findById(request.getOrderId())
					.orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

			// Cập nhật trạng thái thanh toán COD
			order.setStatus(OrderStatus.COD_PENDING);
			orderRepository.save(order);

			return PaymentResponseDTO.builder().success(true).message("Đã xác nhận thanh toán tiền mặt")
					.orderId(request.getOrderId().toString()).amount(request.getAmount()).paymentMethod("COD")
					.status("PENDING").build();

		} catch (Exception e) {
			return PaymentResponseDTO.builder().success(false).message("Lỗi xử lý thanh toán COD: " + e.getMessage())
					.build();
		}
	}

	public PaymentResponseDTO handleVnpayReturn(Map<String, String> params) {
		return verifyVnpayPayment(params);
	}

	public String createVnpayHash(Map<String, String> params) throws NoSuchAlgorithmException, InvalidKeyException {
		// Loại bỏ vnp_SecureHash khỏi params để tính hash
		Map<String, String> paramsForHash = new HashMap<>(params);
		paramsForHash.remove("vnp_SecureHash");
		
		// Sắp xếp các tham số theo thứ tự alphabet
		List<String> fieldNames = new ArrayList<>(paramsForHash.keySet());
		Collections.sort(fieldNames);

		StringBuilder query = new StringBuilder();

		for (String fieldName : fieldNames) {
			String fieldValue = paramsForHash.get(fieldName);
			if (fieldValue != null && fieldValue.length() > 0) {
				query.append(fieldName);
				query.append('=');
				query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
				query.append('&');
			}
		}

		// Xóa dấu & cuối cùng
		String queryUrl = query.toString();
		if (queryUrl.length() > 0) {
			queryUrl = queryUrl.substring(0, queryUrl.length() - 1);
		}
		
		// Log chi tiết để debug
		System.out.println("🔍 VNPay Hash Debug:");
		System.out.println("📋 Original params: " + params);
		System.out.println("📋 Params for hash (without vnp_SecureHash): " + paramsForHash);
		System.out.println("📋 Sorted field names: " + fieldNames);
		System.out.println("🔗 Query URL: " + queryUrl);
		System.out.println("🔑 Hash Secret: " + vnpHashSecret);
		
		String vnpSecureHash = createHmacSHA512(vnpHashSecret, queryUrl);
		System.out.println("🔐 Calculated Hash: " + vnpSecureHash);
		
		return vnpSecureHash;
	}

	private boolean verifyVnpayHash(Map<String, String> params, String vnpSecureHash) {
		try {
			String calculatedHash = createVnpayHash(params);
			return calculatedHash.equals(vnpSecureHash);
		} catch (Exception e) {
			return false;
		}
	}

	private String createHmacSHA512(String key, String data) throws NoSuchAlgorithmException, InvalidKeyException {
		Mac mac = Mac.getInstance("HmacSHA512");
		SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
		mac.init(secretKeySpec);
		byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
		return bytesToHex(hash);
	}

	private String bytesToHex(byte[] bytes) {
		StringBuilder result = new StringBuilder();
		for (byte b : bytes) {
			result.append(String.format("%02x", b));
		}
		return result.toString();
	}

    /**
     * Tính tổng tiền đơn hàng từ database để đảm bảo bảo mật
     */
    private BigDecimal calculateOrderTotal(OrderEntity order) {
        // Sử dụng totalAmount từ order
        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        
        // Đảm bảo không âm
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }
        
        return total;
    }
}




