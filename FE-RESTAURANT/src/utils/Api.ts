import axios, { type AxiosInstance } from 'axios';
import { toast } from 'react-toastify';
// Bỏ import refreshTokenAPI từ service
// import { refreshToken as refreshTokenAPI } from '../services/AuthService'; 

const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Sử dụng relative URL để proxy hoạt động
});

// Gắn authToken vào mọi request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
type FailedQueuePromise = {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}
let failedQueue: FailedQueuePromise[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  // The rest of the user info is derived from the token, no need to clear manually
  window.location.href = '/home';
};


// Interceptor cho response: tự động refresh token nếu gặp 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Không xử lý 401/403 nếu đã retry hoặc không phải lỗi auth
    if ((error.response?.status !== 401 && error.response?.status !== 403) || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Kiểm tra xem có phải endpoint public không (không cần auth)
    const isPublicEndpoint = originalRequest.url?.includes('/api/branches/client/') ||
      originalRequest.url?.includes('/api/categories/client /') ||
      originalRequest.url?.includes('/api/client/menu/');

    // Nếu là endpoint public và gặp 401, không cần refresh token
    if (isPublicEndpoint && error.response?.status === 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const localRefreshToken = localStorage.getItem('refreshToken');
    if (!localRefreshToken) {
      logout();
      return Promise.reject(error);
    }

    try {
      toast.info('Phiên làm việc hết hạn, đang tự động làm mới...');

      // Sử dụng axios.create() riêng để tránh vòng lặp interceptor
      const refreshClient = axios.create({
        baseURL: 'http://localhost:8080', // Sử dụng relative URL để proxy hoạt động
      });

      const res = await refreshClient.post('/auth/refresh-token', { refreshToken: localRefreshToken });

      const { accessToken, refreshToken: newRefreshToken } = res.data;
      
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
      processQueue(null, accessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError instanceof Error ? refreshError : new Error('Token refresh failed'), null);

      // THÊM TOAST ERROR VÀO ĐÂY
      toast.error('Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.');

      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient; 