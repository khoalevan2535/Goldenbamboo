-- Migration: Thêm trạng thái khả dụng cho món ăn và combo
-- AVAILABLE: Còn hàng - hiển thị và có thể order
-- OUT_OF_STOCK: Hết hàng - hiển thị nhưng không thể order (disabled)
-- DISCONTINUED: Ngừng bán - không hiển thị ở chi nhánh

-- ===== BƯỚC 1: THÊM CỘT AVAILABILITY_STATUS =====

-- Thêm cột availability_status vào bảng dishes
ALTER TABLE dishes ADD COLUMN availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE';

-- Thêm cột availability_status vào bảng combos
ALTER TABLE combos ADD COLUMN availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE';

-- ===== BƯỚC 2: THÊM INDEXES =====

-- Index cho dishes availability_status
CREATE INDEX IF NOT EXISTS idx_dishes_availability_status ON dishes(availability_status);

-- Index cho combos availability_status
CREATE INDEX IF NOT EXISTS idx_combos_availability_status ON combos(availability_status);

-- Composite indexes cho performance
CREATE INDEX IF NOT EXISTS idx_dishes_operational_availability ON dishes(operational_status, availability_status);
CREATE INDEX IF NOT EXISTS idx_combos_operational_availability ON combos(operational_status, availability_status);

-- ===== BƯỚC 3: CẬP NHẬT DỮ LIỆU MẪU =====

-- Đảm bảo tất cả dishes và combos đều có availability_status = 'AVAILABLE'
UPDATE dishes SET availability_status = 'AVAILABLE' WHERE availability_status IS NULL;
UPDATE combos SET availability_status = 'AVAILABLE' WHERE availability_status IS NULL;

-- ===== NOTES =====
-- Sau khi chạy migration này:
-- 1. Tất cả dishes và combos sẽ có availability_status = 'AVAILABLE' (còn hàng)
-- 2. Staff có thể thay đổi trạng thái: AVAILABLE, OUT_OF_STOCK, DISCONTINUED
-- 3. Frontend sẽ filter theo availability_status để hiển thị và cho phép order
-- 4. Performance được cải thiện với các indexes mới

