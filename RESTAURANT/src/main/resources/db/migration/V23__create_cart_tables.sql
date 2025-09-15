-- Migration: Create cart and cart_items tables
-- Version: V23
-- Description: Create tables for shopping cart functionality

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT,
    branch_id BIGINT NOT NULL,
    total_amount DECIMAL(19,2) DEFAULT 0.00,
    total_items INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_carts_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_carts_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_carts_account_branch (account_id, branch_id),
    INDEX idx_carts_session_branch (session_id, branch_id),
    INDEX idx_carts_active (is_active),
    INDEX idx_carts_expires_at (expires_at),
    INDEX idx_carts_updated_at (updated_at)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    dish_id BIGINT,
    combo_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(19,2) NOT NULL,
    total_price DECIMAL(19,2) NOT NULL,
    discount_amount DECIMAL(19,2) DEFAULT 0.00,
    final_price DECIMAL(19,2) NOT NULL,
    special_instructions VARCHAR(500),
    discount_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_dish FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_combo FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_cart_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_cart_items_total_price CHECK (total_price >= 0),
    CONSTRAINT chk_cart_items_discount_amount CHECK (discount_amount >= 0),
    CONSTRAINT chk_cart_items_final_price CHECK (final_price >= 0),
    CONSTRAINT chk_cart_items_item_type CHECK (
        (dish_id IS NOT NULL AND combo_id IS NULL) OR 
        (dish_id IS NULL AND combo_id IS NOT NULL)
    ),
    
    -- Indexes for performance
    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_dish (dish_id),
    INDEX idx_cart_items_combo (combo_id),
    INDEX idx_cart_items_cart_item (cart_id, dish_id),
    INDEX idx_cart_items_cart_combo (cart_id, combo_id),
    INDEX idx_cart_items_created_at (created_at)
);

-- Add comments for documentation
ALTER TABLE carts COMMENT = 'Shopping carts for users and guest sessions';
ALTER TABLE cart_items COMMENT = 'Items in shopping carts';

-- Add column comments
ALTER TABLE carts MODIFY COLUMN account_id BIGINT COMMENT 'User account ID (null for guest users)';
ALTER TABLE carts MODIFY COLUMN branch_id BIGINT COMMENT 'Branch where cart items are available';
ALTER TABLE carts MODIFY COLUMN total_amount DECIMAL(19,2) COMMENT 'Total amount of all items in cart';
ALTER TABLE carts MODIFY COLUMN total_items INT COMMENT 'Total quantity of all items in cart';
ALTER TABLE carts MODIFY COLUMN is_active BOOLEAN COMMENT 'Whether cart is active';
ALTER TABLE carts MODIFY COLUMN session_id VARCHAR(255) COMMENT 'Session ID for guest users';
ALTER TABLE carts MODIFY COLUMN expires_at TIMESTAMP COMMENT 'When cart expires (for cleanup)';

ALTER TABLE cart_items MODIFY COLUMN cart_id BIGINT COMMENT 'Reference to cart';
ALTER TABLE cart_items MODIFY COLUMN dish_id BIGINT COMMENT 'Reference to dish (mutually exclusive with combo_id)';
ALTER TABLE cart_items MODIFY COLUMN combo_id BIGINT COMMENT 'Reference to combo (mutually exclusive with dish_id)';
ALTER TABLE cart_items MODIFY COLUMN quantity INT COMMENT 'Quantity of the item';
ALTER TABLE cart_items MODIFY COLUMN unit_price DECIMAL(19,2) COMMENT 'Price per unit';
ALTER TABLE cart_items MODIFY COLUMN total_price DECIMAL(19,2) COMMENT 'Total price (unit_price * quantity)';
ALTER TABLE cart_items MODIFY COLUMN discount_amount DECIMAL(19,2) COMMENT 'Discount amount applied';
ALTER TABLE cart_items MODIFY COLUMN final_price DECIMAL(19,2) COMMENT 'Final price after discount';
ALTER TABLE cart_items MODIFY COLUMN special_instructions VARCHAR(500) COMMENT 'Special instructions for the item';
ALTER TABLE cart_items MODIFY COLUMN discount_id BIGINT COMMENT 'Reference to applied discount';






