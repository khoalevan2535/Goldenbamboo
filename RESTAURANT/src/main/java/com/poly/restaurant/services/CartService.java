package com.poly.restaurant.services;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.entities.*;
import com.poly.restaurant.repositories.*;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AccountRepository accountRepository;
    private final BranchRepository branchRepository;
    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;

    /**
     * Thêm item vào giỏ hàng
     */
    @Transactional
    public CartResponseDTO addItemToCart(CartRequestDTO request) {
        log.info("Adding item to cart: {}", request);

        // Validate request
        if (!request.isValid()) {
            throw new IllegalArgumentException("Invalid cart request");
        }

        // Get or create cart
        CartEntity cart = getOrCreateCart(request.getAccountId(), request.getSessionId(), request.getBranchId());

        // Get item details
        ItemDetails itemDetails = getItemDetails(request.getItemId(), request.getItemType());
        if (itemDetails == null) {
            throw new ResourceNotFoundException("Item not found: " + request.getItemId());
        }

        // Check if item already exists in cart
        Optional<CartItemEntity> existingItem = findExistingCartItem(cart.getId(), request.getItemId());
        
        if (existingItem.isPresent()) {
            // Update existing item
            CartItemEntity cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItem.setSpecialInstructions(request.getSpecialInstructions());
            cartItem.calculatePrices();
            cartItemRepository.save(cartItem);
        } else {
            // Create new cart item
            CartItemEntity cartItem = new CartItemEntity();
            cartItem.setCart(cart);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUnitPrice(itemDetails.getPrice());
            cartItem.setSpecialInstructions(request.getSpecialInstructions());
            
            if ("dish".equals(request.getItemType())) {
                cartItem.setDish(itemDetails.getDish());
            } else {
                cartItem.setCombo(itemDetails.getCombo());
            }
            
            cartItem.calculatePrices();
            cartItemRepository.save(cartItem);
        }

        // Update cart totals
        updateCartTotals(cart.getId());

        // Extend cart expiration
        cart.extendExpiration();
        cartRepository.save(cart);

        return getCartResponse(cart.getId());
    }

    /**
     * Cập nhật số lượng item trong giỏ hàng
     */
    @Transactional
    public CartResponseDTO updateCartItem(CartItemRequestDTO request) {
        log.info("Updating cart item: {}", request);

        if (!request.isValid()) {
            throw new IllegalArgumentException("Invalid cart item request");
        }

        CartItemEntity cartItem = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + request.getCartItemId()));

        cartItem.setQuantity(request.getQuantity());
        cartItem.setSpecialInstructions(request.getSpecialInstructions());
        cartItem.calculatePrices();
        cartItemRepository.save(cartItem);

        // Update cart totals
        updateCartTotals(cartItem.getCart().getId());

        return getCartResponse(cartItem.getCart().getId());
    }

    /**
     * Xóa item khỏi giỏ hàng
     */
    @Transactional
    public CartResponseDTO removeItemFromCart(Long cartItemId) {
        log.info("Removing cart item: {}", cartItemId);

        CartItemEntity cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        Long cartId = cartItem.getCart().getId();
        cartItemRepository.delete(cartItem);

        // Update cart totals
        updateCartTotals(cartId);

        return getCartResponse(cartId);
    }

    /**
     * Lấy giỏ hàng của user
     */
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(Long accountId, String sessionId, Long branchId) {
        log.info("Getting cart for account: {}, session: {}, branch: {}", accountId, sessionId, branchId);

        CartEntity cart = getOrCreateCart(accountId, sessionId, branchId);
        return getCartResponse(cart.getId());
    }

    /**
     * Tạo giỏ hàng mới cho user
     */
    @Transactional
    public CartResponseDTO createCart(Long accountId, String sessionId, Long branchId) {
        log.info("Creating cart for account: {}, session: {}, branch: {}", accountId, sessionId, branchId);

        // Validate branch
        BranchEntity branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + branchId));

        // Check if cart already exists
        CartEntity existingCart;
        if (accountId != null) {
            existingCart = cartRepository.findActiveCartByAccountAndBranch(accountId, branchId).orElse(null);
        } else if (sessionId != null) {
            existingCart = cartRepository.findActiveCartBySessionAndBranch(sessionId, branchId).orElse(null);
        } else {
            throw new IllegalArgumentException("Either accountId or sessionId must be provided");
        }

        if (existingCart != null) {
            log.info("Cart already exists, returning existing cart: {}", existingCart.getId());
            return getCartResponse(existingCart.getId());
        }

        // Create new cart
        CartEntity cart = new CartEntity();
        cart.setBranch(branch);
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setTotalItems(0);
        cart.setIsActive(true);
        cart.setExpiresAt(LocalDateTime.now().plusHours(24)); // 24 hours expiration

        if (accountId != null) {
            AccountEntity account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
            cart.setAccount(account);
        } else {
            cart.setSessionId(sessionId);
        }

        CartEntity savedCart = cartRepository.save(cart);
        log.info("Created new cart: {}", savedCart.getId());

        return getCartResponse(savedCart.getId());
    }

    /**
     * Lấy danh sách giỏ hàng của user
     */
    @Transactional(readOnly = true)
    public List<CartSummaryDTO> getUserCarts(Long accountId, String sessionId) {
        log.info("Getting user carts for account: {}, session: {}", accountId, sessionId);

        List<CartEntity> carts;
        if (accountId != null) {
            carts = cartRepository.findByAccountIdOrderByUpdatedAtDesc(accountId);
        } else if (sessionId != null) {
            carts = cartRepository.findBySessionIdOrderByUpdatedAtDesc(sessionId);
        } else {
            throw new IllegalArgumentException("Either accountId or sessionId must be provided");
        }

        return carts.stream()
                .map(this::mapToCartSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    @Transactional
    public void clearCart(Long cartId) {
        log.info("Clearing cart: {}", cartId);

        CartEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found: " + cartId));

        cartItemRepository.deleteByCartId(cartId);
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setTotalItems(0);
        cartRepository.save(cart);
    }

    /**
     * Xóa giỏ hàng đã hết hạn
     */
    @Transactional
    public void cleanupExpiredCarts() {
        log.info("Cleaning up expired carts");

        List<CartEntity> expiredCarts = cartRepository.findExpiredCarts(LocalDateTime.now());
        for (CartEntity cart : expiredCarts) {
            cart.setIsActive(false);
            cartRepository.save(cart);
        }

        log.info("Cleaned up {} expired carts", expiredCarts.size());
    }

    // ========== PRIVATE HELPER METHODS ==========

    private CartEntity getOrCreateCart(Long accountId, String sessionId, Long branchId) {
        // Validate branch
        BranchEntity branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + branchId));

        CartEntity cart;
        
        if (accountId != null) {
            // User cart
            Optional<CartEntity> existingCart = cartRepository.findActiveCartByAccountAndBranch(accountId, branchId);
            if (existingCart.isPresent()) {
                cart = existingCart.get();
            } else {
                cart = createNewCart(accountId, null, branch);
            }
        } else if (sessionId != null) {
            // Guest cart
            Optional<CartEntity> existingCart = cartRepository.findActiveCartBySessionAndBranch(sessionId, branchId);
            if (existingCart.isPresent()) {
                cart = existingCart.get();
            } else {
                cart = createNewCart(null, sessionId, branch);
            }
        } else {
            throw new IllegalArgumentException("Either accountId or sessionId must be provided");
        }

        return cart;
    }

    private CartEntity createNewCart(Long accountId, String sessionId, BranchEntity branch) {
        CartEntity cart = new CartEntity();
        cart.setBranch(branch);
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setTotalItems(0);
        cart.setIsActive(true);
        cart.setExpiresAt(LocalDateTime.now().plusHours(24)); // 24 hours expiration

        if (accountId != null) {
            AccountEntity account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
            cart.setAccount(account);
        } else {
            cart.setSessionId(sessionId);
        }

        return cartRepository.save(cart);
    }

    private ItemDetails getItemDetails(Long itemId, String itemType) {
        if ("dish".equals(itemType)) {
            Optional<DishEntity> dish = dishRepository.findById(itemId);
            if (dish.isPresent()) {
                return new ItemDetails(dish.get().getBasePrice(), dish.get(), null);
            }
        } else if ("combo".equals(itemType)) {
            Optional<ComboEntity> combo = comboRepository.findById(itemId);
            if (combo.isPresent()) {
                return new ItemDetails(combo.get().getBasePrice(), null, combo.get());
            }
        }
        return null;
    }

    private Optional<CartItemEntity> findExistingCartItem(Long cartId, Long itemId) {
        return cartItemRepository.findByCartIdAndItemId(cartId, itemId);
    }

    private void updateCartTotals(Long cartId) {
        CartEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found: " + cartId));

        Integer totalItems = cartItemRepository.sumQuantityByCartId(cartId);
        BigDecimal totalAmount = cartItemRepository.sumFinalPriceByCartId(cartId);

        cart.setTotalItems(totalItems != null ? totalItems : 0);
        cart.setTotalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
    }

    private CartResponseDTO getCartResponse(Long cartId) {
        CartEntity cart = cartRepository.findByIdWithItems(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found: " + cartId));

        return mapToCartResponseDTO(cart);
    }

    private CartResponseDTO mapToCartResponseDTO(CartEntity cart) {
        List<CartItemResponseDTO> cartItemDTOs = cart.getCartItems().stream()
                .map(this::mapToCartItemResponseDTO)
                .collect(Collectors.toList());

        return CartResponseDTO.builder()
                .id(cart.getId())
                .accountId(cart.getAccount() != null ? cart.getAccount().getId() : null)
                .accountName(cart.getAccount() != null ? cart.getAccount().getName() : null)
                .sessionId(cart.getSessionId())
                .branchId(cart.getBranch().getId())
                .branchName(cart.getBranch().getName())
                .totalAmount(cart.getTotalAmount())
                .totalItems(cart.getTotalItems())
                .isActive(cart.getIsActive())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .expiresAt(cart.getExpiresAt())
                .cartItems(cartItemDTOs)
                .build();
    }

    private CartItemResponseDTO mapToCartItemResponseDTO(CartItemEntity cartItem) {
        return CartItemResponseDTO.builder()
                .id(cartItem.getId())
                .cartId(cartItem.getCart().getId())
                .itemId(cartItem.getItemId())
                .itemName(cartItem.getItemName())
                .itemImage(cartItem.getItemImage())
                .itemType(cartItem.getItemType())
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .totalPrice(cartItem.getTotalPrice())
                .discountAmount(cartItem.getDiscountAmount())
                .finalPrice(cartItem.getFinalPrice())
                .specialInstructions(cartItem.getSpecialInstructions())
                .createdAt(cartItem.getCreatedAt())
                .updatedAt(cartItem.getUpdatedAt())
                .build();
    }

    private CartSummaryDTO mapToCartSummaryDTO(CartEntity cart) {
        return CartSummaryDTO.builder()
                .cartId(cart.getId())
                .branchId(cart.getBranch().getId())
                .branchName(cart.getBranch().getName())
                .totalItems(cart.getTotalItems())
                .totalAmount(cart.getTotalAmount())
                .isActive(cart.getIsActive())
                .updatedAt(cart.getUpdatedAt())
                .expiresAt(cart.getExpiresAt())
                .build();
    }

    // Helper class for item details
    private static class ItemDetails {
        private final BigDecimal price;
        private final DishEntity dish;
        private final ComboEntity combo;

        public ItemDetails(BigDecimal price, DishEntity dish, ComboEntity combo) {
            this.price = price;
            this.dish = dish;
            this.combo = combo;
        }

        public BigDecimal getPrice() { return price; }
        public DishEntity getDish() { return dish; }
        public ComboEntity getCombo() { return combo; }
    }
}
