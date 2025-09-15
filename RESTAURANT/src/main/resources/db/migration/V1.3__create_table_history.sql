-- Migration: Create table_history table
-- Version: V1.3

CREATE TABLE IF NOT EXISTS table_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id BIGINT,
    order_id BIGINT,
    reservation_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_table_history_table_id (table_id),
    INDEX idx_table_history_action (action),
    INDEX idx_table_history_created_at (created_at),
    INDEX idx_table_history_user_id (user_id),
    INDEX idx_table_history_order_id (order_id),
    INDEX idx_table_history_reservation_id (reservation_id)
);

-- Add comment
ALTER TABLE table_history COMMENT = 'Lịch sử hoạt động của bàn ăn';
