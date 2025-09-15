-- Migration: Thêm các field discount vào bảng dishes
-- Version: V9
-- Description: Thêm các trường giảm giá trực tiếp vào món ăn

-- Thêm các column discount vào bảng dishes
ALTER TABLE dishes 
ADD COLUMN discount_percentage DECIMAL(5,2) NULL COMMENT 'Phần trăm giảm giá (0-100)',
ADD COLUMN discount_amount DECIMAL(10,2) NULL COMMENT 'Số tiền giảm giá cố định',
ADD COLUMN discount_start_date DATETIME NULL COMMENT 'Ngày bắt đầu giảm giá',
ADD COLUMN discount_end_date DATETIME NULL COMMENT 'Ngày kết thúc giảm giá',
ADD COLUMN discount_active BOOLEAN DEFAULT FALSE COMMENT 'Trạng thái giảm giá có đang hoạt động không';

-- Thêm index để tối ưu query theo discount
CREATE INDEX idx_dishes_discount_active ON dishes(discount_active);
CREATE INDEX idx_dishes_discount_dates ON dishes(discount_start_date, discount_end_date);

-- Thêm comment cho bảng
ALTER TABLE dishes COMMENT = 'Bảng món ăn với hỗ trợ giảm giá trực tiếp';

