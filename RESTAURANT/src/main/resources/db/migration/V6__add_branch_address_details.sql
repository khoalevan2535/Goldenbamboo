-- Thêm các cột địa chỉ chi tiết cho bảng branches
ALTER TABLE branches 
ADD COLUMN province VARCHAR(100),
ADD COLUMN district VARCHAR(100),
ADD COLUMN ward VARCHAR(100);

-- Cập nhật dữ liệu mẫu cho branch ID 1
UPDATE branches 
SET 
    province = 'Vĩnh Long',
    district = 'Long Hồ',
    ward = 'Nguyệt Hóa'
WHERE id = 1;
