// Script để xóa localStorage chỉ giữ lại authToken
console.log('🧹 Bắt đầu xóa localStorage...');

// Lưu authToken trước khi xóa
const authToken = localStorage.getItem('authToken');
console.log('🔑 AuthToken hiện tại:', authToken ? 'Có' : 'Không có');

// Lấy tất cả keys trong localStorage
const allKeys = Object.keys(localStorage);
console.log('📋 Tất cả keys trong localStorage:', allKeys);

// Xóa tất cả localStorage
localStorage.clear();

// Khôi phục lại authToken nếu có
if (authToken) {
  localStorage.setItem('authToken', authToken);
  console.log('✅ Đã khôi phục authToken');
}

// Kiểm tra kết quả
const remainingKeys = Object.keys(localStorage);
console.log('🎯 Keys còn lại sau khi xóa:', remainingKeys);
console.log('✅ Hoàn thành! Chỉ còn lại authToken trong localStorage');
