USE GoldenBamboo;

-- 1. Insert Branches
INSERT INTO Branches (name, description, address, status) 
VALUES ('Golden Bamboo HQ', 'Trụ sở chính', '123 Đường Lê Lợi, TP.HCM', 1);

-- 2. Insert Roles
INSERT INTO Roles (name, status) 
VALUES ('ROLE_ADMIN', 1),
       ('ROLE_STAFF', 1);

-- 3. Insert Accounts (password đã được encode bằng BCrypt)
INSERT INTO Accounts (branch_id, role_id, name, phone, password, status) 
VALUES (1, 1, 'Admin User', '0327564891', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 1),
       (1, 2, 'Staff User', '0909876543', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 1);

-- 4. Insert Categories
INSERT INTO Categories (name, status) 
VALUES ('Đồ ăn', 1),
       ('Thức uống', 1);

-- 5. Insert Dishes
INSERT INTO Dishes (category_id, name, price, description, status) 
VALUES (1, 'Cơm chiên Dương Châu', 45000, 'Cơm chiên thơm ngon', 1),
       (2, 'Trà đào cam sả', 35000, 'Trà đào tươi mát', 1);

-- 6. Insert Combos
INSERT INTO Combos (name, price, description, status) 
VALUES ('Combo 1 người', 75000, 'Cơm + nước', 1);

-- 7. Insert Combo_Dishes
INSERT INTO Combo_Dishes (dish_id, combo_id)
VALUES (1, 1),
       (2, 1);

-- 8. Insert Menus
INSERT INTO Menus (branch_id, name)
VALUES (1, 'Menuroles Chính');

-- 9. Insert Menu_Dishes
INSERT INTO Menu_Dishes (menu_id, dish_id)
VALUES (1, 1),
       (1, 2);

-- 10. Insert Menu_Combos
INSERT INTO Menu_Combos (menu_id, combo_id)
VALUES (1, 1);

-- 11. Insert Tables
INSERT INTO Tables (branch_id, number, status)
VALUES (1, 1, 1),
       (1, 2, 1),
       (1, 3, 1);

-- 12. Insert Orders
INSERT INTO Orders (account_id, branch_id, table_id, payment_method, prepay, total_amount, status)
VALUES (2, 1, 1, 'Tiền mặt', 0, 80000, 1);

-- 13. Insert OrderDetails
INSERT INTO OrderDetails (order_id, dish_or_combo_id, price, quantity, type)
VALUES (1, 1, 45000, 1, 'DISH'),
       (1, 2, 35000, 1, 'DISH');

-- 14. Insert Reservations
INSERT INTO Reservations (account_id, table_id, set_date_and_time)
VALUES (2, 2, '2025-05-01 18:00:00');

-- 15. Insert ReservationDetails
INSERT INTO ReservationDetails (reservation_id, dish_or_combo_id, quantity, type)
VALUES (1, 1, 2, 'DISH'),
       (1, 1, 1, 'COMBO');
