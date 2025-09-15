import React, { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { getApiErrorMessage } from "../utils/error";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext"; 
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../style/RegisterPage.module.scss";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // States cho cooldown OTP
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // State để track OTP session
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [lastOtpSentTime, setLastOtpSentTime] = useState<number | null>(null);

  const navigate = useNavigate();
  const { loginWithToken } = useAuth(); 

  // Function để format thời gian cooldown
  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function để bắt đầu cooldown
  const startCooldown = () => {
    setCanResendOtp(false);
    setOtpCooldown(60); // 60 giây = 1 phút
    
    // Clear timer cũ nếu có
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    
    cooldownTimerRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      // Kiểm tra username
      if (!username || username.trim().length < 3) {
        toast.error("Username phải có ít nhất 3 ký tự.");
        return;
      }
      
      // Kiểm tra email
      if (!email || !/^[A-Za-z0-9+_.-]+@(.+)$/.test(email)) {
        toast.error("Vui lòng nhập email hợp lệ để nhận OTP.");
        return;
      }
      
      // Kiểm tra password
      if (!password) {
        toast.error("Vui lòng nhập mật khẩu trước khi gửi OTP.");
        return;
      }
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }
      
      // Kiểm tra xác nhận mật khẩu
      if (!confirmPassword) {
        toast.error("Vui lòng nhập xác nhận mật khẩu trước khi gửi OTP.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Xác nhận mật khẩu không khớp với mật khẩu.");
        return;
      }
      
      const response = await AuthService.sendRegisterOtp({
        email,
        username,
        password,
      });
      setOtpSent(true);
      startCooldown(); // Bắt đầu cooldown sau khi gửi OTP thành công
      
      // Lưu thông tin OTP session
      setOtpSessionId(response.sessionId || Date.now().toString());
      setLastOtpSentTime(Date.now());
      
      toast.success("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!");
    } catch (err: any) {
      // Cải thiện thông báo lỗi với toast
      let errorMessage = "Không thể gửi OTP";
      
      // Log để debug chi tiết
      console.log("=== DEBUG OTP ERROR ===");
      console.log("Full error object:", err);
      console.log("Error response:", err.response);
      console.log("Error status:", err.response?.status);
      console.log("Error data:", err.response?.data);
      console.log("Error data type:", typeof err.response?.data);
      console.log("Error message:", err.message);
      console.log("=======================");
      
      if (err.response?.status === 409) {
        const responseData = err.response?.data;
        console.log("Processing 409 error with data:", responseData);
        
        if (typeof responseData === 'string') {
          console.log("Response is string, checking content...");
          if (responseData.includes("Username")) {
            errorMessage = "Username đã được sử dụng";
            console.log("Found Username conflict");
          } else if (responseData.includes("Email")) {
            errorMessage = "Email đã được sử dụng";
            console.log("Found Email conflict");
          } else {
            errorMessage = responseData;
            console.log("Using raw response data");
          }
        } else {
          errorMessage = "Tài khoản đã tồn tại";
          console.log("Response is not string, using default message");
        }
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data || "Dữ liệu không hợp lệ";
        console.log("400 error, using:", errorMessage);
      } else if (err.message) {
        errorMessage = err.message;
        console.log("Using error message:", errorMessage);
      }
      
      console.log("Final error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error("Xác nhận mật khẩu không khớp với mật khẩu.");
        return;
      }
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }
      if (!otpSent || !otp) {
        toast.error("Bạn cần gửi và nhập mã OTP để xác thực email trước khi hoàn tất đăng ký.");
        return;
      }

      // Kiểm tra xem OTP có phải là mới nhất không
      if (lastOtpSentTime && Date.now() - lastOtpSentTime > 60000) {
        toast.error("Mã OTP đã hết hạn. Vui lòng gửi lại mã OTP mới nhất.");
        return;
      }

      const verifyRes = await AuthService.verifyOtp({
        email,
        otp,
        sessionId: otpSessionId,
      });

      if (!verifyRes.accessToken) {
        toast.error("Xác thực OTP thất bại.");
        return;
      }

      await loginWithToken(verifyRes.accessToken);

      toast.success("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      // Cải thiện thông báo lỗi với toast và debug
      console.log("Register error:", err);
      console.log("Error response:", err.response);
      
      let errorMessage = "Đã xảy ra lỗi khi đăng ký";
      if (err.response?.status === 400) {
        if (err.response?.data?.includes("OTP")) {
          errorMessage = "Mã OTP không đúng hoặc đã hết hạn";
        } else if (err.response?.data?.includes("Email")) {
          errorMessage = "Email không hợp lệ";
        } else {
          errorMessage = err.response?.data || "Dữ liệu không hợp lệ";
        }
      } else if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy thông tin OTP";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log("Final error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["register-page"]}>
      <div className={styles.container}>
        <div className={styles["register-form"]}>
                     <h1>Đăng ký</h1>
           <form onSubmit={handleRegister}>

            <div className={styles["form-group"]}>
              <label htmlFor="username">Username</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="text"
                  id="username"
                  placeholder="Nhập username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  pattern="^[a-zA-Z0-9_]+$"
                  minLength={3}
                  maxLength={20}
                />
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="email">Email</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !canResendOtp}
                  className={styles["otp-button"]}
                >
                  {otpLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="ms-2">Gửi...</span>
                    </>
                  ) : !canResendOtp ? (
                    `Gửi lại (${formatCooldown(otpCooldown)})`
                  ) : (
                    otpSent ? "Gửi lại OTP" : "Gửi OTP"
                  )}
                </button>
              </div>
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
                    color: "#6c757d",
                    padding: "0",
                    cursor: "pointer",
                    zIndex: 10
                  }}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#6c757d",
                    padding: "0",
                    cursor: "pointer",
                    zIndex: 10
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className={styles["form-group"]}>
                <label htmlFor="otp">Mã OTP</label>
                <div className={styles["input-wrapper"]}>
                  <input
                    type="text"
                    id="otp"
                    placeholder="Nhập mã OTP 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? (
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
                "Đăng ký"
              )}
            </button>
          </form>
          <div className={styles["login-link"]}>
            <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
          </div>

        </div>
      </div>
    </div>
  );
}