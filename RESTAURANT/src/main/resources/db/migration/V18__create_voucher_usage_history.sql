-- Migration: Tạo bảng lịch sử sử dụng voucher
-- Version: V18
-- Description: Lưu lịch sử sử dụng voucher của khách hàng

-- 1. Tạo bảng voucher_usage_history
CREATE TABLE IF NOT EXISTS voucher_usage_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_id BIGINT NOT NULL COMMENT 'ID của voucher được sử dụng',
    order_id BIGINT NOT NULL COMMENT 'ID của đơn hàng sử dụng voucher',
    customer_phone VARCHAR(20) COMMENT 'Số điện thoại khách hàng',
    customer_name VARCHAR(255) COMMENT 'Tên khách hàng',
    voucher_code VARCHAR(50) NOT NULL COMMENT 'Mã voucher được sử dụng',
    original_amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền gốc trước khi áp dụng voucher',
    discount_amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền được giảm',
    final_amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền cuối cùng sau khi áp dụng voucher',
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian sử dụng voucher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_voucher_usage_voucher FOREIGN KEY (voucher_id) REFERENCES discounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_usage_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 2. Tạo các index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage_history(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_order_id ON voucher_usage_history(order_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_customer_phone ON voucher_usage_history(customer_phone);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_code ON voucher_usage_history(voucher_code);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_used_at ON voucher_usage_history(used_at);

-- 3. Thêm comment cho bảng
ALTER TABLE voucher_usage_history COMMENT = 'Lịch sử sử dụng voucher của khách hàng';

-- 4. Thêm cột voucher_code vào bảng orders để lưu mã voucher được sử dụng
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50) NULL COMMENT 'Mã voucher được sử dụng trong đơn hàng này';
CREATE INDEX IF NOT EXISTS idx_orders_voucher_code ON orders(voucher_code);
