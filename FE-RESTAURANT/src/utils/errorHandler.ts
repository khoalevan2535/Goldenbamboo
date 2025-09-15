// Error handling utility để xử lý response từ backend
import { toast } from 'react-toastify';

export interface ApiError {
  status?: number;
  message?: string;
  errors?: string[] | { [key: string]: string[] };
  timestamp?: string;
  path?: string;
}

export class ErrorHandler {
  
  // Xử lý lỗi validation từ backend
  static handleValidationError(error: ApiError) {
    if (error.errors) {
      if (Array.isArray(error.errors)) {
        // Nếu errors là array
        error.errors.forEach(err => toast.error(err));
      } else {
        // Nếu errors là object với field-specific errors
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => toast.error(`${field}: ${msg}`));
          } else {
            toast.error(`${field}: ${messages}`);
          }
        });
      }
    } else {
      toast.error(error.message || 'Dữ liệu không hợp lệ');
    }
  }

  // Xử lý lỗi theo status code
  static handleError(error: any) {
    const apiError: ApiError = error.response?.data || error;
    
    switch (apiError.status || error.response?.status) {
      case 400:
        this.handleValidationError(apiError);
        break;
        
      case 401:
        toast.error('Bạn cần đăng nhập để thực hiện hành động này');
        break;
        
      case 403:
        toast.error('Bạn không có quyền thực hiện hành động này');
        break;
        
      case 404:
        toast.error('Không tìm thấy tài nguyên được yêu cầu');
        break;
        
      case 409:
        toast.error(apiError.message || 'Dữ liệu bị xung đột');
        break;
        
      case 422:
        toast.error('Dữ liệu không thể xử lý được');
        break;
        
      case 500:
        toast.error('Lỗi hệ thống! Vui lòng thử lại sau hoặc liên hệ quản trị viên');
        break;
        
      default:
        toast.error(apiError.message || 'Có lỗi không xác định xảy ra');
    }
  }

  // Xử lý lỗi order cụ thể
  static handleOrderError(error: any) {
    const apiError: ApiError = error.response?.data || error;
    
    // Kiểm tra các lỗi business logic cụ thể cho order
    if (apiError.message?.includes('Table is already occupied')) {
      toast.error('Bàn này đã có khách. Vui lòng chọn bàn khác.');
      return;
    }
    
    if (apiError.message?.includes('Dish not available')) {
      toast.error('Món ăn hiện không có sẵn. Vui lòng chọn món khác.');
      return;
    }
    
    if (apiError.message?.includes('Combo not available')) {
      toast.error('Combo hiện không có sẵn. Vui lòng chọn combo khác.');
      return;
    }
    
    if (apiError.message?.includes('Insufficient stock')) {
      toast.error('Không đủ số lượng trong kho. Vui lòng giảm số lượng.');
      return;
    }
    
    // Fallback to general error handling
    this.handleError(error);
  }

  // Wrapper cho async functions
  static async tryAsync<T>(
    asyncFn: () => Promise<T>,
    options?: {
      errorHandler?: (error: any) => void;
      successMessage?: string;
      loadingMessage?: string;
    }
  ): Promise<T | null> {
    try {
      if (options?.loadingMessage) {
        toast.info(options.loadingMessage);
      }
      
      const result = await asyncFn();
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      if (options?.errorHandler) {
        options.errorHandler(error);
      } else {
        this.handleError(error);
      }
      return null;
    }
  }
}

// Export shorthand functions
export const handleError = ErrorHandler.handleError.bind(ErrorHandler);
export const handleOrderError = ErrorHandler.handleOrderError.bind(ErrorHandler);
export const tryAsync = ErrorHandler.tryAsync.bind(ErrorHandler);





