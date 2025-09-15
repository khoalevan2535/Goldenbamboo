package com.poly.restaurant.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poly.restaurant.dtos.DeliveryAddressRequestDTO;
import com.poly.restaurant.dtos.DeliveryAddressResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.DeliveryAddressEntity;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.DeliveryAddressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryAddressService {
    
    private final DeliveryAddressRepository deliveryAddressRepository;
    private final AccountRepository accountRepository;
    private final BranchRepository branchRepository;
    
    /**
     * Tạo địa chỉ giao hàng mới
     */
    @Transactional
    public DeliveryAddressResponseDTO createDeliveryAddress(DeliveryAddressRequestDTO request, Long accountId) {
        // Kiểm tra tài khoản tồn tại
        AccountEntity account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        // Kiểm tra chi nhánh tồn tại
        BranchEntity branch = branchRepository.findById(request.getBranchId())
            .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));
        
        // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
        if (request.getIsDefault() != null && request.getIsDefault()) {
            deliveryAddressRepository.findByAccountIdAndIsDefaultTrue(accountId)
                .ifPresent(existingDefault -> {
                    existingDefault.setIsDefault(false);
                    deliveryAddressRepository.save(existingDefault);
                });
        }
        
        // Tạo entity mới
        DeliveryAddressEntity entity = new DeliveryAddressEntity();
        entity.setAccount(account);
        entity.setBranch(branch);
        entity.setRecipientName(request.getRecipientName());
        entity.setPhoneNumber(request.getPhoneNumber());
        entity.setAddress(request.getAddress());
        entity.setProvince(request.getProvince());
        entity.setDistrict(request.getDistrict());
        entity.setWard(request.getWard());
        entity.setFullAddress(request.getFullAddress());
        entity.setShortAddress(request.getShortAddress());
        entity.setNotes(request.getNotes());
        entity.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        
        // Lưu vào database
        DeliveryAddressEntity savedEntity = deliveryAddressRepository.save(entity);
        
        return convertToResponseDTO(savedEntity);
    }
    
    /**
     * Lấy danh sách địa chỉ giao hàng của tài khoản
     */
    public List<DeliveryAddressResponseDTO> getDeliveryAddressesByAccountId(Long accountId) {
        List<DeliveryAddressEntity> entities = deliveryAddressRepository.findByAccountIdOrderByIsDefaultDescCreatedAtDesc(accountId);
        return entities.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy địa chỉ giao hàng theo ID
     */
    public DeliveryAddressResponseDTO getDeliveryAddressById(Long addressId, Long accountId) {
        DeliveryAddressEntity entity = deliveryAddressRepository.findByIdAndAccountId(addressId, accountId)
            .orElseThrow(() -> new RuntimeException("Địa chỉ giao hàng không tồn tại"));
        return convertToResponseDTO(entity);
    }
    
    /**
     * Cập nhật địa chỉ giao hàng
     */
    @Transactional
    public DeliveryAddressResponseDTO updateDeliveryAddress(Long addressId, DeliveryAddressRequestDTO request, Long accountId) {
        DeliveryAddressEntity entity = deliveryAddressRepository.findByIdAndAccountId(addressId, accountId)
            .orElseThrow(() -> new RuntimeException("Địa chỉ giao hàng không tồn tại"));
        
        // Kiểm tra chi nhánh tồn tại
        BranchEntity branch = branchRepository.findById(request.getBranchId())
            .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));
        
        // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
        if (request.getIsDefault() != null && request.getIsDefault() && !entity.getIsDefault()) {
            deliveryAddressRepository.findByAccountIdAndIsDefaultTrue(accountId)
                .ifPresent(existingDefault -> {
                    existingDefault.setIsDefault(false);
                    deliveryAddressRepository.save(existingDefault);
                });
        }
        
        // Cập nhật thông tin
        entity.setBranch(branch);
        entity.setRecipientName(request.getRecipientName());
        entity.setPhoneNumber(request.getPhoneNumber());
        entity.setAddress(request.getAddress());
        entity.setProvince(request.getProvince());
        entity.setDistrict(request.getDistrict());
        entity.setWard(request.getWard());
        entity.setFullAddress(request.getFullAddress());
        entity.setShortAddress(request.getShortAddress());
        entity.setNotes(request.getNotes());
        entity.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : entity.getIsDefault());
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        
        DeliveryAddressEntity savedEntity = deliveryAddressRepository.save(entity);
        return convertToResponseDTO(savedEntity);
    }
    
    /**
     * Xóa địa chỉ giao hàng
     */
    @Transactional
    public void deleteDeliveryAddress(Long addressId, Long accountId) {
        DeliveryAddressEntity entity = deliveryAddressRepository.findByIdAndAccountId(addressId, accountId)
            .orElseThrow(() -> new RuntimeException("Địa chỉ giao hàng không tồn tại"));
        
        deliveryAddressRepository.delete(entity);
    }
    
    /**
     * Đặt địa chỉ làm mặc định
     */
    @Transactional
    public DeliveryAddressResponseDTO setDefaultAddress(Long addressId, Long accountId) {
        DeliveryAddressEntity entity = deliveryAddressRepository.findByIdAndAccountId(addressId, accountId)
            .orElseThrow(() -> new RuntimeException("Địa chỉ giao hàng không tồn tại"));
        
        // Bỏ mặc định của địa chỉ hiện tại
        deliveryAddressRepository.findByAccountIdAndIsDefaultTrue(accountId)
            .ifPresent(existingDefault -> {
                existingDefault.setIsDefault(false);
                deliveryAddressRepository.save(existingDefault);
            });
        
        // Đặt địa chỉ này làm mặc định
        entity.setIsDefault(true);
        DeliveryAddressEntity savedEntity = deliveryAddressRepository.save(entity);
        
        return convertToResponseDTO(savedEntity);
    }
    
    /**
     * Lấy địa chỉ mặc định của tài khoản
     */
    public Optional<DeliveryAddressResponseDTO> getDefaultAddress(Long accountId) {
        return deliveryAddressRepository.findByAccountIdAndIsDefaultTrue(accountId)
            .map(this::convertToResponseDTO);
    }
    
    /**
     * Chuyển đổi Entity sang ResponseDTO
     */
    private DeliveryAddressResponseDTO convertToResponseDTO(DeliveryAddressEntity entity) {
        DeliveryAddressResponseDTO dto = new DeliveryAddressResponseDTO();
        dto.setId(entity.getId());
        dto.setAccountId(entity.getAccount().getId());
        dto.setBranchId(entity.getBranch().getId());
        dto.setBranchName(entity.getBranch().getName());
        dto.setRecipientName(entity.getRecipientName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setAddress(entity.getAddress());
        dto.setProvince(entity.getProvince());
        dto.setDistrict(entity.getDistrict());
        dto.setWard(entity.getWard());
        dto.setFullAddress(entity.getFullAddress());
        dto.setShortAddress(entity.getShortAddress());
        dto.setNotes(entity.getNotes());
        dto.setIsDefault(entity.getIsDefault());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}