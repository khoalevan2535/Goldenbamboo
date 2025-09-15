-- Migration: Xóa toàn bộ hệ thống menu không cần thiết
-- Vì món ăn và combo đã có branch_id, không cần menu riêng biệt

-- ===== BƯỚC 1: CẬP NHẬT CÁC BẢNG LIÊN QUAN =====
-- Thay đổi từ menu_combo_id sang combo_id
ALTER TABLE discount_combos DROP FOREIGN KEY IF EXISTS fk_discount_combos_menu_combo;
ALTER TABLE discount_combos CHANGE COLUMN menu_combo_id combo_id BIGINT;
ALTER TABLE discount_combos ADD CONSTRAINT fk_discount_combos_combo 
    FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE;

-- Thay đổi từ menu_dish_id sang dish_id
ALTER TABLE discount_dishes DROP FOREIGN KEY IF EXISTS fk_discount_dishes_menu_dish;
ALTER TABLE discount_dishes CHANGE COLUMN menu_dish_id dish_id BIGINT;
ALTER TABLE discount_dishes ADD CONSTRAINT fk_discount_dishes_dish 
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

-- Thay đổi từ menu_dish_id sang dish_id trong order_items
ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS fk_order_items_menu_dish;
ALTER TABLE order_items CHANGE COLUMN menu_dish_id dish_id BIGINT;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_dish 
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

-- ===== BƯỚC 2: XÓA CÁC BẢNG MENU =====
DROP TABLE IF EXISTS menu_combos;
DROP TABLE IF EXISTS menu_dishes;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS branch_menus;

-- ===== BƯỚC 2: XÓA CÁC TRIGGER LIÊN QUAN (nếu có) =====
DROP TRIGGER IF EXISTS tr_menus_single_default;
DROP TRIGGER IF EXISTS tr_menus_single_default_update;
DROP TRIGGER IF EXISTS tr_branch_menus_single_default;
DROP TRIGGER IF EXISTS tr_branch_menus_single_default_update;

-- ===== NOTES =====
-- Sau khi chạy migration này:
-- 1. Tất cả bảng menu đã được xóa
-- 2. Hệ thống sử dụng trực tiếp món ăn/combo theo chi nhánh
-- 3. API mới: /api/dishes/branch/{branchId} và /api/combos/branch/{branchId}
-- 4. Đơn giản hơn, hiệu quả hơn
