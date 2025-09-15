-- Migration: Cập nhật enum status cho bảng discounts
-- Version: V20
-- Description: Thêm các trạng thái mới SCHEDULED, EXPIRING, REPLACED vào enum status

-- 1. Cập nhật enum status để bao gồm tất cả các trạng thái mới
ALTER TABLE discounts 
MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'SCHEDULED', 'EXPIRING', 'REPLACED') 
DEFAULT 'ACTIVE' 
COMMENT 'Trạng thái discount: ACTIVE(đang hoạt động), INACTIVE(tạm dừng), EXPIRED(đã hết hạn), SCHEDULED(sắp bắt đầu), EXPIRING(sắp hết hạn), REPLACED(đã thay thế)';

-- 2. Cập nhật comment cho bảng để phản ánh các trạng thái mới
ALTER TABLE discounts COMMENT = 'Bảng giảm giá với đầy đủ trạng thái: ACTIVE, SCHEDULED, EXPIRING, EXPIRED, REPLACED';

-- 3. Thêm index mới cho các trạng thái mới (nếu cần)
-- CREATE INDEX IF NOT EXISTS idx_discounts_status_new ON discounts(status, start_date, end_date);
