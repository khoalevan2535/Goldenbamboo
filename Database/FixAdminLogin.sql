USE GoldenBamboo;

-- Xóa dữ liệu cũ
DELETE FROM OrderDetails;
DELETE FROM Orders;
DELETE FROM ReservationDetails;
DELETE FROM Reservations;
DELETE FROM Accounts;
DELETE FROM Roles;

-- Tạo lại roles
INSERT INTO Roles (name, status) 
VALUES ('ROLE_ADMIN', 1),
       ('ROLE_STAFF', 1);

-- Tạo lại accounts với password đã encode
INSERT INTO Accounts (branch_id, role_id, name, phone, password, status) 
VALUES (1, 1, 'Admin User', '0327564891', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 1),
       (1, 2, 'Staff User', '0909876543', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 1);

-- Kiểm tra dữ liệu
SELECT 
    a.id,
    a.name,
    a.phone,
    a.status,
    r.name as role_name
FROM Accounts a
JOIN Roles r ON a.role_id = r.id;

