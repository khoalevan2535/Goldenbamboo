-- Migration: Xóa các column operational_status khỏi database
-- Version: V16
-- Description: Xóa operational_status vì đã không còn sử dụng

-- Xóa column operational_status khỏi bảng categories
ALTER TABLE categories DROP COLUMN IF EXISTS operational_status;

-- Xóa column operational_status khỏi bảng dishes  
ALTER TABLE dishes DROP COLUMN IF EXISTS operational_status;

-- Xóa column operational_status khỏi bảng combos
ALTER TABLE combos DROP COLUMN IF EXISTS operational_status;

-- Xóa column operational_status khỏi bảng menus (nếu có)
ALTER TABLE menus DROP COLUMN IF EXISTS operational_status;

-- Xóa column operational_status khỏi bảng menu_dishes (nếu có)
ALTER TABLE menu_dishes DROP COLUMN IF EXISTS operational_status;

-- Xóa column operational_status khỏi bảng menu_combos (nếu có)
ALTER TABLE menu_combos DROP COLUMN IF EXISTS operational_status;












