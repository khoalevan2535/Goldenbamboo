-- Migration: Fix table_history foreign key constraint
-- Version: V1.4

-- Drop existing foreign key constraint if exists
ALTER TABLE table_history DROP FOREIGN KEY IF EXISTS FKdwdgnshsi1anetssfa3ejeh19;

-- Add new foreign key constraint with CASCADE DELETE
ALTER TABLE table_history 
ADD CONSTRAINT FK_table_history_table_id 
FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE;
