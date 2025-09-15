-- Update Combos table to match Java ComboEntity structure
USE datn;

-- Add missing columns to combos table
ALTER TABLE combos 
ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS created_by_id BIGINT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have proper status values
UPDATE combos SET status = 'APPROVED' WHERE status IS NULL OR status = 0;
UPDATE combos SET operational_status = 'ACTIVE' WHERE operational_status IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_combos_status ON combos(status);
CREATE INDEX IF NOT EXISTS idx_combos_operational_status ON combos(operational_status);
CREATE INDEX IF NOT EXISTS idx_combos_created_at ON combos(created_at);

-- Insert some sample combo data if table is empty
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

INSERT INTO combos (name, price, description, image, status, operational_status, created_at, updated_at) 
SELECT * FROM (
    SELECT 'Combo Bún Chả', 40000.00, 'Bún chả + rau sống + nước mắm', '/images/combo-buncha.jpg', 'APPROVED', 'ACTIVE', NOW(), NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM combos WHERE name = 'Combo Bún Chả') LIMIT 1;
