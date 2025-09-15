-- Add order_type column to orders table
ALTER TABLE orders ADD COLUMN order_type VARCHAR(20) DEFAULT 'COUNTER';

-- Update existing orders to have COUNTER type (staff orders)
UPDATE orders SET order_type = 'COUNTER' WHERE order_type IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN orders.order_type IS 'Order type: ONLINE for client orders, COUNTER for staff orders';
