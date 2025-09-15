import { NavLink, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaUtensils, 
  FaList, 
  FaLayerGroup, 
  FaTags, 
  FaStore, 
  FaUser, 
  FaSignOutAlt, 
  FaUsersCog, 
  FaChartBar, 
  FaLink, 
  FaEye,
  FaClipboardList,
  FaChair,
  FaCog,
  FaBell,
  FaUserTie,
  FaShieldAlt,
  FaChartLine,
  FaBoxes,
  FaTachometerAlt,
  FaCogs,
  FaShoppingCart,
  FaBullhorn,
  FaHistory,
  FaClock
} from "react-icons/fa";
import { useEffect, useState } from "react";
import "./Sidebar.css";
import { ConfirmModal } from "./shared/ConfirmModal";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../utils/apiClient";
import { NotificationCenter } from "./shared/NotificationCenter";

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const role = user?.role || 'ROLE_USER';
  const canonical = role && role.startsWith('ROLE_') ? role : (role?.toLowerCase() === 'admin' ? 'ROLE_ADMIN' : role?.toLowerCase() === 'manager' ? 'ROLE_MANAGER' : role?.toLowerCase() === 'staff' ? 'ROLE_STAFF' : role?.toLowerCase() === 'user' ? 'ROLE_USER' : role);
  const isAdmin = canonical === "ROLE_ADMIN";
  const isManager = canonical === "ROLE_MANAGER";
  // Logic approval đã bị xóa
  const location = useLocation();

  // useEffect approval đã bị xóa

  // useEffect approval đã bị xóa

  // Cấu trúc sidebar với nhóm menu - Admin chỉ quản lý tổng quan hệ thống
  const sidebarGroups = [
    {
      title: "Tổng quan",
      items: [
        { path: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, roles: ["ROLE_ADMIN"] },
      ]
    },
    {
      title: "Quản lý hệ thống",
      items: [
        { path: "/admin/staff", label: "Quản lý nhân viên", icon: <FaUsersCog />, roles: ["ROLE_ADMIN"] },
        { path: "/admin/users", label: "Quản lý người dùng", icon: <FaUserTie />, roles: ["ROLE_ADMIN"] },
        { path: "/admin/branches", label: "Quản lý chi nhánh", icon: <FaStore />, roles: ["ROLE_ADMIN"] },
      ]
    },
    {
      title: "Báo cáo & Thống kê",
      items: [
        { path: "/admin/discounts/history", label: "Lịch sử giảm giá", icon: <FaClock />, roles: ["ROLE_ADMIN"] },
        // { path: "/admin/voucher-history", label: "Lịch sử voucher", icon: <FaHistory />, roles: ["ROLE_ADMIN"] },
      ]
    }
  ];

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Navigation */}
      <div className="sidebar-nav">
        {sidebarGroups.map((group, groupIndex) => {
          // Lọc items theo role
          const filteredItems = group.items.filter(item => 
            item.roles.includes(canonical)
          );

          // Chỉ hiển thị group nếu có ít nhất 1 item
          if (filteredItems.length === 0) return null;

          return (
            <div key={groupIndex} className="sidebar-group">
              <div className="nav-items">
                {filteredItems.map((item) => {
                  return (
                    <NavLink
                      to={item.path}
                      key={item.path}
                      end={item.path === "/admin/dashboard"}
                      className="nav-item"
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="nav-item-content">
                        <div className="nav-item-icon">{item.icon}</div>
                        <span className="nav-item-label">{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
      />
    </div>
  );
}
