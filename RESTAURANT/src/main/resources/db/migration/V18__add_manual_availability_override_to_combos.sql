-- Migration: Thêm field manual_availability_override vào bảng combos
-- Version: V18
-- Description: Cho phép combo có trạng thái thủ công, không bị ghi đè bởi trạng thái món ăn

-- Thêm cột manual_availability_override vào bảng combos
ALTER TABLE combos ADD COLUMN IF NOT EXISTS manual_availability_override BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu combo có bị set thủ công hay không';

-- Tạo index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_combos_manual_override ON combos(manual_availability_override);

-- Thêm comment cho cột
ALTER TABLE combos MODIFY COLUMN manual_availability_override BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu combo có bị set thủ công hay không (true = thủ công, false = tự động)';









