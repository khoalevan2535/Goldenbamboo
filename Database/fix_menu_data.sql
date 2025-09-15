-- Fix Menu Data for Client Menu Display
USE GoldenBamboo;

-- ===== CHECK CURRENT DATA =====
SELECT 'Current Data Status:' as info;
SELECT 'Categories' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM categories
UNION ALL
SELECT 'Dishes' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM dishes
UNION ALL
SELECT 'Combos' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM combos
UNION ALL
SELECT 'Branches' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM branches;

-- ===== FIX STATUS VALUES =====

-- Update categories status to APPROVED
UPDATE categories SET status = 'APPROVED' WHERE status = 1 OR status = '1';
UPDATE categories SET status = 'APPROVED' WHERE status IS NULL;

-- Update dishes status to APPROVED
UPDATE dishes SET status = 'APPROVED' WHERE status = 1 OR status = '1';
UPDATE dishes SET status = 'APPROVED' WHERE status IS NULL;

-- Update combos status to APPROVED
UPDATE combos SET status = 'APPROVED' WHERE status = 1 OR status = '1';
UPDATE combos SET status = 'APPROVED' WHERE status IS NULL;

-- Update branches status to OPEN
UPDATE branches SET status = 'OPEN' WHERE status = 1 OR status = '1';
UPDATE branches SET status = 'OPEN' WHERE status IS NULL;

-- ===== ADD MISSING COLUMNS IF THEY DON'T EXIST =====

-- Add base_price column to dishes if it doesn't exist
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00;

-- Update dishes to use base_price instead of price
UPDATE dishes SET base_price = price WHERE base_price = 0.00 OR base_price IS NULL;

-- Add base_price column to combos if it doesn't exist
ALTER TABLE combos 
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00;

-- Update combos to use base_price instead of price
UPDATE combos SET base_price = price WHERE base_price = 0.00 OR base_price IS NULL;

-- ===== INSERT SAMPLE DATA IF TABLES ARE EMPTY =====

-- Insert sample categories if table is empty
INSERT INTO categories (name, description, status) 
SELECT * FROM (
    SELECT 'Món chính', 'Các món ăn chính', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Món chính') LIMIT 1;

INSERT INTO categories (name, description, status) 
SELECT * FROM (
    SELECT 'Món canh', 'Các món canh', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Món canh') LIMIT 1;

INSERT INTO categories (name, description, status) 
SELECT * FROM (
    SELECT 'Tráng miệng', 'Các món tráng miệng', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tráng miệng') LIMIT 1;

INSERT INTO categories (name, description, status) 
SELECT * FROM (
    SELECT 'Combo', 'Các combo tiết kiệm', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Combo') LIMIT 1;

-- Insert sample dishes if table is empty
INSERT INTO dishes (category_id, name, base_price, description, status) 
SELECT * FROM (
    SELECT 1, 'Cơm gà nướng', 35000.00, 'Cơm gà nướng thơm ngon', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Cơm gà nướng') LIMIT 1;

INSERT INTO dishes (category_id, name, base_price, description, status) 
SELECT * FROM (
    SELECT 1, 'Phở bò', 45000.00, 'Phở bò truyền thống', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Phở bò') LIMIT 1;

INSERT INTO dishes (category_id, name, base_price, description, status) 
SELECT * FROM (
    SELECT 2, 'Canh chua cá lóc', 25000.00, 'Canh chua đậm đà', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Canh chua cá lóc') LIMIT 1;

INSERT INTO dishes (category_id, name, base_price, description, status) 
SELECT * FROM (
    SELECT 3, 'Chè hạt sen long nhãn', 20000.00, 'Chè ngọt thanh', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Chè hạt sen long nhãn') LIMIT 1;

-- Insert sample combos if table is empty
INSERT INTO combos (name, base_price, description, status) 
SELECT * FROM (
    SELECT 'Combo Trưa 1', 82000.00, 'Phở + Gỏi cuốn + Trà đào', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM combos WHERE name = 'Combo Trưa 1') LIMIT 1;

INSERT INTO combos (name, base_price, description, status) 
SELECT * FROM (
    SELECT 'Combo Tối 1', 97000.00, 'Bún bò Huế + Nem rán + Chè Thái', 'APPROVED'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM combos WHERE name = 'Combo Tối 1') LIMIT 1;

-- Insert sample branch if table is empty
INSERT INTO branches (name, description, address, status) 
SELECT * FROM (
    SELECT 'Chi nhánh 1', 'Chi nhánh chính', '123 Lê Lợi, Q1, TP.HCM', 'OPEN'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Chi nhánh 1') LIMIT 1;

-- ===== VERIFY FIXED DATA =====
SELECT 'Fixed Data Status:' as info;
SELECT 'Categories' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM categories
UNION ALL
SELECT 'Dishes' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM dishes
UNION ALL
SELECT 'Combos' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM combos
UNION ALL
SELECT 'Branches' as table_name, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT status) as statuses FROM branches;

-- ===== SHOW SAMPLE DATA =====
SELECT 'Sample Dishes:' as info;
SELECT id, name, base_price, status FROM dishes LIMIT 5;

SELECT 'Sample Combos:' as info;
SELECT id, name, base_price, status FROM combos LIMIT 5;

SELECT 'Sample Categories:' as info;
SELECT id, name, status FROM categories LIMIT 5;
