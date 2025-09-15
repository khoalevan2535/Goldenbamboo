import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown): string {
  console.log('=== DEBUG ERROR ===');
  console.log('Error type:', typeof error);
  console.log('Error object:', error);
  
  if (isAxiosError(error)) {
    console.log('Is AxiosError');
    console.log('Response status:', error.response?.status);
    console.log('Response data:', error.response?.data);
    console.log('Error message:', error.message);
    
    // Xử lý các status code cụ thể
    if (error.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    if (error.response?.status === 403) {
      return 'Bạn không có quyền thực hiện hành động này.';
    }
    
    if (error.response?.status === 404) {
      return 'Không tìm thấy tài nguyên được yêu cầu.';
    }
    
    if (error.response?.status === 500) {
      return 'Lỗi hệ thống! Vui lòng thử lại sau.';
    }
    
    // Xử lý response data
    if (error.response?.data) {
      const data = error.response.data;
      
      // Nếu data là string
      if (typeof data === 'string') {
        return data;
      }
      
      // Nếu data là object có message
      if (typeof data === 'object' && data !== null) {
        if (data.message) {
          return String(data.message);
        }
        if (data.error) {
          return String(data.error);
        }
        if (data.detail) {
          return String(data.detail);
        }
      }
    }
    
    // Xử lý network errors
    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Yêu cầu bị timeout. Vui lòng thử lại.';
    }
    
    // Sử dụng error message nếu có
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    console.log('Is Error instance');
    return error.message;
  }
  
  // Fallback message
  console.log('Using fallback message');
  return 'Đã có lỗi không mong muốn xảy ra, vui lòng thử lại sau.';
} 