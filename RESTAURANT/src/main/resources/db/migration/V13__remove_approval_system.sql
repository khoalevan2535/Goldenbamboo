-- Migration: Bỏ hệ thống phê duyệt, chỉ giữ lại operational_status
-- Vì hệ thống không cần approval nữa

-- ===== BƯỚC 1: XÓA CỘT STATUS (APPROVAL) KHỎI CÁC BẢNG =====

-- Xóa cột status khỏi bảng dishes
ALTER TABLE dishes DROP COLUMN IF EXISTS status;

-- Xóa cột status khỏi bảng combos  
ALTER TABLE combos DROP COLUMN IF EXISTS status;

-- Xóa cột status khỏi bảng categories
ALTER TABLE categories DROP COLUMN IF EXISTS status;

-- ===== BƯỚC 2: SỬA LỖI KHÓA NGOẠI - THÊM CASCADE DELETE =====

-- Sửa foreign key cho dishes -> branch (thêm CASCADE DELETE)
ALTER TABLE dishes DROP FOREIGN KEY IF EXISTS fk_dishes_branch;
ALTER TABLE dishes ADD CONSTRAINT fk_dishes_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;

-- Sửa foreign key cho combos -> branch (thêm CASCADE DELETE)
ALTER TABLE combos DROP FOREIGN KEY IF EXISTS fk_combos_branch;
ALTER TABLE combos ADD CONSTRAINT fk_combos_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;

-- Sửa foreign key cho categories -> branch (thêm CASCADE DELETE)
ALTER TABLE categories DROP FOREIGN KEY IF EXISTS fk_categories_branch;
ALTER TABLE categories ADD CONSTRAINT fk_categories_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;

-- ===== BƯỚC 3: XÓA CÁC BẢNG APPROVAL KHÔNG CẦN THIẾT =====

-- Xóa bảng approval_tasks (nếu tồn tại)
DROP TABLE IF EXISTS approval_tasks;

-- Xóa bảng approval_rules (nếu tồn tại)
DROP TABLE IF EXISTS approval_rules;

-- ===== BƯỚC 4: CẬP NHẬT DỮ LIỆU MẪU =====

-- Đảm bảo tất cả dishes, combos, categories đều có operational_status = 'ACTIVE'
UPDATE dishes SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;
UPDATE combos SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;
UPDATE categories SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;

-- ===== NOTES =====
-- Sau khi chạy migration này:
-- 1. Cột 'status' (approval) đã được xóa khỏi dishes, combos, categories
-- 2. Chỉ còn lại cột 'operational_status' để quản lý trạng thái hoạt động
-- 3. Foreign key constraints đã được sửa để hỗ trợ CASCADE DELETE
-- 4. Có thể xóa dishes/combos/categories mà không bị lỗi khóa ngoại
-- 5. Hệ thống approval đã được loại bỏ hoàn toàn

