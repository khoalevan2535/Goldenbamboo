import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "react-bootstrap";

interface RequireRoleProps {
  allowedRoles: string[];
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles }) => {
  // ✅ Lấy user và loading từ context
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  // ✅ Lấy role một cách an toàn từ user
  const userRole = user?.role || 'ROLE_USER';
  const toCanonical = (r: string) => r && r.startsWith('ROLE_') ? r : ({
    admin: 'ROLE_ADMIN',
    manager: 'ROLE_MANAGER',
    'quản lý': 'ROLE_MANAGER',
    'quan ly': 'ROLE_MANAGER',
    staff: 'ROLE_STAFF',
    'nhân viên': 'ROLE_STAFF',
    'nhan vien': 'ROLE_STAFF',
    user: 'ROLE_USER',
    'người dùng': 'ROLE_USER',
    'nguoi dung': 'ROLE_USER'
  }[r.toLowerCase()] || r);
  const canonicalUserRole = toCanonical(userRole);
  const canonicalAllowed = allowedRoles.map(toCanonical);
  const hasRequiredRole = canonicalAllowed.includes(canonicalUserRole);

  if (isAuthenticated && hasRequiredRole) {
    return <Outlet />; // Cho phép truy cập
  }

  if (isAuthenticated && !hasRequiredRole) {
    // Đã đăng nhập nhưng không có quyền, chuyển đến trang "Không có quyền"
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Chưa đăng nhập
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireRole;
