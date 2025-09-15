-- Migration to add delivery address support to orders table
-- Add delivery address foreign key
ALTER TABLE orders ADD COLUMN delivery_address_id BIGINT NULL;
ALTER TABLE orders ADD CONSTRAINT fk_orders_delivery_address 
    FOREIGN KEY (delivery_address_id) REFERENCES delivery_addresses(id);

-- Add shipping information columns
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(50) NULL;
ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN delivery_type VARCHAR(20) NULL;

-- Add index for better performance
CREATE INDEX idx_orders_delivery_address_id ON orders(delivery_address_id);
CREATE INDEX idx_orders_delivery_type ON orders(delivery_type);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
