/**
 * Định dạng đối tượng Date hoặc chuỗi ngày tháng thành chuỗi 'DD/MM/YYYY HH:mm'.
 * @param date - Ngày cần định dạng
 * @returns - Chuỗi ngày tháng đã định dạng hoặc chuỗi rỗng nếu đầu vào không hợp lệ.
 */
export const formatDateTime = (date: Date | string | undefined | null): string => {
  if (!date) return '';
  try {
    const d = new Date(date);

    // ✅ Thêm bước kiểm tra nếu ngày tháng không hợp lệ
    if (isNaN(d.getTime())) {
      return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear(); // Biến này sẽ được dùng
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    // ✅ Sửa lại chuỗi return để bao gồm `year`
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    // Nếu có lỗi khi khởi tạo `new Date()`, trả về chuỗi rỗng
    return '';
  }
};