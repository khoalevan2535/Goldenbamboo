-- Migration: Thêm tính độc lập theo chi nhánh cho categories, dishes, combos
-- Thay thế created_by bằng branch_id để mỗi chi nhánh có dữ liệu riêng biệt

-- ===== CATEGORIES TABLE =====
-- Thêm cột branch_id
ALTER TABLE categories ADD COLUMN branch_id BIGINT;

-- Thêm foreign key constraint
ALTER TABLE categories ADD CONSTRAINT fk_categories_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Xóa cột created_by_id (không cần nữa)
ALTER TABLE categories DROP COLUMN created_by_id;

-- Tạo index để tối ưu performance
CREATE INDEX idx_categories_branch_id ON categories(branch_id);

-- ===== DISHES TABLE =====
-- Thêm cột branch_id
ALTER TABLE dishes ADD COLUMN branch_id BIGINT;

-- Thêm foreign key constraint
ALTER TABLE dishes ADD CONSTRAINT fk_dishes_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Xóa cột created_by_id (không cần nữa)
ALTER TABLE dishes DROP COLUMN created_by_id;

-- Tạo index để tối ưu performance
CREATE INDEX idx_dishes_branch_id ON dishes(branch_id);

-- ===== COMBOS TABLE =====
-- Thêm cột branch_id
ALTER TABLE combos ADD COLUMN branch_id BIGINT;

-- Thêm foreign key constraint
ALTER TABLE combos ADD CONSTRAINT fk_combos_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Xóa cột created_by_id (không cần nữa)
ALTER TABLE combos DROP COLUMN created_by_id;

-- Tạo index để tối ưu performance
CREATE INDEX idx_combos_branch_id ON combos(branch_id);

-- ===== NOTES =====
-- Sau khi chạy migration này:
-- 1. Categories, Dishes, Combos sẽ có branch_id thay vì created_by_id
-- 2. Mỗi chi nhánh sẽ có dữ liệu riêng biệt
-- 3. Cần cập nhật Entity classes và Services để sử dụng branch_id
-- 4. Cần cập nhật dữ liệu hiện tại (nếu có) để gán branch_id phù hợp


