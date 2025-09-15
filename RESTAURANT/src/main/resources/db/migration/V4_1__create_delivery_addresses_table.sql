-- Migration to create delivery_addresses table
CREATE TABLE delivery_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address VARCHAR(500) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    notes VARCHAR(1000) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    account_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    
    CONSTRAINT fk_delivery_addresses_account 
        FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_delivery_addresses_branch 
        FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Add indexes for better performance
CREATE INDEX idx_delivery_addresses_account_id ON delivery_addresses(account_id);
CREATE INDEX idx_delivery_addresses_branch_id ON delivery_addresses(branch_id);
CREATE INDEX idx_delivery_addresses_is_active ON delivery_addresses(is_active);
CREATE INDEX idx_delivery_addresses_is_default ON delivery_addresses(is_default);
CREATE INDEX idx_delivery_addresses_phone ON delivery_addresses(phone_number);
