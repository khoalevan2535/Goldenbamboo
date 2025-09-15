package com.poly.restaurant.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poly.restaurant.dtos.DeliveryAddressRequestDTO;
import com.poly.restaurant.dtos.DeliveryAddressResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.services.DeliveryAddressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/delivery-addresses")
@RequiredArgsConstructor
public class DeliveryAddressController {
    
    private final DeliveryAddressService deliveryAddressService;
    
    /**
     * Tạo địa chỉ giao hàng mới
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<DeliveryAddressResponseDTO> createDeliveryAddress(
            @Valid @RequestBody DeliveryAddressRequestDTO request,
            Authentication authentication
    ) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        DeliveryAddressResponseDTO response = deliveryAddressService.createDeliveryAddress(request, account.getId());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy danh sách địa chỉ giao hàng của tài khoản
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<List<DeliveryAddressResponseDTO>> getDeliveryAddresses(Authentication authentication) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        List<DeliveryAddressResponseDTO> addresses = deliveryAddressService.getDeliveryAddressesByAccountId(account.getId());
        return ResponseEntity.ok(addresses);
    }
    
    /**
     * Lấy địa chỉ giao hàng theo ID
     */
    @GetMapping("/{addressId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<DeliveryAddressResponseDTO> getDeliveryAddressById(
            @PathVariable Long addressId,
            Authentication authentication
    ) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        DeliveryAddressResponseDTO address = deliveryAddressService.getDeliveryAddressById(addressId, account.getId());
        return ResponseEntity.ok(address);
    }
    
    /**
     * Cập nhật địa chỉ giao hàng
     */
    @PutMapping("/{addressId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<DeliveryAddressResponseDTO> updateDeliveryAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody DeliveryAddressRequestDTO request,
            Authentication authentication
    ) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        DeliveryAddressResponseDTO response = deliveryAddressService.updateDeliveryAddress(addressId, request, account.getId());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Xóa địa chỉ giao hàng
     */
    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<Void> deleteDeliveryAddress(
            @PathVariable Long addressId,
            Authentication authentication
    ) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        deliveryAddressService.deleteDeliveryAddress(addressId, account.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Đặt địa chỉ làm mặc định
     */
    @PutMapping("/{addressId}/set-default")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<DeliveryAddressResponseDTO> setDefaultAddress(
            @PathVariable Long addressId,
            Authentication authentication
    ) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        DeliveryAddressResponseDTO response = deliveryAddressService.setDefaultAddress(addressId, account.getId());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy địa chỉ mặc định của tài khoản
     */
    @GetMapping("/default")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<DeliveryAddressResponseDTO> getDefaultAddress(Authentication authentication) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        Optional<DeliveryAddressResponseDTO> address = deliveryAddressService.getDefaultAddress(account.getId());
        return address.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Tính phí vận chuyển (mock implementation)
     */
    @GetMapping("/{addressId}/shipping-fee")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<Object> calculateShippingFee(
            @PathVariable Long addressId,
            Authentication authentication
    ) {
        AccountEntity account = (AccountEntity) authentication.getPrincipal();
        
        // Kiểm tra địa chỉ có tồn tại và thuộc về user không
        deliveryAddressService.getDeliveryAddressById(addressId, account.getId());
        
        // Mock phí vận chuyển - trong thực tế sẽ gọi API GHTK
        int mockShippingFee = 25000; // 25,000 VNĐ
        
        return ResponseEntity.ok(new Object() {
            public final boolean success = true;
            public final String message = "Tính phí vận chuyển thành công";
            public final Object fee = new Object() {
                public final int fee = mockShippingFee;
                public final String currency = "VND";
                public final String service = "Giao Hàng Tiết Kiệm";
            };
        });
    }
}