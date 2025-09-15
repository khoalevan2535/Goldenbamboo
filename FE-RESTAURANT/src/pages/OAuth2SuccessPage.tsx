import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthService } from "../services/AuthService";
import { toast } from "react-toastify";
import { 
  improveGoogleAvatarUrl, 
  saveAvatarToStorage, 
  saveUserInfoToStorage,
  testAvatarUrl 
} from "../utils/avatarUtils";

export default function OAuth2SuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const handleOAuth2Success = async () => {
      const authToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      const error = params.get("error");
      
      if (error) {
        setStatus('error');
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        return;
      }
      
      if (authToken) {
        try {
          // Đăng nhập với token
          loginWithToken(authToken);
          
          // Log refresh token để debug (không lưu vào localStorage vì đã có trong cookie)
          if (refreshToken) {
            console.log('OAuth2: Refresh token received from backend');
          }
          
          // Lấy thông tin user từ API /me để có avatar và thông tin đầy đủ
          try {
            const userInfoData = await AuthService.getMe();
            setUserInfo(userInfoData);
            console.log('OAuth2: User info loaded:', userInfoData);
            console.log('OAuth2: Avatar URL from API:', userInfoData.avatarUrl);
            console.log('OAuth2: User roles:', userInfoData.roles);
            
            // Lưu avatar vào localStorage nếu có
            if (userInfoData.avatarUrl) {
              // Cải thiện Google avatar URL
              const improvedAvatarUrl = improveGoogleAvatarUrl(userInfoData.avatarUrl);
              
              // Lưu avatar vào localStorage
              saveAvatarToStorage(userInfoData.accountId || 'default', improvedAvatarUrl);
              
              // Lưu thông tin user để redirect đúng khi đăng nhập lại
              const userInfoToStore = {
                accountId: userInfoData.accountId,
                name: userInfoData.name,
                email: userInfoData.email,
                roles: userInfoData.roles,
                avatarUrl: improvedAvatarUrl
              };
              saveUserInfoToStorage(userInfoToStore);
              
              // Trigger event để header cập nhật avatar
              const avatarEvent = new CustomEvent('avatarUpdated', { 
                detail: { 
                  avatarUrl: improvedAvatarUrl,
                  accountId: userInfoData.accountId 
                } 
              });
              window.dispatchEvent(avatarEvent);
              
              // Test load avatar để đảm bảo URL hoạt động
              const isValid = await testAvatarUrl(improvedAvatarUrl);
              if (!isValid) {
                console.error('OAuth2: Avatar URL is invalid:', improvedAvatarUrl);
              }
            }
            
            toast.success(`Chào mừng ${userInfoData.name || 'bạn'}!`);
          } catch (userInfoError) {
            console.error('OAuth2: Error loading user info:', userInfoError);
            // Không block flow nếu lỗi load user info
          }
          
          setStatus('success');
        } catch (err) {
          console.error('OAuth2: Login error:', err);
          setStatus('error');
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } else {
        setStatus('error');
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleOAuth2Success();
  }, [params, loginWithToken, navigate]);

  // Chuyển hướng khi userInfo được load
  useEffect(() => {
    if (userInfo && status === 'success') {
      setTimeout(() => {
        // Chuyển hướng dựa trên vai trò - sử dụng cùng logic như LoginPage
        const role = userInfo.role || 'ROLE_USER';
        
        // ✅ Điều hướng theo từng vai trò cụ thể
        if (role === "ROLE_ADMIN") {
          navigate("/admin"); // Điều hướng đến trang mặc định của admin
        } else if (role === "ROLE_MANAGER") {
          navigate("/manager/dashboard"); // Điều hướng đến trang dashboard của manager

        } else if (role === "ROLE_STAFF") {
          navigate("/staff/dashboard");
        } else {
          navigate("/"); // Điều hướng mặc định cho người dùng (client)
        }
      }, 2000);
    }
  }, [userInfo, status, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f5f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '90%'
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #e07b39',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <h3 style={{ color: '#e07b39', marginBottom: '1rem' }}>
              <i className="fab fa-google me-2"></i>
              Đang xử lý đăng nhập Google...
            </h3>
            <p style={{ color: '#666' }}>Vui lòng chờ trong giây lát</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <i className="fas fa-check" style={{ color: 'white', fontSize: '24px' }}></i>
            </div>
            <h3 style={{ color: '#28a745', marginBottom: '1rem' }}>
              Đăng nhập thành công!
            </h3>
            <p style={{ color: '#666' }}>Đang chuyển hướng...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <i className="fas fa-times" style={{ color: 'white', fontSize: '24px' }}></i>
            </div>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>
              Đăng nhập thất bại
            </h3>
            <p style={{ color: '#666' }}>Đang chuyển hướng về trang đăng nhập...</p>
          </>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
