-- Tạo bảng delivery_addresses
CREATE TABLE IF NOT EXISTS delivery_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    full_address TEXT NOT NULL,
    short_address VARCHAR(255),
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    latitude DOUBLE,
    longitude DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_account_id (account_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_is_default (is_default),
    INDEX idx_province (province),
    INDEX idx_created_at (created_at)
);

-- Thêm comment cho bảng
ALTER TABLE delivery_addresses COMMENT = 'Bảng lưu trữ địa chỉ giao hàng của khách hàng';
