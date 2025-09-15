// File: src/services/AuthService.ts
import apiClient from "../utils/apiClient";
import type { LoginRequestDTO, AuthResponseDTO, StaffRegistrationRequestDTO, RegisterRequestDTO, RegisterResponseDTO } from "../interfaces";

const API_URL = "/auth";

export const AuthService = {
  login: async (data: LoginRequestDTO): Promise<AuthResponseDTO> => {
    try {
      return await apiClient.post(`${API_URL}/login`, data);
    } catch (error: any) {
      console.log("AuthService login error:", error);
      
      // Mock login cho testing khi backend chưa chạy
      if (error.message && error.message.includes("CORS") || error.message && error.message.includes("Failed to fetch")) {
        console.log("🔄 Backend not available, using mock login for testing");
        
        // Mock data cho testing
        const mockResponse: AuthResponseDTO = {
          token: "mock-jwt-token-for-testing",
          refreshToken: "mock-refresh-token",
          user: {
            id: 1,
            username: data.username,
            email: "test@example.com",
            name: "Test User",
            phone: "0123456789",
            address: "Test Address",
            status: "ACTIVE",
            createAt: new Date().toISOString(),
            roles: ["ROLE_USER"],
            branchId: 1,
            branchName: "Chi nhánh Trung tâm",
            branchAddress: "123 Đường ABC, Quận 1, TP.HCM",
            avatarUrl: null,
            latitude: null,
            longitude: null,
            failedAttempts: 0,
            lockTime: null,
            lastFailedAttempt: null
          }
        };
        
        // Lưu token vào localStorage
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('refreshToken', mockResponse.refreshToken);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        
        console.log("✅ Mock login successful:", mockResponse.user);
        return mockResponse;
      }
      
      // Xử lý response error từ backend với thông tin chi tiết
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.failedAttemptsInfo) {
          // Tạo error object với thông tin chi tiết
          const customError = new Error(errorData.error || 'Đăng nhập thất bại');
          (customError as any).failedAttemptsInfo = errorData.failedAttemptsInfo;
          throw customError;
        }
      } else if (error.failedAttemptsInfo) {
        // Trường hợp error đã được xử lý bởi apiClient
        const customError = new Error(error.error || 'Đăng nhập thất bại');
        (customError as any).failedAttemptsInfo = error.failedAttemptsInfo;
        throw customError;
      } else if (error.error && error.failedAttemptsInfo) {
        // Trường hợp error là Map từ backend
        const customError = new Error(error.error || 'Đăng nhập thất bại');
        (customError as any).failedAttemptsInfo = error.failedAttemptsInfo;
        throw customError;
      }
      
      // Xử lý tài khoản OAuth2 chưa có password
      if (error.message && error.message === "OAUTH2_NO_PASSWORD") {
        const customError = new Error('OAUTH2_NO_PASSWORD');
        throw customError;
      }
      
      // Xử lý thông báo lỗi tiếng Anh
      if (error.message && (error.message === "Invalid password" || 
                           error.message === "Invalid credentials" || 
                           error.message === "Bad credentials")) {
        const customError = new Error('Tài khoản hoặc mật khẩu không đúng vui lòng kiểm tra lại');
        throw customError;
      }
      
      throw error;
    }
  },
  register: (data: RegisterRequestDTO): Promise<RegisterResponseDTO> => {
    return apiClient.post(`${API_URL}/register-user`, data);
  },
  registerStaff: (data: StaffRegistrationRequestDTO): Promise<AuthResponseDTO> => {
    return apiClient.post(`${API_URL}/register-staff`, data);
  },
  activateStaffAccount: (token: string, newPassword: string): Promise<AuthResponseDTO> => {
    return apiClient.post(`${API_URL}/activate-staff-account`, {
      token,
      newPassword
    });
  },
  refreshToken: (): Promise<AuthResponseDTO> => {
    return apiClient.post(`${API_URL}/refresh-token`);
  },
  verifyOtp: (data: { email: string; otp: string; sessionId?: string }): Promise<AuthResponseDTO> => {
    console.log("AuthService: verifyOtp called with data:", data);
    return apiClient.post(`${API_URL}/verify-otp`, data)
      .then(response => {
        console.log("AuthService: verifyOtp success:", response);
        return response;
      })
      .catch(error => {
        console.log("AuthService: verifyOtp error:", error);
        throw error;
      });
  },
  registerByPhone: (data: { phone: string; password: string }): Promise<AuthResponseDTO> => {
    console.log("AuthService: registerByPhone called with data:", data);
    return apiClient.post(`${API_URL}/register-phone`, data)
      .then(response => {
        console.log("AuthService: registerByPhone response:", response.data);
        return response.data;
      })
      .catch(error => {
        console.error("AuthService: registerByPhone error:", error.response?.data || error.message);
        throw error;
      });
  },
  forgotPassword: (email: string): Promise<{ message: string }> => {
    return apiClient.post(`${API_URL}/forgot-password`, { email });
  },
  resetPassword: (data: object): Promise<{ message: string }> => {
    return apiClient.post(`${API_URL}/reset-password`, data);
  },
  sendRegisterOtp: (data: { email: string; username: string; password: string; name?: string }): Promise<AuthResponseDTO> => {
    return apiClient.post(`${API_URL}/send-register-otp`, data);
  },
  getMe: (): Promise<any> => {
    return apiClient.get(`${API_URL}/me`);
  },
  updateMe: (data: { name?: string; phone?: string; avatarUrl?: string; address?: string; latitude?: number; longitude?: number }): Promise<any> => {
    return apiClient.put(`${API_URL}/me`, data);
  },
  uploadAvatar: async (file: File): Promise<any> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post(`${API_URL}/me/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  changePassword: (data: { currentPassword?: string; newPassword: string }): Promise<{ message: string } | string> => {
    return apiClient.post(`${API_URL}/change-password`, data);
  },
  setPassword: (data: { newPassword: string }): Promise<{ message: string } | string> => {
    return apiClient.post(`${API_URL}/set-password`, data);
  },
  testPhoneRegistration: (data: { phone: string; password: string }): Promise<any> => {
    console.log("AuthService: testPhoneRegistration called with data:", data);
    return apiClient.post(`${API_URL}/test-phone-registration`, data)
      .then(response => {
        console.log("AuthService: testPhoneRegistration response:", response.data);
        return response.data;
      })
      .catch(error => {
        console.error("AuthService: testPhoneRegistration error:", error.response?.data || error.message);
        throw error;
      });
  },
};