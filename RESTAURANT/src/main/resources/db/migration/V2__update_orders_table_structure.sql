-- Migration để cập nhật cấu trúc bảng orders cho khớp với OrderEntity
-- Thực hiện vào: 2025-08-27

-- 1. Xóa cột prepay nếu tồn tại (vì OrderEntity không có field này)
ALTER TABLE orders DROP COLUMN IF EXISTS prepay;

-- 2. Đảm bảo các cột cần thiết tồn tại với đúng kiểu dữ liệu
-- Cột order_date (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Cột created_at (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Cột updated_at (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Cột status (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';

-- Cột payment_method (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'CASH';

-- Cột description (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS description TEXT;

-- Cột total_amount (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00;

-- Cột customer_phone (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- Cột note (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;

-- Cột discount_id (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_id BIGINT;

-- Cột account_id (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS account_id BIGINT;

-- Cột branch_id (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS branch_id BIGINT;

-- Cột table_id (nếu chưa có)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id BIGINT;

-- 3. Thêm các ràng buộc khóa ngoại nếu chưa có
-- Ràng buộc cho discount_id
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS fk_orders_discount 
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL;

-- Ràng buộc cho account_id
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS fk_orders_account 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT;

-- Ràng buộc cho branch_id
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS fk_orders_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

-- Ràng buộc cho table_id
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS fk_orders_table 
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;

-- 4. Cập nhật dữ liệu mặc định cho các bản ghi hiện có
-- Set account_id = 1 cho các order chưa có account_id
UPDATE orders SET account_id = 1 WHERE account_id IS NULL;

-- Set branch_id = 1 cho các order chưa có branch_id
UPDATE orders SET branch_id = 1 WHERE branch_id IS NULL;

-- Set status = 'PENDING' cho các order chưa có status
UPDATE orders SET status = 'PENDING' WHERE status IS NULL;

-- Set payment_method = 'CASH' cho các order chưa có payment_method
UPDATE orders SET payment_method = 'CASH' WHERE payment_method IS NULL;

-- Set total_amount = 0.00 cho các order chưa có total_amount
UPDATE orders SET total_amount = 0.00 WHERE total_amount IS NULL;

-- 5. Đảm bảo các cột NOT NULL có giá trị mặc định
ALTER TABLE orders MODIFY COLUMN account_id BIGINT NOT NULL;
ALTER TABLE orders MODIFY COLUMN branch_id BIGINT NOT NULL;
ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
ALTER TABLE orders MODIFY COLUMN order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 6. Tạo index cho các cột thường xuyên query
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_account_id ON orders(account_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);





