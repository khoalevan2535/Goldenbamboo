-- Migration để cập nhật cột status trong bảng accounts
-- Thêm giá trị TEMPORARILY_LOCKED vào enum

-- Kiểm tra và cập nhật cột status để hỗ trợ giá trị mới
ALTER TABLE accounts MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'INACTIVE';

-- Cập nhật comment cho cột status
ALTER TABLE accounts MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'INACTIVE' COMMENT 'ACTIVE: Đang hoạt động, INACTIVE: Chưa xác thực, LOCKED: Khóa vĩnh viễn';
