package com.poly.restaurant.services;

import com.poly.restaurant.dtos.OrderItemRequestDTO;
import com.poly.restaurant.dtos.OrderItemResponseDTO;
import com.poly.restaurant.entities.OrderItemEntity;
import com.poly.restaurant.entities.OrderEntity;
import com.poly.restaurant.entities.DishEntity;
import com.poly.restaurant.entities.ComboEntity;
import com.poly.restaurant.entities.DiscountEntity;
import com.poly.restaurant.entities.enums.OrderItemStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.repositories.OrderItemRepository;
import com.poly.restaurant.repositories.OrderRepository;
import com.poly.restaurant.repositories.DishRepository;
import com.poly.restaurant.repositories.ComboRepository;
import com.poly.restaurant.repositories.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private static final Logger logger = LoggerFactory.getLogger(OrderItemService.class);

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;
    private final DiscountRepository discountRepository;
    private final OrderCalculationService orderCalculationService;

    /**
     * Thêm món ăn vào đơn hàng
     */
    @Transactional
    public OrderItemResponseDTO addOrderItem(OrderItemRequestDTO request) {
        logger.info("Adding item to order: {}", request.getOrderId());

        // Kiểm tra đơn hàng có tồn tại không
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        // Tạo order item mới
        OrderItemEntity orderItem = new OrderItemEntity();
        orderItem.setOrder(order);
        orderItem.setQuantity(request.getQuantity());
        orderItem.setSpecialInstructions(request.getSpecialInstructions());
        orderItem.setStatus(OrderItemStatus.PENDING);
        orderItem.setCreatedAt(LocalDateTime.now());
        orderItem.setUpdatedAt(LocalDateTime.now());

        BigDecimal unitPrice = BigDecimal.ZERO;

        // Xử lý dish hoặc combo
        if (request.getDishId() != null) {
            // Xử lý dish - sử dụng dishId trực tiếp
            DishEntity dish = dishRepository.findById(request.getDishId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + request.getDishId()));
            
            orderItem.setDish(dish);

            // Tính giá từ Dish (đã chứa price trực tiếp)
            if (request.getUnitPrice() != null) {
                unitPrice = BigDecimal.valueOf(request.getUnitPrice());
            } else {
                unitPrice = dish.getBasePrice();
            }
            
            // Tự động áp dụng discount nếu dish có discount
            if (dish.getDiscount() != null && dish.getDiscount().getStatus().toString().equals("ACTIVE")) {
                // Kiểm tra discount có còn hiệu lực không
                LocalDateTime now = LocalDateTime.now();
                if (dish.getDiscount().getStartDate().isBefore(now) && dish.getDiscount().getEndDate().isAfter(now)) {
                    orderItem.setDiscount(dish.getDiscount());
                    logger.info("Auto-applying discount {} to dish {}", dish.getDiscount().getId(), dish.getId());
                }
            }
        } else if (request.getComboId() != null) {
            // Xử lý combo
            ComboEntity combo = comboRepository.findById(request.getComboId())
                    .orElseThrow(() -> new ResourceNotFoundException("Combo not found with id: " + request.getComboId()));
            
            orderItem.setCombo(combo);

            // Tính giá từ Combo
            if (request.getUnitPrice() != null) {
                unitPrice = BigDecimal.valueOf(request.getUnitPrice());
            } else {
                unitPrice = combo.getBasePrice();
            }
            
            // Tự động áp dụng discount nếu combo có discount
            if (combo.getDiscount() != null && combo.getDiscount().getStatus().toString().equals("ACTIVE")) {
                // Kiểm tra discount có còn hiệu lực không
                LocalDateTime now = LocalDateTime.now();
                if (combo.getDiscount().getStartDate().isBefore(now) && combo.getDiscount().getEndDate().isAfter(now)) {
                    orderItem.setDiscount(combo.getDiscount());
                    logger.info("Auto-applying discount {} to combo {}", combo.getDiscount().getId(), combo.getId());
                }
            }
        } else {
            throw new IllegalArgumentException("Either dishId or comboId must be provided");
        }

        orderItem.setUnitPrice(unitPrice);
        orderItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(request.getQuantity())));

        // Xử lý khuyến mãi nếu có (từ dish/combo hoặc từ request)
        if (orderItem.getDiscount() != null) {
            // Đã có discount từ dish/combo, tính giá cuối cùng
            BigDecimal discountAmount = calculateDiscountAmount(orderItem.getTotalPrice(), orderItem.getDiscount());
            orderItem.setDiscountAmount(discountAmount);
            orderItem.setFinalPrice(orderItem.getTotalPrice().subtract(discountAmount));
            logger.info("Applied discount {} to order item, final price: {}", orderItem.getDiscount().getId(), orderItem.getFinalPrice());
        } else if (request.getDiscountId() != null) {
            DiscountEntity discount = discountRepository.findById(request.getDiscountId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Discount not found with id: " + request.getDiscountId()));
            orderItem.setDiscount(discount);

            // Tính giá sau khuyến mãi
            BigDecimal discountAmount = calculateDiscountAmount(orderItem.getTotalPrice(), discount);
            orderItem.setDiscountAmount(discountAmount);
            orderItem.setFinalPrice(orderItem.getTotalPrice().subtract(discountAmount));
        } else if (request.getDiscountPercentage() != null && request.getDiscountPercentage() > 0) {
            // Xử lý discount percentage từ frontend
            BigDecimal discountAmount = orderItem.getTotalPrice()
                    .multiply(BigDecimal.valueOf(request.getDiscountPercentage()))
                    .divide(BigDecimal.valueOf(100));
            orderItem.setDiscountAmount(discountAmount);
            orderItem.setFinalPrice(orderItem.getTotalPrice().subtract(discountAmount));
        } else {
            orderItem.setFinalPrice(orderItem.getTotalPrice());
        }

        OrderItemEntity savedItem = orderItemRepository.save(orderItem);
        logger.info("Item added successfully with ID: {}", savedItem.getId());

        // Tính toán lại tổng tiền đơn hàng
        orderCalculationService.calculateOrderTotal(request.getOrderId());

        return mapToResponseDTO(savedItem);
    }

    /**
     * Cập nhật món ăn trong đơn hàng
     */
    @Transactional
    public OrderItemResponseDTO updateOrderItem(OrderItemRequestDTO request) {
        logger.info("Updating item: {}", request.getId());

        OrderItemEntity orderItem = orderItemRepository.findById(request.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + request.getId()));

        // Chỉ cho phép cập nhật nếu món chưa được chế biến
        if (orderItem.getStatus() == OrderItemStatus.IN_PROGRESS ||
                orderItem.getStatus() == OrderItemStatus.READY ||
                orderItem.getStatus() == OrderItemStatus.SERVED) {
            throw new IllegalStateException("Cannot update item that is already being prepared or served");
        }

        // Cập nhật thông tin
        orderItem.setQuantity(request.getQuantity());
        orderItem.setSpecialInstructions(request.getSpecialInstructions());
        orderItem.setUpdatedAt(LocalDateTime.now());

        // Cập nhật giá nếu có
        if (request.getUnitPrice() != null) {
            BigDecimal unitPrice = BigDecimal.valueOf(request.getUnitPrice());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(request.getQuantity())));
        } else {
            orderItem.setTotalPrice(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        }

        // Cập nhật khuyến mãi nếu có
        if (request.getDiscountId() != null) {
            DiscountEntity discount = discountRepository.findById(request.getDiscountId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Discount not found with id: " + request.getDiscountId()));
            orderItem.setDiscount(discount);

            BigDecimal discountAmount = calculateDiscountAmount(orderItem.getTotalPrice(), discount);
            orderItem.setDiscountAmount(discountAmount);
            orderItem.setFinalPrice(orderItem.getTotalPrice().subtract(discountAmount));
        } else {
            orderItem.setDiscountAmount(BigDecimal.ZERO);
            orderItem.setFinalPrice(orderItem.getTotalPrice());
        }

        OrderItemEntity savedItem = orderItemRepository.save(orderItem);
        
        // Tính toán lại tổng tiền đơn hàng
        orderCalculationService.calculateOrderTotal(request.getOrderId());
        
        return mapToResponseDTO(savedItem);
    }

    /**
     * Xóa món ăn khỏi đơn hàng
     */
    @Transactional
    public void removeOrderItem(Long orderId, Long itemId) {
        logger.info("Removing item {} from order: {}", itemId, orderId);

        OrderItemEntity orderItem = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + itemId));

        // Kiểm tra xem item có thuộc order không
        if (!orderItem.getOrder().getId().equals(orderId)) {
            throw new IllegalArgumentException("Order item does not belong to the specified order");
        }

        // Chỉ cho phép xóa nếu món chưa được chế biến
        if (orderItem.getStatus() == OrderItemStatus.IN_PROGRESS ||
                orderItem.getStatus() == OrderItemStatus.READY ||
                orderItem.getStatus() == OrderItemStatus.SERVED) {
            throw new IllegalStateException("Cannot remove item that is already being prepared or served");
        }

        orderItemRepository.delete(orderItem);
        logger.info("Item removed successfully");
        
        // Tính toán lại tổng tiền đơn hàng
        orderCalculationService.calculateOrderTotal(orderId);
    }

    /**
     * Cập nhật trạng thái món ăn
     */
    @Transactional
    public OrderItemResponseDTO updateOrderItemStatus(Long orderId, Long itemId, OrderItemStatus status) {
        logger.info("Updating item {} status to: {} in order: {}", itemId, status, orderId);

        OrderItemEntity orderItem = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + itemId));

        // Kiểm tra xem item có thuộc order không
        if (!orderItem.getOrder().getId().equals(orderId)) {
            throw new IllegalArgumentException("Order item does not belong to the specified order");
        }

        orderItem.setStatus(status);
        orderItem.setUpdatedAt(LocalDateTime.now());

        if (status == OrderItemStatus.READY || status == OrderItemStatus.SERVED) {
            orderItem.setCompletedAt(LocalDateTime.now());
        }

        OrderItemEntity savedItem = orderItemRepository.save(orderItem);
        return mapToResponseDTO(savedItem);
    }

    /**
     * Cập nhật trạng thái tất cả món ăn trong đơn hàng
     */
    @Transactional
    public void updateAllOrderItemsStatus(Long orderId, OrderItemStatus status) {
        logger.info("Updating all items status to: {} in order: {}", status, orderId);

        List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItemEntity item : items) {
            item.setStatus(status);
            item.setUpdatedAt(LocalDateTime.now());
            if (status == OrderItemStatus.READY || status == OrderItemStatus.SERVED) {
                item.setCompletedAt(LocalDateTime.now());
            }
        }
        orderItemRepository.saveAll(items);
    }

    /**
     * Lấy danh sách món ăn đang chuẩn bị (cho bếp)
     */
    @Transactional(readOnly = true)
    public List<OrderItemResponseDTO> getKitchenItems() {
        List<OrderItemEntity> items = orderItemRepository.findByStatusIn(
                List.of(OrderItemStatus.CONFIRMED, OrderItemStatus.IN_PROGRESS));

        return items.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tính toán số tiền giảm giá
     */
    private BigDecimal calculateDiscountAmount(BigDecimal totalPrice, DiscountEntity discount) {
        // Với hệ thống mới, discount chỉ có newPrice
        // Không cần tính toán phức tạp, chỉ cần trả về số tiền giảm
        return BigDecimal.ZERO; // Sẽ được tính ở frontend dựa trên newPrice
    }

    /**
     * Map entity sang DTO
     */
    public OrderItemResponseDTO mapToResponseDTO(OrderItemEntity orderItem) {
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setId(orderItem.getId());
        dto.setOrderId(orderItem.getOrder().getId());

        // Thông tin món ăn
        if (orderItem.getDish() != null) {
            dto.setDishId(orderItem.getDish().getId());
            dto.setDishName(orderItem.getDish().getName());
            dto.setDishImage(orderItem.getDish().getImage());
        }

        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getTotalPrice());
        dto.setSpecialInstructions(orderItem.getSpecialInstructions());

        dto.setStatus(orderItem.getStatus());
        dto.setCreatedAt(orderItem.getCreatedAt());
        dto.setUpdatedAt(orderItem.getUpdatedAt());
        dto.setCompletedAt(orderItem.getCompletedAt());

        // Thông tin khuyến mãi
        if (orderItem.getDiscount() != null) {
            dto.setDiscountId(orderItem.getDiscount().getId());
            dto.setDiscountName(orderItem.getDiscount().getName());
            dto.setDiscountType("NEW_PRICE"); // Hệ thống mới chỉ có newPrice
            dto.setDiscountValue(orderItem.getDiscount().getNewPrice());
        }
        dto.setFinalPrice(orderItem.getFinalPrice());

        // Thông tin bàn và chi nhánh
        if (orderItem.getOrder().getTable() != null) {
            dto.setTableId(orderItem.getOrder().getTable().getId());
            dto.setTableName(orderItem.getOrder().getTable().getName());
        } else {
            dto.setTableId(null);
            dto.setTableName("Khách lẻ");
        }
        dto.setBranchId(orderItem.getOrder().getBranch().getId());
        dto.setBranchName(orderItem.getOrder().getBranch().getName());

        return dto;
    }
}
