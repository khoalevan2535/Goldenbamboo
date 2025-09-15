-- Migration: Tạo bảng discounts và thêm discount_id vào dishes/combos
-- Version: V17
-- Description: Tạo hệ thống discount với quan hệ 1:1 (một discount cho một món ăn/combo)

-- 1. Tạo bảng discounts
CREATE TABLE IF NOT EXISTS discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã giảm giá (để phát triển voucher)',
    name VARCHAR(255) NOT NULL COMMENT 'Tên giảm giá',
    new_price DECIMAL(10,2) NOT NULL COMMENT 'Giá mới (99k, 199k)',
    start_date DATETIME NOT NULL COMMENT 'Ngày bắt đầu',
    end_date DATETIME NOT NULL COMMENT 'Ngày kết thúc',
    status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') DEFAULT 'ACTIVE' COMMENT 'Trạng thái',
    description TEXT COMMENT 'Mô tả giảm giá',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Thêm cột discount_id vào bảng dishes
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS discount_id BIGINT NULL COMMENT 'ID của discount áp dụng cho món ăn này';
ALTER TABLE dishes ADD CONSTRAINT IF NOT EXISTS fk_dishes_discount 
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL;

-- 3. Thêm cột discount_id vào bảng combos  
ALTER TABLE combos ADD COLUMN IF NOT EXISTS discount_id BIGINT NULL COMMENT 'ID của discount áp dụng cho combo này';
ALTER TABLE combos ADD CONSTRAINT IF NOT EXISTS fk_combos_discount 
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL;

-- 4. Tạo các index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts(status);
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_dishes_discount_id ON dishes(discount_id);
CREATE INDEX IF NOT EXISTS idx_combos_discount_id ON combos(discount_id);

-- 5. Thêm comment cho các bảng
ALTER TABLE discounts COMMENT = 'Bảng giảm giá chính với mã code để phát triển voucher';
ALTER TABLE dishes COMMENT = 'Bảng món ăn với hỗ trợ discount (1:1)';
ALTER TABLE combos COMMENT = 'Bảng combo với hỗ trợ discount (1:1)';
