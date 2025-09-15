package com.poly.restaurant.services;

import com.poly.restaurant.dto.GHTKOrderRequest;
import com.poly.restaurant.dto.GHTKOrderResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.ArrayList;

@Service
public class GHTKService {
    
    @Value("${ghtk.token:2N0Uv6JWHdTCHUsuc2nfqFeXJ8cYtzyz6kGhtUo}")
    private String ghtkToken;
    
    @Value("${ghtk.partner-code:S22737331}")
    private String partnerCode;

    private final String baseUrl = "https://services.giaohangtietkiem.vn";
    private final RestTemplate restTemplate = new RestTemplate();

    public GHTKOrderResponse createOrder(GHTKOrderRequest orderRequest) {
        try {
            System.out.println("🚚 Creating GHTK order with token: " + ghtkToken);
            System.out.println("🏢 Partner code: " + partnerCode);
            System.out.println("📋 Order request: " + orderRequest);
            System.out.println("💰 Order value: " + orderRequest.getOrder().getValue());
            System.out.println("💰 Pick money: " + orderRequest.getOrder().getPick_money());
            System.out.println("🚚 Is freeship: " + orderRequest.getOrder().getIs_freeship());
            System.out.println("📦 Pick option: " + orderRequest.getOrder().getPick_option());
            System.out.println("📦 Products count: " + orderRequest.getProducts().size());
            double totalWeight = orderRequest.getProducts().stream()
                .mapToDouble(product -> product.getWeight() * product.getQuantity())
                .sum();
            System.out.println("⚖️ Total weight: " + totalWeight + "kg");
            System.out.println("📍 Customer address: " + orderRequest.getOrder().getAddress());
            System.out.println("📍 Customer province: " + orderRequest.getOrder().getProvince());
            System.out.println("📍 Customer district: " + orderRequest.getOrder().getDistrict());
            System.out.println("📍 Customer ward: " + orderRequest.getOrder().getWard());
            
            String url = baseUrl + "/services/shipment/order";
            System.out.println("🌐 GHTK API URL: " + url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Token", ghtkToken);
            headers.set("X-Client-Source", partnerCode);
            headers.set("Content-Type", "application/json");
            
            HttpEntity<GHTKOrderRequest> request = new HttpEntity<>(orderRequest, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                url, request, String.class
            );
            
            System.out.println("📊 Response status: " + response.getStatusCode());
            System.out.println("📊 Response headers: " + response.getHeaders());
            System.out.println("📊 Response body: " + response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful()) {
                // Parse JSON response manually
                String responseBody = response.getBody();
                if (responseBody != null && responseBody.contains("success")) {
                    // Simple success response
                    GHTKOrderResponse ghtkResponse = new GHTKOrderResponse();
                    ghtkResponse.setSuccess(true);
                    ghtkResponse.setMessage("Order created successfully");
                    System.out.println("✅ GHTK order created successfully");
                    return ghtkResponse;
                } else {
                    throw new RuntimeException("Invalid response format from GHTK: " + responseBody);
                }
            } else {
                throw new RuntimeException("GHTK API returned error: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating GHTK order: " + e.getMessage());
            System.err.println("❌ Error type: " + e.getClass().getSimpleName());
            if (e.getMessage() != null) {
                System.err.println("❌ Error details: " + e.getMessage());
            }
            e.printStackTrace();
            throw new RuntimeException("Error creating GHTK order: " + e.getMessage(), e);
        }
    }

    public boolean testConnection() {
        try {
            String url = baseUrl + "/services/shipment/order";
            
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghtkToken);
        headers.set("Content-Type", "application/json");
            
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );
            
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Tạo đơn GHTK từ OrderEntity
     */
    public String createOrderFromOrderEntity(com.poly.restaurant.entities.OrderEntity order) {
        try {
            System.out.println("🚚 Creating GHTK order from OrderEntity: " + order.getId());
            
            // Tạo GHTKOrderRequest từ OrderEntity
            GHTKOrderRequest ghtkRequest = new GHTKOrderRequest();
            
            // Tạo order info
            GHTKOrderRequest.GHTKOrderInfo orderInfo = new GHTKOrderRequest.GHTKOrderInfo();
            orderInfo.setId("ORDER_" + order.getId());
            orderInfo.setPick_name("Golden Bamboo Restaurant");
            orderInfo.setPick_address("Khu đô thị du lịch Marine Plaza, 32C Khu BTLK Phường Bãi Cháy");
            orderInfo.setPick_province("Quảng Ninh");
            orderInfo.setPick_district("Thành phố Hạ Long");
            orderInfo.setPick_ward("Phường Bãi Cháy");
            orderInfo.setPick_tel("0285551234");
            
            // Thông tin người nhận từ delivery address
            if (order.getDeliveryAddress() != null) {
                orderInfo.setName(order.getDeliveryAddress().getRecipientName());
                orderInfo.setAddress(order.getDeliveryAddress().getAddress());
                orderInfo.setProvince(order.getDeliveryAddress().getProvince());
                orderInfo.setDistrict(order.getDeliveryAddress().getDistrict());
                orderInfo.setWard(order.getDeliveryAddress().getWard());
                orderInfo.setTel(order.getDeliveryAddress().getPhoneNumber());
            } else {
                // Fallback nếu không có delivery address
                orderInfo.setName("Khách hàng");
                orderInfo.setAddress("Địa chỉ không xác định");
                orderInfo.setProvince("Hà Nội");
                orderInfo.setDistrict("Quận Ba Đình");
                orderInfo.setWard("Phường Phúc Xá");
                orderInfo.setTel("0123456789");
            }
            
            orderInfo.setValue(order.getTotalAmount().intValue());
            orderInfo.setPick_money(order.getTotalAmount().intValue());
            orderInfo.setIs_freeship("0");
            orderInfo.setPick_option("cod");
            
            ghtkRequest.setOrder(orderInfo);
            
            // Tạo danh sách sản phẩm
            List<GHTKOrderRequest.GHTKProduct> products = new ArrayList<>();
            for (com.poly.restaurant.entities.OrderItemEntity item : order.getOrderItems()) {
                GHTKOrderRequest.GHTKProduct product = new GHTKOrderRequest.GHTKProduct();
                product.setName(item.getDish() != null ? item.getDish().getName() : 
                               item.getCombo() != null ? item.getCombo().getName() : "Sản phẩm");
                product.setWeight(0.5); // Default weight 0.5kg
                product.setQuantity(item.getQuantity());
                product.setProduct_code(item.getId().toString());
                products.add(product);
            }
            ghtkRequest.setProducts(products);
            
            // Gọi API GHTK
            GHTKOrderResponse response = createOrder(ghtkRequest);
            
            if (response.isSuccess()) {
                return response.getOrder() != null ? response.getOrder().getLabel() : "GHTK_" + order.getId();
            } else {
                throw new RuntimeException("GHTK order creation failed: " + response.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("Error creating GHTK order from OrderEntity: " + e.getMessage());
            throw new RuntimeException("Không thể tạo đơn GHTK: " + e.getMessage());
        }
    }
}