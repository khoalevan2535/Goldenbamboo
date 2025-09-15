// File: src/utils/ApiClient.ts

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // Sử dụng relative URL để proxy hoạt động
  withCredentials: true, // gửi cookie (refreshToken)
});

// Debug logging for API calls (remove in production)
// // ✅ Interceptor cho Request: Tự động đính kèm token (lấy từ logic của file Api.ts)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug log để kiểm tra request (enabled để debug)
  
  return config;
});

// --- Logic Refresh Token chuyên nghiệp (lấy từ file Api.ts) ---
let isRefreshing = false;
type FailedQueuePromise = {
  resolve: (token: string | null) => void;
  reject: (error: Error | null) => void;
}
let failedQueue: FailedQueuePromise[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};
// ----------------------------------------------------------------

// ✅ Interceptor cho Response: Kết hợp những gì tốt nhất
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug log để kiểm tra response
    // ✅ Tự động trả về `response.data` cho tất cả các lời gọi thành công
    return response.data;
  },
  async error => {
    // Debug log để kiểm tra error
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    const originalRequest = error.config;

    // --- Logic Refresh Token cho lỗi 401 (giữ nguyên từ file Api.ts) ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        toast.info('Phiên làm việc hết hạn, đang tự động làm mới...');
        const refreshClient = axios.create({
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
          withCredentials: true
        });
        // Refresh token đang lưu ở httpOnly cookie, request body để trống
        const res = await refreshClient.post('/auth/refresh-token');
        const newAuthToken = res.data.accessToken || res.data.token;
        if (!newAuthToken) throw new Error("Không nhận được token mới.");

        localStorage.setItem('authToken', newAuthToken);
        processQueue(null, newAuthToken);
        toast.success('Phiên làm việc đã được làm mới thành công!');
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError as Error, null);

        // Xử lý thông báo lỗi refreshToken thân thiện hơn
        const errorMessage = refreshError.response?.data || refreshError.message;
        let userFriendlyMessage = 'Phiên đăng nhập đã hết hạn.';

        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('Refresh token không hợp lệ') ||
            errorMessage.includes('Refresh token đã hết hạn') ||
            errorMessage.includes('Refresh token không được cung cấp') ||
            errorMessage.includes('Refresh token không có thời gian hết hạn')) {
            userFriendlyMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.';
          } else if (errorMessage.includes('token')) {
            userFriendlyMessage = 'Phiên làm việc không hợp lệ. Vui lòng đăng nhập lại.';
          }
        }

        // Hiển thị toast thông báo và chuyển hướng sau một khoảng thời gian
        toast.error(userFriendlyMessage, {
          autoClose: 3000,
          onClose: () => {
            // Chỉ logout sau khi user đã đọc thông báo
            setTimeout(() => {
              logout();
            }, 500);
          }
        });

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ Tự động hiển thị toast cho các lỗi khác (tạm thời comment để test)
    // const data = error.response?.data;
    // let errorMessage: string;
    // if (typeof data === 'string') errorMessage = data;
    // else if (data?.error) errorMessage = String(data.error);
    // else if (data?.message) errorMessage = String(data.message);
    // else if (data != null) errorMessage = (() => { try { return JSON.stringify(data); } catch { return '[object]'; } })();
    // else errorMessage = 'Có lỗi không xác định.';

    // switch (error.response?.status) {
    //     case 400: toast.error(`Dữ liệu không hợp lệ: ${errorMessage}`); break;
    //     case 403: toast.error('Bạn không có quyền thực hiện hành động này.'); break;
    //     case 404: toast.error('Không tìm thấy tài nguyên được yêu cầu.'); break;
    //     case 500: toast.error('Lỗi hệ thống! Vui lòng thử lại sau.'); break;
    // }

    // ✅ Luôn ném lỗi ra ngoài để hook và component có thể bắt được
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;