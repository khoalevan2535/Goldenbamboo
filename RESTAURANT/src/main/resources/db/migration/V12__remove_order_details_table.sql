-- Migration: Xóa bảng order_details dư thừa
-- Vì hệ thống đã sử dụng order_items table cho cả business logic và analytics

-- ===== BƯỚC 1: XÓA CÁC INDEX CỦA ORDER_DETAILS =====
DROP INDEX IF EXISTS idx_order_details_order_id;
DROP INDEX IF EXISTS idx_order_details_dish_id;
DROP INDEX IF EXISTS idx_order_details_combo_id;
DROP INDEX IF EXISTS idx_order_details_quantity_price;

-- ===== BƯỚC 2: XÓA BẢNG ORDER_DETAILS =====
DROP TABLE IF EXISTS order_details;

-- ===== NOTES =====
-- Sau khi chạy migration này:
-- 1. Bảng order_details đã được xóa hoàn toàn
-- 2. Hệ thống chỉ sử dụng order_items table
-- 3. Analytics queries đã được chuyển sang OrderItemRepository
-- 4. Không còn redundancy trong database
-- 5. Cải thiện performance và giảm confusion

