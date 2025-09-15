-- Add type field to distinguish between branch discounts and customer vouchers
ALTER TABLE discounts ADD COLUMN type ENUM('BRANCH_DISCOUNT', 'CUSTOMER_VOUCHER') NOT NULL DEFAULT 'BRANCH_DISCOUNT';

-- Update existing records based on current logic:
-- If code is NULL or empty -> BRANCH_DISCOUNT
-- If code has value -> CUSTOMER_VOUCHER
UPDATE discounts 
SET type = CASE 
    WHEN code IS NULL OR code = '' THEN 'BRANCH_DISCOUNT'
    ELSE 'CUSTOMER_VOUCHER'
END;

-- Verify the changes
SELECT type, COUNT(*) as count FROM discounts GROUP BY type;
