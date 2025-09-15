-- Migration: Cập nhật dữ liệu hiện tại để gán branch_id
-- Gán tất cả categories, dishes, combos hiện tại cho branch đầu tiên (ID = 1)

-- ===== UPDATE CATEGORIES =====
-- Gán tất cả categories hiện tại cho branch ID = 1
UPDATE categories 
SET branch_id = 1 
WHERE branch_id IS NULL;

-- ===== UPDATE DISHES =====
-- Gán tất cả dishes hiện tại cho branch ID = 1
UPDATE dishes 
SET branch_id = 1 
WHERE branch_id IS NULL;

-- ===== UPDATE COMBOS =====
-- Gán tất cả combos hiện tại cho branch ID = 1
UPDATE combos 
SET branch_id = 1 
WHERE branch_id IS NULL;

-- ===== NOTES =====
-- Sau khi chạy migration này:
-- 1. Tất cả dữ liệu hiện tại sẽ được gán cho branch ID = 1
-- 2. Nếu có nhiều branch, cần cập nhật thủ công để phân bổ dữ liệu phù hợp
-- 3. Có thể tạo thêm script để phân bổ dữ liệu theo logic nghiệp vụ cụ thể


