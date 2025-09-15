-- Update Menu tables to match Java entity structures
USE datn;

-- ===== UPDATE COMBOS TABLE =====
-- Add missing columns to combos table
ALTER TABLE combos 
ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS created_by_id BIGINT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have proper status values
UPDATE combos SET status = 'APPROVED' WHERE status IS NULL OR status = 0;
UPDATE combos SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;

-- ===== UPDATE DISHES TABLE =====
-- Add missing columns to dishes table if they don't exist
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS created_by_id BIGINT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have proper status values
UPDATE dishes SET status = 'APPROVED' WHERE status IS NULL OR status = 0;
UPDATE dishes SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;

-- ===== UPDATE CATEGORIES TABLE =====
-- Add missing columns to categories table if they don't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS created_by_id BIGINT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have proper status values
UPDATE categories SET status = 'APPROVED' WHERE status IS NULL OR status = 0;
UPDATE categories SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;

-- ===== UPDATE BRANCHES TABLE =====
-- Add missing columns to branches table if they don't exist
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS created_by_id BIGINT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have proper status values
UPDATE branches SET status = 'OPEN' WHERE status IS NULL OR status = 0;
UPDATE branches SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;

-- ===== ADD INDEXES FOR BETTER PERFORMANCE =====
-- Indexes for combos table
CREATE INDEX IF NOT EXISTS idx_combos_status ON combos(status);
CREATE INDEX IF NOT EXISTS idx_combos_operational_status ON combos(operational_status);
CREATE INDEX IF NOT EXISTS idx_combos_created_at ON combos(created_at);

-- Indexes for dishes table
CREATE INDEX IF NOT EXISTS idx_dishes_status ON dishes(status);
CREATE INDEX IF NOT EXISTS idx_dishes_operational_status ON dishes(operational_status);
CREATE INDEX IF NOT EXISTS idx_dishes_created_at ON dishes(created_at);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);

-- Indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_operational_status ON categories(operational_status);

-- Indexes for branches table
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);
CREATE INDEX IF NOT EXISTS idx_branches_operational_status ON branches(operational_status);

-- ===== INSERT SAMPLE DATA IF TABLES ARE EMPTY =====

-- Insert sample categories if table is empty
INSERT INTO categories (name, description, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Món chính', 'Các món ăn chính', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Món chính') LIMIT 1;

INSERT INTO categories (name, description, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Món canh', 'Các món canh', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Món canh') LIMIT 1;

INSERT INTO categories (name, description, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Tráng miệng', 'Các món tráng miệng', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tráng miệng') LIMIT 1;

-- Insert sample dishes if table is empty
INSERT INTO dishes (category_id, name, price, description, image, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 1, 'Cơm gà nướng', 35000.00, 'Cơm gà nướng thơm ngon', '/images/com-ga.jpg', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Cơm gà nướng') LIMIT 1;

INSERT INTO dishes (category_id, name, price, description, image, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 1, 'Phở bò', 45000.00, 'Phở bò truyền thống', '/images/pho-bo.jpg', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM dishes WHERE name = 'Phở bò') LIMIT 1;

-- Insert sample combos if table is empty
INSERT INTO combos (name, price, description, image, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Combo Cơm Gà', 45000.00, 'Cơm gà nướng + canh + rau', '/images/combo-ga.jpg', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM combos WHERE name = 'Combo Cơm Gà') LIMIT 1;

INSERT INTO combos (name, price, description, image, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Combo Phở Bò', 55000.00, 'Phở bò + trứng + rau', '/images/combo-pho.jpg', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM combos WHERE name = 'Combo Phở Bò') LIMIT 1;

-- Insert sample branch if table is empty
INSERT INTO branches (name, description, address, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Chi nhánh 1', 'Chi nhánh chính', '123 Lê Lợi, Q1, TP.HCM', 'OPEN', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Chi nhánh 1') LIMIT 1;

-- ===== VERIFY DATA =====
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Dishes' as table_name, COUNT(*) as count FROM dishes
UNION ALL
SELECT 'Combos' as table_name, COUNT(*) as count FROM combos
UNION ALL
SELECT 'Branches' as table_name, COUNT(*) as count FROM branches;
