-- Thêm các cột cho việc khóa tài khoản
ALTER TABLE accounts 
ADD COLUMN failed_attempts INT DEFAULT 0,
ADD COLUMN lock_time TIMESTAMP NULL,
ADD COLUMN last_failed_attempt TIMESTAMP NULL;

-- Tạo index để tối ưu hiệu suất tìm kiếm
CREATE INDEX idx_accounts_status_otp_expiry ON accounts(status, otp_expiry);
CREATE INDEX idx_accounts_lock_time ON accounts(lock_time);
