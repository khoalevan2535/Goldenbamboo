-- 0. Tạo database
CREATE DATABASE IF NOT EXISTS GoldenBamboo
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE GoldenBamboo;

-- 1. Bảng Branches
CREATE TABLE Branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    address NVARCHAR(200) NOT NULL,
    status TINYINT(1) NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES Branches(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Roles
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    status TINYINT(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Categories
CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    status TINYINT(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Discounts
CREATE TABLE Discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status TINYINT(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Accounts
CREATE TABLE Accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    role_id INT NOT NULL,
    name NVARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    password NVARCHAR(255) NOT NULL,
    status TINYINT(1) NOT NULL,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_accounts_branch_id (branch_id),
    INDEX idx_accounts_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Tables
CREATE TABLE Tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    number INT NOT NULL,
    status TINYINT(1) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tables_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Dishes
CREATE TABLE Dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description NVARCHAR(500),
    image NVARCHAR(200),
    status TINYINT(1) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_dishes_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Combos
CREATE TABLE Combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description NVARCHAR(500),
    image NVARCHAR(200),
    status TINYINT(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng DiscountDishes
CREATE TABLE DiscountDishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discount_id INT NOT NULL,
    dish_id INT NOT NULL,
    FOREIGN KEY (discount_id) REFERENCES Discounts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES Dishes(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng DiscountCombos
CREATE TABLE DiscountCombos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discount_id INT NOT NULL,
    combo_id INT NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (discount_id) REFERENCES Discounts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bảng Orders
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    branch_id INT NOT NULL,
    table_id INT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method NVARCHAR(50) NOT NULL,
    prepay TINYINT(1) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TINYINT(1) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (table_id) REFERENCES Tables(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_orders_account_id (account_id),
    INDEX idx_orders_branch_id (branch_id),
    INDEX idx_orders_table_id (table_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Bảng Reservations
CREATE TABLE Reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    table_id INT NOT NULL,
    set_date_and_time DATETIME NOT NULL,
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (table_id) REFERENCES Tables(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_reservations_account_id (account_id),
    INDEX idx_reservations_table_id (table_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Bảng OrderDetails
CREATE TABLE OrderDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    dish_or_combo_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    type ENUM('DISH', 'COMBO') NOT NULL,
    discount_percentage DECIMAL(5,2),
    FOREIGN KEY (order_id) REFERENCES Orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_orderdetails_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Bảng ReservationDetails
CREATE TABLE ReservationDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    dish_or_combo_id INT NOT NULL,
    quantity INT NOT NULL,
    type ENUM('DISH', 'COMBO') NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_reservationdetails_reservation_id (reservation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Bảng Menus
CREATE TABLE Menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_menus_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Bảng Menu_Dishes
CREATE TABLE Menu_Dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL,
    dish_id INT NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES Menus(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES Dishes(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Bảng Menu_Combos
CREATE TABLE Menu_Combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL,
    combo_id INT NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES Menus(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Bảng Combo_Dishes
CREATE TABLE Combo_Dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dish_id INT NOT NULL,
    combo_id INT NOT NULL,
    FOREIGN KEY (dish_id) REFERENCES Dishes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES Combos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
