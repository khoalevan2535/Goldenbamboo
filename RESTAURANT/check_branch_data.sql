-- Kiểm tra dữ liệu món ăn theo chi nhánh
SELECT 
    d.id,
    d.name,
    d.branch_id,
    d.status,
    b.name as branch_name
FROM dishes d
LEFT JOIN branches b ON d.branch_id = b.id
WHERE d.status = 'ACTIVE'
ORDER BY d.branch_id, d.name;

-- Kiểm tra combo theo chi nhánh
SELECT 
    c.id,
    c.name,
    c.branch_id,
    c.status,
    b.name as branch_name
FROM combos c
LEFT JOIN branches b ON c.branch_id = b.id
WHERE c.status = 'ACTIVE'
ORDER BY c.branch_id, c.name;

-- Đếm số lượng món ăn theo chi nhánh
SELECT 
    b.id as branch_id,
    b.name as branch_name,
    COUNT(d.id) as dish_count
FROM branches b
LEFT JOIN dishes d ON b.id = d.branch_id AND d.status = 'ACTIVE'
GROUP BY b.id, b.name
ORDER BY b.id;
