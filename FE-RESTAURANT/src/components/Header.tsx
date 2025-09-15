import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaBell, 
  FaSignOutAlt, 
  FaUserTie,
  FaShieldAlt,
  FaChartLine,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { Button, Dropdown } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { loadAvatarFromStorage, testAvatarUrl, removeInvalidAvatar } from "../utils/avatarUtils";
import { ConfirmModal } from "./shared/ConfirmModal";
import "./Header.css";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

interface AvatarUpdateEvent extends CustomEvent {
  detail: { avatarUrl?: string };
}

export default function Header({ onToggleSidebar, sidebarCollapsed = false }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Lắng nghe sự kiện cập nhật avatar và load avatar khi user thay đổi
  useEffect(() => {
    const handleAvatarUpdate = (event: AvatarUpdateEvent) => {
      // Cập nhật avatar ngay lập tức nếu có URL
      if (event.detail?.avatarUrl) {
        setUserAvatar(event.detail.avatarUrl);
        console.log('Header avatar state updated with new URL');

        // Test load avatar để đảm bảo hiển thị được
        const testImg = new Image();
        testImg.onload = () => {
          console.log('Header: Avatar image loaded successfully');
        };
        testImg.onerror = () => {
          console.error('Header: Failed to load avatar image, falling back to default');
          setUserAvatar(null);
        };
        testImg.src = event.detail.avatarUrl;
      }
    };

    // Lấy avatar từ localStorage sử dụng utility function
    const avatarUrl = loadAvatarFromStorage(String(user?.accountId || 'default'));

    if (avatarUrl) {
      console.log('Header: Found avatar URL:', avatarUrl);
      // Test load avatar để đảm bảo hoạt động
      testAvatarUrl(avatarUrl).then((isValid) => {
        if (isValid) {
          setUserAvatar(avatarUrl);
        } else {
          console.error('Header: Failed to load avatar, removing from localStorage');
          removeInvalidAvatar(String(user?.accountId || 'default'));
          setUserAvatar(null);
        }
      });
    } else {
      console.log('Header: No avatar found for user:', user?.accountId);
      setUserAvatar(null);
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, [user?.accountId]); // Re-run khi user thay đổi

  const role = user?.role || 'ROLE_USER';
  const canonical = role && role.startsWith('ROLE_') ? role : (
    role?.toLowerCase() === 'admin' ? 'ROLE_ADMIN' :
    role?.toLowerCase() === 'manager' ? 'ROLE_MANAGER' :
    role?.toLowerCase() === 'staff' ? 'ROLE_STAFF' :
    role?.toLowerCase() === 'user' ? 'ROLE_USER' : role
  );
  const isAdmin = canonical === "ROLE_ADMIN";
  const isManager = canonical === "ROLE_MANAGER";

  const getUserRoleDisplay = () => {
    if (isAdmin) return 'Administrator';
    if (isManager) return 'Manager';
    if (canonical === "ROLE_STAFF") return 'Staff';
    return 'User';
  };

  const getUserRoleIcon = () => {
    if (isAdmin) return <FaShieldAlt className="role-icon admin" />;
    if (isManager) return <FaChartLine className="role-icon manager" />;
    if (canonical.includes("ROLE_STAFF")) return <FaUserTie className="role-icon staff" />;
    return <FaUser className="role-icon user" />;
  };

  const handleLogoClick = () => {
    // Điều hướng dựa trên vai trò của người dùng
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isManager) {
      navigate('/admin/dashboard');
    } else if (canonical.includes("ROLE_STAFF")) {
      navigate('/staff/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="admin-header">
        <div className="header-left">
          {onToggleSidebar && (
            <Button
              variant="outline-secondary"
              className="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {sidebarCollapsed ? <FaBars /> : <FaTimes />}
            </Button>
          )}
          <div className="header-title">
            <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <img src="/logoGoldenBamboo.png" alt="Golden Bamboo Logo" className="header-logo" />
            </div>
            <div className="title-text">
              <h1>Golden Bamboo Restaurant</h1>
              <span className="header-subtitle">Hệ thống quản lý nhà hàng</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* User Profile */}
          <div className="header-user">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" className="user-dropdown-toggle">
                <div className="user-avatar-container">
                  <div className="user-avatar">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt="User Avatar" 
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                        onLoad={() => console.log('Avatar loaded successfully')}
                        onError={(e) => console.error('Header: Avatar image failed to load:', userAvatar, e)}
                      />
                    ) : (
                      <FaUserTie />
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user?.sub || 'Admin'}</div>
                    <div className="user-role">
                      {getUserRoleIcon()}
                      <span>{getUserRoleDisplay()}</span>
                    </div>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown-menu">
                <Dropdown.Header>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-avatar">
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt="User Avatar" 
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onLoad={() => console.log('Dropdown avatar loaded successfully')}
                          onError={(e) => console.error('Header Dropdown: Avatar image failed to load:', userAvatar, e)}
                        />
                      ) : (
                        <FaUserTie />
                      )}
                    </div>
                    <div>
                      <div className="dropdown-user-name">{user?.sub || 'Admin'}</div>
                      <div className="dropdown-user-email">{'admin@goldenbamboo.com'}</div>
                      <div className="dropdown-user-role">{getUserRoleDisplay()}</div>
                    </div>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => {
                    if (isAdmin) {
                      navigate('/admin/account');
                    } else if (isManager) {
                      navigate('/manager/account');
                    } else {
                      navigate('/me');
                    }
                  }}
                >
                  <FaUser className="dropdown-icon" />
                  Thông tin tài khoản
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => setShowLogoutModal(true)}
                  className="logout-item"
                >
                  <FaSignOutAlt className="dropdown-icon" />
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </header>

      <ConfirmModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
      />
    </>
  );
}