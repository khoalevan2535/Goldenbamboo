-- Cập nhật thông tin địa chỉ chi nhánh cho GHTK
-- Thay đổi thông tin này theo địa chỉ thực tế của chi nhánh

-- Cập nhật chi nhánh ID 1 (Golden Bamboo Restaurant)
UPDATE branches 
SET 
    province = '79',  -- Thành phố Cần Thơ (theo mã GHTK)
    district = '794', -- Quận Ninh Kiều (theo mã GHTK)  
    ward = '27640',   -- Phường Cái Khế (theo mã GHTK)
    latitude = 10.0452,
    longitude = 105.7469
WHERE id = 1;

-- Nếu có chi nhánh khác, thêm vào đây:
-- UPDATE branches 
-- SET 
--     province = '79',  -- Thành phố Cần Thơ
--     district = '795', -- Quận Ô Môn
--     ward = '27670',   -- Phường Châu Văn Liêm
--     latitude = 10.1000,
--     longitude = 105.6000
-- WHERE id = 2;

-- Kiểm tra kết quả
SELECT id, name, address, province, district, ward, latitude, longitude 
FROM branches 
WHERE id = 1;


