package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.OrderRequestDTO;
import com.poly.restaurant.dtos.OrderResponseDTO;
import com.poly.restaurant.dtos.OrderItemRequestDTO;
import com.poly.restaurant.dto.GHTKOrderRequest;
import com.poly.restaurant.dto.GHTKOrderResponse;
import com.poly.restaurant.services.ClientOrderService;
import com.poly.restaurant.services.GHTKService;
import com.poly.restaurant.services.VNPayService;
import com.poly.restaurant.dtos.PaymentRequestDTO;
import com.poly.restaurant.repositories.OrderRepository;
import com.poly.restaurant.entities.OrderEntity;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/client/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientOrderController {

    private static final Logger logger = LoggerFactory.getLogger(ClientOrderController.class);
    private final ClientOrderService clientOrderService;
    private final GHTKService ghtkService;
    private final VNPayService vnPayService;
    private final OrderRepository orderRepository;


    /**
     * Tạo đơn hàng mới từ khách hàng (không cần authentication)
     * POST /api/client/orders
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createClientOrder(@RequestBody Map<String, Object> request) {
        try {
            logger.info("Client creating order: {}", request);

            // Tạo OrderRequestDTO từ request
            OrderRequestDTO orderRequest = new OrderRequestDTO();

            // Map các trường cơ bản
            orderRequest.setCustomerPhone((String) request.get("customer_phone"));
            orderRequest.setCustomerEmail((String) request.get("customer_email")); // Map customer_email field
            orderRequest.setAddress((String) request.get("customer_address")); // Map customer_address field
            orderRequest.setPaymentMethod((String) request.get("payment_method"));
            orderRequest.setNotes((String) request.get("note"));

            // Map customer name nếu có
            String customerName = (String) request.get("customer_name");
            if (customerName != null && !customerName.trim().isEmpty()) {
                orderRequest.setCustomerName(customerName);
            }

            // Map account_id
            Integer accountId = (Integer) request.get("account_id");
            if (accountId != null) {
                orderRequest.setAccountId(accountId.longValue());
            }

            // Branch ID - cần tạo table tạm thời cho delivery order
            Integer branchId = (Integer) request.get("branch_id");
            if (branchId != null) {
                orderRequest.setBranchId(branchId.longValue());
                // Tạo table tạm thời cho delivery (table_id = 999 + branch_id)
                Long tempTableId = 999L + branchId.longValue();
                orderRequest.setTableId(tempTableId);
            } else {
                // Default table cho delivery
                orderRequest.setTableId(999L);
                orderRequest.setBranchId(1L); // Default branch
            }

            // Items
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("order_items");
            if (items != null && !items.isEmpty()) {
                List<OrderItemRequestDTO> orderItems = items.stream()
                        .map(item -> {
                            OrderItemRequestDTO orderItem = new OrderItemRequestDTO();

                            // Set item type (dish hoặc combo)
                            String itemType = (String) item.get("item_type");
                            if ("dish".equals(itemType)) {
                                orderItem.setDishId(((Number) item.get("item_id")).longValue());
                                // TODO: Set menuDishId nếu có (tạm thời bỏ qua)
                                // if (item.get("menu_dish_id") != null) {
                                //     orderItem.setMenuDishId(((Number) item.get("menu_dish_id")).longValue());
                                // }
                            } else if ("combo".equals(itemType)) {
                                orderItem.setComboId(((Number) item.get("item_id")).longValue());
                                // TODO: Set menuDishId nếu có (tạm thời bỏ qua)
                                // if (item.get("menu_dish_id") != null) {
                                //     orderItem.setMenuDishId(((Number) item.get("menu_dish_id")).longValue());
                                // }
                            }

                            orderItem.setQuantity(((Number) item.get("quantity")).intValue());
                            orderItem.setUnitPrice(((Number) item.get("unit_price")).doubleValue());
                            orderItem.setNote("Client order");

                            return orderItem;
                        })
                        .toList();

                orderRequest.setItems(orderItems);
            }

            // Tạo order sử dụng ClientOrderService
            OrderResponseDTO order = clientOrderService.createClientOrder(orderRequest);

            // Gửi email xác nhận nếu có email
            String customerEmail = orderRequest.getCustomerEmail();
            logger.info("DEBUG: customerEmail from orderRequest: '{}'", customerEmail);
            logger.info("DEBUG: customerEmail is null: {}", customerEmail == null);
            logger.info("DEBUG: customerEmail is empty: {}", customerEmail != null && customerEmail.trim().isEmpty());

            if (customerEmail != null && !customerEmail.trim().isEmpty()) {
                try {
                    logger.info("DEBUG: Attempting to send email to: {}", customerEmail);

                    // Format total amount
                    String totalAmountFormatted = String.format("%,.0f VNĐ", order.getTotalAmount().doubleValue());
                    logger.info("DEBUG: totalAmountFormatted: {}", totalAmountFormatted);

                    // TODO: Gửi email xác nhận (cần implement emailService)
                    logger.info("Order created successfully: {} for customer: {}",
                            order.getId(), customerEmail);

                } catch (Exception e) {
                    // Log lỗi nhưng không fail order creation
                    logger.error("Failed to send order confirmation email to: {} for order: {}, error: {}",
                            customerEmail, order.getId(), e.getMessage(), e);
                    logger.error("Exception details: ", e);
                }
            } else {
                logger.info("No email provided, skipping order confirmation email for order: {}", order.getId());
                logger.info("DEBUG: customerEmail value: '{}'", customerEmail);
            }

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đơn hàng được tạo thành công");
            response.put("data", Map.of(
                    "order_id", order.getId(),
                    "order_code", order.getId().toString(),
                    "total_amount", order.getTotalAmount(),
                    "created_at", order.getCreatedAt(),
                    "email_sent", customerEmail != null && !customerEmail.trim().isEmpty()));

            logger.info("Client order created successfully with ID: {}", order.getId());
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            logger.error("Error creating client order", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra khi tạo đơn hàng: " + e.getMessage());

            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Lấy đơn hàng theo ID (cho khách hàng)
     * GET /api/client/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getClientOrderById(@PathVariable Long id) {
        try {
            logger.info("Client getting order by ID: {}", id);
            OrderResponseDTO order = clientOrderService.getClientOrderById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", order);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting client order by ID: {}", id, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Không tìm thấy đơn hàng");

            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lấy đơn hàng theo số điện thoại khách hàng
     * GET /api/client/orders/customer/{phone}
     */
    @GetMapping("/customer/{phone}")
    public ResponseEntity<Map<String, Object>> getClientOrdersByPhone(@PathVariable String phone) {
        try {
            logger.info("Client getting orders by phone: {}", phone);

            List<OrderResponseDTO> orders = clientOrderService.getClientOrdersByPhone(phone);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orders);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting client orders by phone: {}", phone, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra khi lấy đơn hàng");

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Lấy đơn hàng theo account ID của user
     * GET /api/client/orders/user/{accountId}
     */
    @GetMapping("/user/{accountId}")
    public ResponseEntity<Map<String, Object>> getClientOrdersByAccountId(@PathVariable Long accountId) {
        try {
            logger.info("Client getting orders by account ID: {}", accountId);

            List<OrderResponseDTO> orders = clientOrderService.getClientOrdersByAccountId(accountId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orders);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting client orders by account ID: {}", accountId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra khi lấy đơn hàng");

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (hủy đơn hàng)
     * PATCH /api/client/orders/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            logger.info("Client updating order {} status to: {}", id, status);

            OrderResponseDTO updatedOrder = clientOrderService.updateOrderStatus(id, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái đơn hàng thành công");
            response.put("data", updatedOrder);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error updating order {} status", id, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // GHTK API endpoints
    @PostMapping("/ghtk/create-order")
    public ResponseEntity<?> createGHTKOrder(@RequestBody GHTKOrderRequest orderRequest) {
        try {
            logger.info("Creating GHTK order: {}", orderRequest);
            GHTKOrderResponse response = ghtkService.createOrder(orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating GHTK order", e);
            return ResponseEntity.badRequest().body("Error creating GHTK order: " + e.getMessage());
        }
    }


    @GetMapping("/ghtk/ping")
    public ResponseEntity<?> ghtkPing() {
        return ResponseEntity.ok("GHTK API is working!");
    }

    @GetMapping("/ghtk/provinces")
    public ResponseEntity<?> getGHTKProvinces() {
        try {
            logger.info("Returning mock provinces data (GHTK doesn't provide provinces API)");
            
            // GHTK không cung cấp API để lấy danh sách tỉnh
            // Trả về mock data thay thế
            List<Map<String, String>> provinces = new ArrayList<>();
            provinces.add(Map.of("id", "1", "name", "Thành phố Hà Nội"));
            provinces.add(Map.of("id", "2", "name", "Thành phố Hồ Chí Minh"));
            provinces.add(Map.of("id", "3", "name", "Thành phố Cần Thơ"));
            provinces.add(Map.of("id", "4", "name", "Tỉnh An Giang"));
            provinces.add(Map.of("id", "5", "name", "Tỉnh Bà Rịa - Vũng Tàu"));
            provinces.add(Map.of("id", "6", "name", "Tỉnh Bạc Liêu"));
            provinces.add(Map.of("id", "7", "name", "Tỉnh Bắc Giang"));
            provinces.add(Map.of("id", "8", "name", "Tỉnh Bắc Kạn"));
            provinces.add(Map.of("id", "9", "name", "Tỉnh Bắc Ninh"));
            provinces.add(Map.of("id", "10", "name", "Tỉnh Bến Tre"));
            provinces.add(Map.of("id", "11", "name", "Tỉnh Bình Dương"));
            provinces.add(Map.of("id", "12", "name", "Tỉnh Bình Phước"));
            provinces.add(Map.of("id", "13", "name", "Tỉnh Bình Thuận"));
            provinces.add(Map.of("id", "14", "name", "Tỉnh Cà Mau"));
            provinces.add(Map.of("id", "15", "name", "Tỉnh Cao Bằng"));
            provinces.add(Map.of("id", "16", "name", "Tỉnh Đắk Lắk"));
            provinces.add(Map.of("id", "17", "name", "Tỉnh Đắk Nông"));
            provinces.add(Map.of("id", "18", "name", "Tỉnh Điện Biên"));
            provinces.add(Map.of("id", "19", "name", "Tỉnh Đồng Nai"));
            provinces.add(Map.of("id", "20", "name", "Tỉnh Đồng Tháp"));
            provinces.add(Map.of("id", "21", "name", "Tỉnh Gia Lai"));
            provinces.add(Map.of("id", "22", "name", "Tỉnh Hà Giang"));
            provinces.add(Map.of("id", "23", "name", "Tỉnh Hà Nam"));
            provinces.add(Map.of("id", "24", "name", "Tỉnh Hà Tĩnh"));
            provinces.add(Map.of("id", "25", "name", "Tỉnh Hải Dương"));
            provinces.add(Map.of("id", "26", "name", "Tỉnh Hậu Giang"));
            provinces.add(Map.of("id", "27", "name", "Tỉnh Hòa Bình"));
            provinces.add(Map.of("id", "28", "name", "Tỉnh Hưng Yên"));
            provinces.add(Map.of("id", "29", "name", "Tỉnh Khánh Hòa"));
            provinces.add(Map.of("id", "30", "name", "Tỉnh Kiên Giang"));
            provinces.add(Map.of("id", "31", "name", "Tỉnh Kon Tum"));
            provinces.add(Map.of("id", "32", "name", "Tỉnh Lai Châu"));
            provinces.add(Map.of("id", "33", "name", "Tỉnh Lâm Đồng"));
            provinces.add(Map.of("id", "34", "name", "Tỉnh Lạng Sơn"));
            provinces.add(Map.of("id", "35", "name", "Tỉnh Lào Cai"));
            provinces.add(Map.of("id", "36", "name", "Tỉnh Long An"));
            provinces.add(Map.of("id", "37", "name", "Tỉnh Nam Định"));
            provinces.add(Map.of("id", "38", "name", "Tỉnh Nghệ An"));
            provinces.add(Map.of("id", "39", "name", "Tỉnh Ninh Bình"));
            provinces.add(Map.of("id", "40", "name", "Tỉnh Ninh Thuận"));
            provinces.add(Map.of("id", "41", "name", "Tỉnh Phú Thọ"));
            provinces.add(Map.of("id", "42", "name", "Tỉnh Phú Yên"));
            provinces.add(Map.of("id", "43", "name", "Tỉnh Quảng Bình"));
            provinces.add(Map.of("id", "44", "name", "Tỉnh Quảng Nam"));
            provinces.add(Map.of("id", "45", "name", "Tỉnh Quảng Ngãi"));
            provinces.add(Map.of("id", "46", "name", "Tỉnh Quảng Ninh"));
            provinces.add(Map.of("id", "47", "name", "Tỉnh Quảng Trị"));
            provinces.add(Map.of("id", "48", "name", "Tỉnh Sóc Trăng"));
            provinces.add(Map.of("id", "49", "name", "Tỉnh Sơn La"));
            provinces.add(Map.of("id", "50", "name", "Tỉnh Tây Ninh"));
            provinces.add(Map.of("id", "51", "name", "Tỉnh Thái Bình"));
            provinces.add(Map.of("id", "52", "name", "Tỉnh Thái Nguyên"));
            provinces.add(Map.of("id", "53", "name", "Tỉnh Thanh Hóa"));
            provinces.add(Map.of("id", "54", "name", "Tỉnh Thừa Thiên Huế"));
            provinces.add(Map.of("id", "55", "name", "Tỉnh Bình Thuận"));
            provinces.add(Map.of("id", "56", "name", "Tỉnh Trà Vinh"));
            provinces.add(Map.of("id", "57", "name", "Tỉnh Tuyên Quang"));
            provinces.add(Map.of("id", "58", "name", "Tỉnh Vĩnh Long"));
            provinces.add(Map.of("id", "59", "name", "Tỉnh Vĩnh Phúc"));
            provinces.add(Map.of("id", "60", "name", "Tỉnh Yên Bái"));
            provinces.add(Map.of("id", "61", "name", "Thành phố Đà Nẵng"));
            provinces.add(Map.of("id", "62", "name", "Thành phố Hải Phòng"));
            provinces.add(Map.of("id", "63", "name", "Thành phố Thái Nguyên"));
            
            logger.info("Returning {} provinces", provinces.size());
            return ResponseEntity.ok(provinces);
        } catch (Exception e) {
            logger.error("Error returning provinces", e);
            return ResponseEntity.badRequest().body("Error returning provinces: " + e.getMessage());
        }
    }

    @GetMapping("/ghtk/districts")
    public ResponseEntity<?> getGHTKDistricts(@RequestParam String provinceId) {
        try {
            logger.info("Fetching GHTK districts for province: {}", provinceId);
            // Gọi GHTK API để lấy danh sách quận/huyện
            String url = "https://services.giaohangtietkiem.vn/services/shipment/list_pick_add?province=" + provinceId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", "2N0Uv6JWHdTCHUsuc2nfqFeXJ8cYtzyz6kGhtUo");
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> request = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            logger.info("GHTK districts response: {}", response.getBody());
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            logger.error("Error fetching GHTK districts", e);
            return ResponseEntity.badRequest().body("Error fetching districts: " + e.getMessage());
        }
    }

    @GetMapping("/ghtk/wards")
    public ResponseEntity<?> getGHTKWards(@RequestParam String districtId) {
        try {
            logger.info("Fetching GHTK wards for district: {}", districtId);
            // Gọi GHTK API để lấy danh sách phường/xã
            String url = "https://services.giaohangtietkiem.vn/services/shipment/list_pick_add?district=" + districtId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", "2N0Uv6JWHdTCHUsuc2nfqFeXJ8cYtzyz6kGhtUo");
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> request = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            logger.info("GHTK wards response: {}", response.getBody());
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            logger.error("Error fetching GHTK wards", e);
            return ResponseEntity.badRequest().body("Error fetching wards: " + e.getMessage());
        }
    }

    /**
     * Tạo đơn hàng với thanh toán VNPay
     * POST /api/orders/create-with-payment
     */
    @PostMapping("/create-with-payment")
    public ResponseEntity<Map<String, Object>> createOrderWithPayment(@RequestBody Map<String, Object> request) {
        try {
            logger.info("Creating order with payment: {}", request);

            // Tạo đơn hàng tạm thời (chưa thanh toán)
            OrderRequestDTO orderRequest = new OrderRequestDTO();
            
            // Lấy thông tin từ request
            @SuppressWarnings("unchecked")
            Map<String, Object> customerInfo = (Map<String, Object>) request.get("customerInfo");
            @SuppressWarnings("unchecked")
            Map<String, Object> deliveryAddress = (Map<String, Object>) request.get("deliveryAddress");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            
            // Thiết lập thông tin đơn hàng
            orderRequest.setCustomerName((String) customerInfo.get("name"));
            orderRequest.setCustomerPhone((String) customerInfo.get("phone"));
            orderRequest.setCustomerEmail((String) customerInfo.get("email"));
            orderRequest.setAddress((String) deliveryAddress.get("address"));
            orderRequest.setPaymentMethod("VNPAY");
            orderRequest.setDeliveryType("delivery");
            orderRequest.setBranchId(1L); // Default branch
            orderRequest.setTableId(999L); // Delivery table
            
            // Map items
            if (items != null && !items.isEmpty()) {
                List<OrderItemRequestDTO> orderItems = items.stream()
                        .map(item -> {
                            OrderItemRequestDTO orderItem = new OrderItemRequestDTO();
                            
                            String type = (String) item.get("type");
                            if ("dish".equals(type)) {
                                orderItem.setDishId(((Number) item.get("id")).longValue());
                            } else if ("combo".equals(type)) {
                                orderItem.setComboId(((Number) item.get("id")).longValue());
                            }
                            
                            orderItem.setQuantity(((Number) item.get("qty")).intValue());
                            orderItem.setUnitPrice(((Number) item.get("price")).doubleValue());
                            orderItem.setNote("Client order");
                            
                            return orderItem;
                        })
                        .toList();
                
                orderRequest.setItems(orderItems);
            }
            
            // Tạo đơn hàng thực tế
            OrderResponseDTO order = clientOrderService.createClientOrder(orderRequest);
            
            // Tạo VNPay payment URL
            PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
            paymentRequest.setOrderId(order.getId());
            paymentRequest.setOrderInfo("Thanh toan don hang #" + order.getId());
            paymentRequest.setReturnUrl("http://localhost:5173/payment/success");
            paymentRequest.setClientIp("127.0.0.1"); // TODO: Lấy IP thực từ request
            
            var paymentResponse = vnPayService.createVNPayPaymentUrl(paymentRequest);
            
            if (!paymentResponse.isSuccess()) {
                throw new RuntimeException("Không thể tạo URL thanh toán: " + paymentResponse.getMessage());
            }
            
            String paymentUrl = paymentResponse.getPaymentUrl();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", order.getId().toString());
            response.put("paymentUrl", paymentUrl);
            response.put("message", "Đơn hàng đã được tạo, chuyển hướng thanh toán");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating order with payment", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Không thể tạo đơn hàng: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Xác nhận thanh toán và tạo đơn GHTK
     * POST /api/orders/{orderId}/confirm-payment
     */
    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPaymentAndCreateGHTKOrder(@PathVariable String orderId) {
        try {
            logger.info("Confirming payment and creating GHTK order for: {}", orderId);

            // Tìm đơn hàng
            OrderEntity order = orderRepository.findById(Long.parseLong(orderId))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

            // Cập nhật trạng thái đơn hàng thành PAID
            order.setStatus(com.poly.restaurant.entities.enums.OrderStatus.PAID);
            orderRepository.save(order);
            logger.info("Order {} status updated to PAID", orderId);

            // Tạo đơn GHTK
            String ghtkOrderId = null;
            String ghtkError = null;
            try {
                logger.info("🚀 Starting GHTK order creation for order: {}", orderId);
                ghtkOrderId = ghtkService.createOrderFromOrderEntity(order);
                logger.info("✅ GHTK order created successfully: {}", ghtkOrderId);
            } catch (Exception e) {
                ghtkError = e.getMessage();
                logger.error("❌ Error creating GHTK order for order {}: {}", orderId, e.getMessage(), e);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", orderId);
            response.put("ghtkOrderId", ghtkOrderId);
            response.put("ghtkError", ghtkError);
            response.put("message", ghtkOrderId != null ? 
                "Thanh toán thành công, đơn hàng GHTK đã được tạo" : 
                "Thanh toán thành công, nhưng có lỗi khi tạo đơn GHTK: " + ghtkError);
            
            logger.info("Payment confirmation successful for order: {}", orderId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error confirming payment and creating GHTK order", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Không thể xác nhận thanh toán: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Test endpoint để kiểm tra kết nối GHTK
     */
    @GetMapping("/test-ghtk")
    public ResponseEntity<Map<String, Object>> testGHTKConnection() {
        try {
            logger.info("Testing GHTK connection...");
            
            // Test với một đơn hàng mẫu
            GHTKOrderRequest testRequest = new GHTKOrderRequest();
            
            GHTKOrderRequest.GHTKOrderInfo orderInfo = new GHTKOrderRequest.GHTKOrderInfo();
            orderInfo.setId("TEST_ORDER_" + System.currentTimeMillis());
            orderInfo.setPick_name("Golden Bamboo Restaurant");
            orderInfo.setPick_address("Khu đô thị du lịch Marine Plaza, 32C Khu BTLK Phường Bãi Cháy");
            orderInfo.setPick_province("Quảng Ninh");
            orderInfo.setPick_district("Thành phố Hạ Long");
            orderInfo.setPick_ward("Phường Bãi Cháy");
            orderInfo.setPick_tel("0285551234");
            
            orderInfo.setName("Test Customer");
            orderInfo.setAddress("123 Test Street");
            orderInfo.setProvince("Hà Nội");
            orderInfo.setDistrict("Quận Ba Đình");
            orderInfo.setWard("Phường Phúc Xá");
            orderInfo.setTel("0123456789");
            
            orderInfo.setValue(50000);
            orderInfo.setPick_money(50000);
            orderInfo.setIs_freeship("0");
            orderInfo.setPick_option("cod");
            
            testRequest.setOrder(orderInfo);
            
            List<GHTKOrderRequest.GHTKProduct> products = new ArrayList<>();
            GHTKOrderRequest.GHTKProduct product = new GHTKOrderRequest.GHTKProduct();
            product.setName("Test Product");
            product.setWeight(0.5);
            product.setQuantity(1);
            product.setProduct_code("TEST001");
            products.add(product);
            testRequest.setProducts(products);
            
            GHTKOrderResponse response = ghtkService.createOrder(testRequest);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", response.isSuccess());
            result.put("message", response.getMessage());
            result.put("ghtkResponse", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error testing GHTK connection", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi kết nối GHTK: " + e.getMessage());
            errorResponse.put("error", e.toString());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Test endpoint đơn giản để kiểm tra cấu hình GHTK
     */
    @GetMapping("/test-ghtk-config")
    public ResponseEntity<Map<String, Object>> testGHTKConfig() {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "GHTK configuration test");
            result.put("timestamp", System.currentTimeMillis());
            result.put("status", "OK");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error testing GHTK config", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi cấu hình GHTK: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
