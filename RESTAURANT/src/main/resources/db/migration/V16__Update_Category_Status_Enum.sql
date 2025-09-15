-- Migration để cập nhật category status từ string sang enum
-- V16__Update_Category_Status_Enum.sql

-- Cập nhật tất cả category có status = 'ACTIVE' thành 'ACTIVE' (enum)
UPDATE categories 
SET status = 'ACTIVE' 
WHERE status = 'ACTIVE' OR status IS NULL;

-- Cập nhật tất cả category có status khác 'ACTIVE' thành 'INACTIVE' (enum)
UPDATE categories 
SET status = 'INACTIVE' 
WHERE status != 'ACTIVE' AND status IS NOT NULL;

-- Đảm bảo không có giá trị NULL
UPDATE categories 
SET status = 'ACTIVE' 
WHERE status IS NULL;










