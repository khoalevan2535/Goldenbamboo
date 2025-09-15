import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { Spinner } from "react-bootstrap";
import styles from "../style/ForgotPasswordPage.module.css";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isOAuth2Account, setIsOAuth2Account] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý state từ LoginPage khi chuyển hướng
  useEffect(() => {
    if (location.state) {
      const { email: stateEmail, isOAuth2Account: stateIsOAuth2, message: stateMessage } = location.state as any;
      if (stateEmail) {
        setEmail(stateEmail);
      }
      if (stateIsOAuth2) {
        setIsOAuth2Account(true);
        setMessage(stateMessage || "Tài khoản của bạn chưa có mật khẩu. Vui lòng đặt mật khẩu để có thể đăng nhập bằng email và mật khẩu.");
      }
    }
  }, [location.state]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword(email);
      setMessage(response.message);
      setOtpSent(true);
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || err?.response?.data || "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Mật khẩu xác nhận không khớp.");
      }
      if (newPassword.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
      }
      const response = await AuthService.resetPassword({ email, otp, newPassword });
      setMessage(response.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || err?.response?.data || "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <h1>{isOAuth2Account ? "Đặt Mật Khẩu" : "Quên Mật Khẩu"}</h1>
          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              {error && <div className={styles.generalError}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Đang gửi...</span>
                  </>
                ) : (
                  isOAuth2Account ? "Gửi mã OTP để đặt mật khẩu" : "Gửi mã OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {error && <div className={styles.generalError}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="otp">Mã OTP</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="otp"
                    placeholder="Nhập mã OTP 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Đang xử lý...</span>
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>

              <div className={styles.registerLink}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setMessage("");
                  }}
                >
                  Quay lại
                </button>
              </div>
            </form>
          )}

          <div className={styles.registerLink}>
            <Link to="/login">Nhớ mật khẩu? Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;