-- Migration: Add account lock fields
-- Version: V1.5

-- Thêm các trường cho việc khóa tài khoản
ALTER TABLE accounts 
ADD COLUMN failed_attempts INT DEFAULT 0,
ADD COLUMN lock_time TIMESTAMP NULL,
ADD COLUMN last_failed_attempt TIMESTAMP NULL;

-- Tạo index để tối ưu hiệu suất truy vấn
CREATE INDEX idx_accounts_failed_attempts ON accounts(failed_attempts);
CREATE INDEX idx_accounts_lock_time ON accounts(lock_time);
CREATE INDEX idx_accounts_last_failed_attempt ON accounts(last_failed_attempt);
