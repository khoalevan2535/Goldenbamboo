import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/client/Login.scss';

// Giả lập danh sách người dùng
const users = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'secure456' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    setGeneralError('');

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Kiểm tra mật khẩu
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    // Kiểm tra thông tin đăng nhập
    if (isValid) {
      const user = users.find(
        (u) => u.email === email && u.u.password === password
      );
      if (!user) {
        setGeneralError('Email hoặc mật khẩu không đúng');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Đăng nhập thành công!');
      setEmail('');
      setPassword('');
      setErrors({ email: '', password: '' });
      setGeneralError('');
      setShowPassword(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-form">
          <h1>Đăng Nhập</h1>
          <p>Vui lòng nhập thông tin để đăng nhập vào tài khoản của bạn.</p>
          {generalError && <p className="general-error">{generalError}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Nhập email của bạn"
                />
              </div>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật Khẩu</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu của bạn"
                />
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </span>
              </div>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>
            <button type="submit">Đăng Nhập</button>
            <p className="register-link">
              Chưa có tài khoản? <a href="/Client/Register">Đăng ký ngay</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;