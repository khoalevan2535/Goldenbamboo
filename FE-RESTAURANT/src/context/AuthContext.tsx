// File: src/context/AuthContext.tsx (hoặc tương tự, dựa trên code gốc)

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { AuthService } from "../services/AuthService";
import type { LoginRequestDTO, AuthResponseDTO } from "../interfaces";
import type { AuthContextType, JwtPayload } from "../interfaces/AuthState";
import SessionExpiredModal from "../components/shared/SessionExpiredModal";
import {
  improveGoogleAvatarUrl,
  saveAvatarToStorage,
  saveUserInfoToStorage,
  loadUserInfoFromStorage,
  getStoredUserRoles
} from "../utils/avatarUtils";


// Tạo context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  // Chuẩn hóa role từ token
  const toCanonicalRole = (roleName: string): string => {
    const s = (roleName || "").trim();
    if (s.startsWith("ROLE_")) return s;
    const lower = s.toLowerCase();
    if (lower === "admin") return "ROLE_ADMIN";
    if (lower === "manager" || lower === "quản lý" || lower === "quan ly")
      return "ROLE_MANAGER";
    if (lower === "staff" || lower === "nhân viên" || lower === "nhan vien")
      return "ROLE_STAFF";
    if (lower === "user" || lower === "người dùng" || lower === "nguoi dung")
      return "ROLE_USER";
    return s; // fallback
  };

  const normalizeRole = (raw: unknown): string => {
    if (!raw) return "ROLE_USER";
    if (typeof raw === "string") return toCanonicalRole(raw);
    if (Array.isArray(raw) && raw.length > 0) {
      // Lấy role đầu tiên từ array
      const firstRole = raw.find((item) => typeof item === "string");
      return firstRole ? toCanonicalRole(firstRole) : "ROLE_USER";
    }
    return "ROLE_USER";
  };

  const handleLogout = useCallback(() => {
    // Clear avatar state khi logout
    const clearAvatarEvent = new CustomEvent('avatarUpdated', { 
      detail: { 
        avatarUrl: null,
        accountId: null 
      } 
    });
    window.dispatchEvent(clearAvatarEvent);
    
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    setShowSessionExpiredModal(false);
    // Chuyển hướng có thể thực hiện ở đây hoặc ở App component
    window.location.href = "/login";
  }, []);

  const handleSessionExpired = useCallback((message: string) => {
    setSessionExpiredMessage(message);
    setShowSessionExpiredModal(true);
  }, []);

  // Bootstrap user từ token
  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          // Thử lấy role từ nhiều field khác nhau
          const rawRole = decoded.role || decoded.roles || decoded.authority || decoded.authorities;
          const role = normalizeRole(rawRole);
          
          const normalized: JwtPayload = {
            sub: decoded.sub,
            accountId: Number(decoded.accountId),
            branchId: decoded.branchId != null ? Number(decoded.branchId) : null,
            role: role,
            iat: Number(decoded.iat),
            exp: Number(decoded.exp),
          };
          
          // Nếu access token đã hết hạn, thử silent refresh bằng refreshToken
          if (normalized.exp * 1000 < Date.now()) {
            // Dùng cookie httpOnly: chỉ cần gọi API refresh, cookie tự gửi
            {
              try {
                const res: AuthResponseDTO = await AuthService.refreshToken();
                const newAccess = res.accessToken;
                if (newAccess) {
                  localStorage.setItem("authToken", newAccess);
                  setToken(newAccess);
                  setLoading(false);
                  setAuthLoaded(true);
                  return; // sẽ chạy lại effect với token mới
                }
              } catch (e: any) {
                // refresh không hợp lệ -> hiển thị modal thân thiện
                const errorMessage = e?.response?.data || e?.message || 'Phiên đăng nhập đã hết hạn';
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
                
                handleSessionExpired(userFriendlyMessage);
                
                // Xóa token ngay lập tức để tránh gọi API liên tục
                localStorage.removeItem("authToken");
                setToken(null);
                setUser(null);
              }
            }
          } else {
            setUser(normalized);
          }
        } catch (error) {
  
          handleSessionExpired('Token không hợp lệ. Vui lòng đăng nhập lại.');
          setToken(null);
          setUser(null);
          localStorage.removeItem("authToken");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setAuthLoaded(true);
    };
    void bootstrap();
  }, [token, handleLogout, handleSessionExpired]);

  // Login API
  const login = useCallback(async (credentials: LoginRequestDTO) => {
    const response: AuthResponseDTO = await AuthService.login(credentials);
    const newAccess = response.accessToken;
    localStorage.setItem("authToken", newAccess);
    localStorage.removeItem("refreshToken"); // xoá refresh cũ nếu có
    setToken(newAccess);

    // Không lưu user info vào localStorage - chỉ lấy từ API khi cần

    // Hiển thị toast thành công
    toast.success("Đăng nhập thành công!");
  }, []);

  // Login bằng token sẵn có (OAuth2 / SSO)
  const loginWithToken = useCallback(async (accessToken: string) => {
    localStorage.setItem("authToken", accessToken);
    // KHÔNG xóa refreshToken - để refresh token trong httpOnly cookie hoạt động
    setToken(accessToken);
    
    // Load user info ngay sau khi set token
    try {
      const userInfo = await AuthService.getMe();
      
      // Kiểm tra xem có user info đã lưu trước đó không
      const storedUserInfo = loadUserInfoFromStorage(userInfo.accountId || 'default');
      
      // Lưu avatar vào localStorage nếu có
      if (userInfo.avatarUrl) {
        // Cải thiện Google avatar URL
        const improvedAvatarUrl = improveGoogleAvatarUrl(userInfo.avatarUrl);
        
        // Lưu avatar vào localStorage
        saveAvatarToStorage(userInfo.accountId || 'default', improvedAvatarUrl);
        
        // Lưu thông tin user để redirect đúng khi đăng nhập lại
        const userInfoToStore = {
          accountId: userInfo.accountId,
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
          avatarUrl: improvedAvatarUrl
        };
        saveUserInfoToStorage(userInfoToStore);
        
        // Trigger event để header cập nhật avatar
        const avatarEvent = new CustomEvent('avatarUpdated', { 
          detail: { 
            avatarUrl: improvedAvatarUrl,
            accountId: userInfo.accountId 
          } 
        });
        window.dispatchEvent(avatarEvent);
      } else if (storedUserInfo?.avatarUrl) {
        // Nếu không có avatar từ API nhưng có avatar đã lưu trước đó
        
        // Trigger event để header cập nhật avatar
        const avatarEvent = new CustomEvent('avatarUpdated', { 
          detail: { 
            avatarUrl: storedUserInfo.avatarUrl,
            accountId: userInfo.accountId 
          } 
        });
        window.dispatchEvent(avatarEvent);
      }
      
      // Lưu thông tin user mới (có thể cập nhật role nếu có thay đổi)
      const userInfoToStore = {
        accountId: userInfo.accountId,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        avatarUrl: userInfo.avatarUrl ? improveGoogleAvatarUrl(userInfo.avatarUrl) : storedUserInfo?.avatarUrl
      };
      saveUserInfoToStorage(userInfoToStore);
      
    } catch (error) {
      console.error('AuthContext: Error loading user info after OAuth2 login:', error);
    }
  }, []);

  // Login với access token và refresh token (cho activation)
  const loginWithTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(accessToken);
    
    // Load user info ngay sau khi set token
    try {
      const userInfo = await AuthService.getMe();
      
      // Lưu thông tin user
      saveUserInfoToStorage(userInfo.accountId || 'default', {
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        avatarUrl: userInfo.avatarUrl,
        accountId: userInfo.accountId 
      });
      
      setUser(userInfo);
      
      // Hiển thị toast thành công
      toast.success("Đăng nhập thành công! Chào mừng bạn đến với hệ thống.");
    } catch (error) {
      console.error('AuthContext: Error loading user info after activation login:', error);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  const value: AuthContextType = {
    token,
    user,
    loading,
    authLoaded,
    isAuthenticated: !!token && !!user, // Only authenticated if both token and user exist
    login,
    loginWithToken,
    loginWithTokens,
    logout,
    role: user?.role || "ROLE_USER",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal
        show={showSessionExpiredModal}
        message={sessionExpiredMessage}
        onConfirm={handleLogout}
      />
    </AuthContext.Provider>
  );
};

// ✅ Hook useAuth để import bên ngoài
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};