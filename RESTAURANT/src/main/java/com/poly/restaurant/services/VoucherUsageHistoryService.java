package com.poly.restaurant.services;

import com.poly.restaurant.dtos.VoucherUsageHistoryRequestDTO;
import com.poly.restaurant.dtos.VoucherUsageHistoryResponseDTO;
import com.poly.restaurant.entities.VoucherUsageHistoryEntity;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.VoucherUsageHistoryMapper;
import com.poly.restaurant.repositories.VoucherUsageHistoryRepository;
import com.poly.restaurant.repositories.DiscountRepository;
import com.poly.restaurant.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherUsageHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(VoucherUsageHistoryService.class);
    
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final DiscountRepository discountRepository;
    private final OrderRepository orderRepository;

    /**
     * Lưu lịch sử sử dụng voucher
     */
    @Transactional
    public VoucherUsageHistoryResponseDTO saveVoucherUsage(VoucherUsageHistoryRequestDTO request) {
        logger.info("Saving voucher usage history for voucher: {}, order: {}", 
                   request.getVoucherId(), request.getOrderId());
        
        // Lấy voucher và order
        DiscountEntity voucher = discountRepository.findById(request.getVoucherId())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + request.getVoucherId()));
        
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        
        // Tạo entity
        VoucherUsageHistoryEntity entity = VoucherUsageHistoryMapper.toEntity(request, voucher, order);
        
        // Lưu vào database
        VoucherUsageHistoryEntity savedEntity = voucherUsageHistoryRepository.save(entity);
        
        logger.info("Voucher usage history saved with ID: {}", savedEntity.getId());
        
        return VoucherUsageHistoryMapper.toResponseDto(savedEntity);
    }

    /**
     * Lấy lịch sử sử dụng voucher theo voucher ID
     */
    @Transactional(readOnly = true)
    public List<VoucherUsageHistoryResponseDTO> getVoucherUsageHistory(Long voucherId) {
        logger.info("Getting voucher usage history for voucher: {}", voucherId);
        
        List<VoucherUsageHistoryEntity> entities = voucherUsageHistoryRepository.findByVoucherIdOrderByUsedAtDesc(voucherId);
        
        return entities.stream()
                .map(VoucherUsageHistoryMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử sử dụng voucher theo order ID
     */
    @Transactional(readOnly = true)
    public Optional<VoucherUsageHistoryResponseDTO> getVoucherUsageByOrderId(Long orderId) {
        logger.info("Getting voucher usage history for order: {}", orderId);
        
        Optional<VoucherUsageHistoryEntity> entity = voucherUsageHistoryRepository.findByOrderId(orderId);
        
        return entity.map(VoucherUsageHistoryMapper::toResponseDto);
    }

    /**
     * Lấy lịch sử sử dụng voucher theo mã voucher
     */
    @Transactional(readOnly = true)
    public List<VoucherUsageHistoryResponseDTO> getVoucherUsageByCode(String voucherCode) {
        logger.info("Getting voucher usage history for voucher code: {}", voucherCode);
        
        List<VoucherUsageHistoryEntity> entities = voucherUsageHistoryRepository.findByVoucherCodeOrderByUsedAtDesc(voucherCode);
        
        return entities.stream()
                .map(VoucherUsageHistoryMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử sử dụng voucher theo số điện thoại khách hàng
     */
    @Transactional(readOnly = true)
    public List<VoucherUsageHistoryResponseDTO> getVoucherUsageByCustomerPhone(String customerPhone) {
        logger.info("Getting voucher usage history for customer phone: {}", customerPhone);
        
        List<VoucherUsageHistoryEntity> entities = voucherUsageHistoryRepository.findByCustomerPhoneOrderByUsedAtDesc(customerPhone);
        
        return entities.stream()
                .map(VoucherUsageHistoryMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử sử dụng voucher trong khoảng thời gian
     */
    @Transactional(readOnly = true)
    public List<VoucherUsageHistoryResponseDTO> getVoucherUsageByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Getting voucher usage history from {} to {}", startDate, endDate);
        
        List<VoucherUsageHistoryEntity> entities = voucherUsageHistoryRepository.findByUsedAtBetween(startDate, endDate);
        
        return entities.stream()
                .map(VoucherUsageHistoryMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử sử dụng voucher với phân trang
     */
    @Transactional(readOnly = true)
    public Page<VoucherUsageHistoryResponseDTO> getVoucherUsageHistoryPaginated(Long voucherId, int page, int size) {
        logger.info("Getting paginated voucher usage history for voucher: {}, page: {}, size: {}", 
                   voucherId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherUsageHistoryEntity> entityPage = voucherUsageHistoryRepository.findByVoucherIdOrderByUsedAtDesc(voucherId, pageable);
        
        return entityPage.map(VoucherUsageHistoryMapper::toResponseDto);
    }

    /**
     * Lấy tất cả lịch sử sử dụng voucher với phân trang (cho trang quản lý)
     */
    @Transactional(readOnly = true)
    public Page<VoucherUsageHistoryResponseDTO> getAllVoucherUsageHistoryPaginated(int page, int size) {
        logger.info("Getting all voucher usage history with pagination - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherUsageHistoryEntity> entityPage = voucherUsageHistoryRepository.findAll(pageable);
        
        return entityPage.map(VoucherUsageHistoryMapper::toResponseDto);
    }

    /**
     * Lấy lịch sử sử dụng voucher với filter và phân trang
     */
    @Transactional(readOnly = true)
    public Page<VoucherUsageHistoryResponseDTO> getVoucherUsageHistoryWithFilters(
            String voucherCode, String customerPhone, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size) {
        logger.info("Getting voucher usage history with filters - voucherCode: {}, customerPhone: {}, startDate: {}, endDate: {}, page: {}, size: {}", 
                   voucherCode, customerPhone, startDate, endDate, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherUsageHistoryEntity> entityPage = voucherUsageHistoryRepository.findByFilters(
                voucherCode, customerPhone, startDate, endDate, pageable);
        
        return entityPage.map(VoucherUsageHistoryMapper::toResponseDto);
    }

    /**
     * Đếm số lần sử dụng voucher
     */
    @Transactional(readOnly = true)
    public long getVoucherUsageCount(Long voucherId) {
        return voucherUsageHistoryRepository.countByVoucherId(voucherId);
    }

    /**
     * Đếm số lần sử dụng voucher theo mã
     */
    @Transactional(readOnly = true)
    public long getVoucherUsageCountByCode(String voucherCode) {
        return voucherUsageHistoryRepository.countByVoucherCode(voucherCode);
    }

    /**
     * Lấy voucher được sử dụng nhiều nhất
     */
    @Transactional(readOnly = true)
    public List<Object[]> getMostUsedVouchers(int limit) {
        logger.info("Getting most used vouchers with limit: {}", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        return voucherUsageHistoryRepository.findMostUsedVouchers(pageable);
    }

    /**
     * Lấy khách hàng sử dụng voucher nhiều nhất
     */
    @Transactional(readOnly = true)
    public List<Object[]> getMostActiveCustomers(int limit) {
        logger.info("Getting most active customers with limit: {}", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        return voucherUsageHistoryRepository.findMostActiveCustomers(pageable);
    }
}
