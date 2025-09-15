import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../style/client/Register.scss'; 

// Giả lập danh sách chi nhánh
const branches = [
  { id: '1', name: 'Chi nhánh Hạ Long' },
  { id: '2', name: 'Chi nhánh Hà Nội' },
  { id: '3', name: 'Chi nhánh TP.HCM' },
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    branchId: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      branchId: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };
    setGeneralError('');
    setSuccess('');

    // Kiểm tra tên
    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
      isValid = false;
    } else if (name.length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
      isValid = false;
    }

    // Kiểm tra chi nhánh
    if (!branchId) {
      newErrors.branchId = 'Vui lòng chọn chi nhánh';
      isValid = false;
    }

    // Kiểm tra số điện thoại
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
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

    // Kiểm tra xác nhận mật khẩu
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSuccess('Đăng ký thành công!');
      setName('');
      setBranchId('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setErrors({ name: '', branchId: '', phone: '', password: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-form">
          <h1>Đăng Ký</h1>
          <p>Vui lòng nhập thông tin để tạo tài khoản của bạn.</p>
          {generalError && <p className="general-error">{generalError}</p>}
          {success && <p className="success">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Tên</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    required
                  />
                </div>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="branchId">Chi nhánh</label>
              <div className="input-wrapper">
                <select
                  id="branchId"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.branchId && <p className="error">{errors.branchId}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </span>
              </div>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </span>
              </div>
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>
            <button type="submit">Đăng Ký</button>
            <p className="login-link">
              Đã có tài khoản? <a href="/Client/Login">Đăng nhập ngay</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;