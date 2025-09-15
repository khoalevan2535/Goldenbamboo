import React, { useState } from "react";
import "../../style/client/AccountClient.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Account: React.FC = () => {
  // Mock user data (replace with actual user data from auth context or API)
  const [user, setUser] = useState({
    username: "NguoiDung123",
    email: "nguoidung@example.com",
  });

  // State for profile form inputs
  const [profileForm, setProfileForm] = useState({
    username: user.username,
    email: user.email,
  });

  // State for password form inputs
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (e.g., ensure fields are not empty)
    if (!profileForm.username || !profileForm.email) {
      alert("Vui lòng điền đầy đủ thông tin hồ sơ!");
      return;
    }
    // Log form data (replace with API call)
    console.log("Profile updated:", profileForm);
    // Update user state (mock API response)
    setUser(profileForm);
  };

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    // Log form data (replace with API call)
    console.log("Password change submitted:", passwordForm);
    // Reset password form
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="account">
      <div className="account-container">
        <h1>Quản Lý Tài Khoản</h1>

        {/* Profile Edit Section */}
        <div className="profile-edit">
          <h2>Thông Tin Hồ Sơ</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên Người Dùng</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Lưu Thay Đổi
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="password-change">
          <h2>Đổi Mật Khẩu</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Mật Khẩu Hiện Tại</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Mật Khẩu Mới</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu Mới</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <button type="submit" className="submit-button">
              Cập Nhật Mật Khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;