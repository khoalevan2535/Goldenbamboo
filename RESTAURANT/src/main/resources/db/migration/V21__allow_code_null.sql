-- Fix code column to allow NULL for branch discounts
-- Branch discounts don't need codes, only customer vouchers need codes

ALTER TABLE discounts MODIFY COLUMN code VARCHAR(255) NULL;
