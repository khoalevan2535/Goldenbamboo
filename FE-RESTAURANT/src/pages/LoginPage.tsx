// src/pages/Login.tsx

import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../style/LoginPage.module.scss";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, loading } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttemptsInfo, setFailedAttemptsInfo] = useState<string | null>(null);
  const [showSampleAccounts, setShowSampleAccounts] = useState(false);

  // Điều hướng người dùng nếu họ đã đăng nhập
  useEffect(() => {
    // Only redirect if not loading and actually authenticated
    if (!loading && isAuthenticated && user) {
      const role = user.role || 'ROLE_USER';
      
      // Kiểm tra redirect parameter từ URL
      const redirectUrl = searchParams.get('redirect');
      
      if (redirectUrl) {
        // Nếu có redirect URL, điều hướng về đó
        navigate(decodeURIComponent(redirectUrl));
        return;
      }

      // ✅ Điều hướng theo từng vai trò cụ thể nếu không có redirect
      if (role === "ROLE_ADMIN") {
        navigate("/admin"); // Điều hướng đến trang mặc định của admin
      } else if (role === "ROLE_MANAGER") {
        navigate("/manager/dashboard"); // Điều hướng đến trang dashboard của manager
      } else if (role === "ROLE_STAFF") {
        navigate("/staff/dashboard");
      } else {
        navigate("/"); // Điều hướng mặc định cho người dùng (client)
      }
    }
  }, [loading, isAuthenticated, user, navigate, searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFailedAttemptsInfo(null); // Reset thông tin thất bại

    // Validation: Kiểm tra các trường không được để trống
    if (!loginIdentifier || !loginIdentifier.trim()) {
      toast.error('Email hoặc username không được để trống');
      setIsSubmitting(false);
      return;
    }

    // Validation: Kiểm tra format email nếu người dùng nhập email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (loginIdentifier.includes('@') && !emailRegex.test(loginIdentifier.trim())) {
      toast.error('Email không đúng định dạng');
      setIsSubmitting(false);
      return;
    }

    // Validation: Kiểm tra độ dài tối thiểu
    if (loginIdentifier.trim().length < 3) {
      toast.error('Email hoặc username phải có ít nhất 3 ký tự');
      setIsSubmitting(false);
      return;
    }

    // Validation: Kiểm tra password chỉ khi có nhập (cho phép trống để xử lý OAuth2)
    if (password && password.trim() && password.trim().length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      setIsSubmitting(false);
      return;
    }

    try {
      await login({ loginIdentifier, password });
      // Việc điều hướng sẽ được xử lý bởi useEffect ở trên
    } catch (err: any) {
      // Cải thiện thông báo lỗi với toast
      console.log("Login error:", err);
      console.log("Error response:", err.response);

      let errorMessage = "Đăng nhập thất bại";

      // Xử lý tài khoản OAuth2 chưa có password - chuyển hướng đến trang quên mật khẩu
      if (err.message === "OAUTH2_NO_PASSWORD") {
        toast.info("Tài khoản của bạn chưa có mật khẩu. Vui lòng đặt mật khẩu để đăng nhập bằng form.");
        navigate("/forgot-password", { 
          state: { 
            email: loginIdentifier,
            isOAuth2Account: true,
            message: "Tài khoản của bạn chưa có mật khẩu. Vui lòng đặt mật khẩu để có thể đăng nhập bằng email và mật khẩu."
          } 
        });
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra thông tin chi tiết về số lần thất bại
      if (err.failedAttemptsInfo) {
        setFailedAttemptsInfo(err.failedAttemptsInfo);
      }

      // Xử lý lỗi từ apiClient (err có thể là error.response?.data hoặc error)
      if (err.response?.status === 401) {
        errorMessage = "Tài khoản hoặc mật khẩu không đúng vui lòng kiểm tra lại";
      } else if (err.response?.status === 403) {
        errorMessage = "Tài khoản của bạn đã bị khóa";
      } else if (err.response?.status === 404) {
        errorMessage = "Tài khoản không tồn tại";
      } else if (err.response?.data?.error) {
        // Hiển thị thông báo lỗi từ backend
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        errorMessage = err.response.data;
      } else if (err.error) {
        // Trường hợp err là error.response?.data từ apiClient
        errorMessage = err.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Xử lý trường hợp err là Map từ backend (error.response?.data)
      if (typeof err === 'object' && err !== null) {
        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }

      // Chuyển đổi thông báo lỗi tiếng Anh sang tiếng Việt
      if (errorMessage === "Invalid password" || errorMessage === "Invalid credentials" ||
        errorMessage === "Bad credentials" || errorMessage.includes("password") ||
        errorMessage.includes("credentials")) {
        errorMessage = "Tài khoản hoặc mật khẩu không đúng vui lòng kiểm tra lại";
      }

      console.log("Final error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleLogin = () => {
    // Redirect đến endpoint OAuth2 của Spring Security
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  // Function to fill sample account info
  const fillSampleAccount = (email: string, password: string) => {
    setLoginIdentifier(email);
    setPassword(password);
    setShowSampleAccounts(false);
  };

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.container}>
          <div className={styles.loginForm}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang kiểm tra...</span>
            </Spinner>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["login-page"]}>
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <h1>Đăng nhập</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <label htmlFor="loginIdentifier">Email hoặc Username</label>
              <input
                type="text"
                id="loginIdentifier"
                placeholder="Nhập email hoặc username"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="password">Mật khẩu</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#666",
                    padding: "0",
                    cursor: "pointer",
                    zIndex: 10
                  }}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Hiển thị thông tin về số lần thất bại */}
            {failedAttemptsInfo && (
              <div className={styles["general-error"]}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {failedAttemptsInfo}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className={styles["submit-button"]}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Đang xử lý...</span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            className={styles["google-button"]}
            onClick={handleGoogleLogin}
          >
            <i className="fab fa-google me-2"></i>
            Đăng nhập với Google
          </button>

          {/* Sample Accounts Section */}
          <div className={styles["sample-accounts"]}>
            <button
              type="button"
              className={styles["sample-toggle"]}
              onClick={() => setShowSampleAccounts(!showSampleAccounts)}
            >
              {showSampleAccounts ? 'Ẩn' : 'Hiển thị'} tài khoản mẫu
            </button>
            
            {showSampleAccounts && (
              <div className={styles["sample-list"]}>
                <h4>🔑 Tài khoản mẫu để test:</h4>
                <div className={styles["sample-item"]}>
                  <strong>👤 Khách hàng:</strong>
                  <button
                    type="button"
                    onClick={() => fillSampleAccount('customer@test.com', '123456')}
                    className={styles["sample-btn"]}
                  >
                    customer@test.com / 123456
                  </button>
                </div>
                <div className={styles["sample-item"]}>
                  <strong>👨‍💼 Manager:</strong>
                  <button
                    type="button"
                    onClick={() => fillSampleAccount('manager@test.com', '123456')}
                    className={styles["sample-btn"]}
                  >
                    manager@test.com / 123456
                  </button>
                </div>
                <div className={styles["sample-item"]}>
                  <strong>👨‍🍳 Staff:</strong>
                  <button
                    type="button"
                    onClick={() => fillSampleAccount('staff@test.com', '123456')}
                    className={styles["sample-btn"]}
                  >
                    staff@test.com / 123456
                  </button>
                </div>
                <div className={styles["sample-item"]}>
                  <strong>👑 Admin:</strong>
                  <button
                    type="button"
                    onClick={() => fillSampleAccount('admin@test.com', '123456')}
                    className={styles["sample-btn"]}
                  >
                    admin@test.com / 123456
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles["login-links"]}>
            <Link to="/forgot-password" className={styles["forgot-link"]}>
              Quên mật khẩu?
            </Link>
            <div className={styles["register-link"]}>
              <span>Bạn chưa có tài khoản? </span>
              <Link to="/register">Đăng Ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
