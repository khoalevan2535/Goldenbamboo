import { NavLink, useLocation } from "react-router-dom";
import { 
  FaUtensils, 
  FaLayerGroup, 
  FaTags, 
  FaUsersCog, 
  FaClipboardList,
  FaChartLine,
  FaBoxes,
  FaTachometerAlt,
  FaChair,
  FaClock,
  FaUser
} from "react-icons/fa";
import { useEffect, useState } from "react";
import "./Sidebar.css";
import { ConfirmModal } from "./shared/ConfirmModal";
import { useAuth } from "../hooks/useAuth";

interface ManagerSidebarProps {
  collapsed?: boolean;
}

export default function ManagerSidebar({ collapsed = false }: ManagerSidebarProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const role = user?.role || 'ROLE_USER';
  const canonical = role && role.startsWith('ROLE_') ? role : (role?.toLowerCase() === 'admin' ? 'ROLE_ADMIN' : role?.toLowerCase() === 'manager' ? 'ROLE_MANAGER' : role?.toLowerCase() === 'staff' ? 'ROLE_STAFF' : role?.toLowerCase() === 'user' ? 'ROLE_USER' : role);

  // Cấu trúc sidebar cho Manager - Quản lý chi nhánh độc lập
  const sidebarGroups = [
    {
      title: "Tổng quan chi nhánh",
      items: [
        { path: "/manager/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, roles: ["ROLE_MANAGER"] },
      ]
    },
    {
      title: "Quản lý chi nhánh",
      items: [
        { path: "/manager/categories", label: "Danh mục món ăn", icon: <FaLayerGroup />, roles: ["ROLE_MANAGER"] },
        { path: "/manager/dishes", label: "Món ăn", icon: <FaUtensils />, roles: ["ROLE_MANAGER"] },
        { path: "/manager/combos", label: "Combo", icon: <FaBoxes />, roles: ["ROLE_MANAGER"] },
        { path: "/manager/tables", label: "Quản lý bàn", icon: <FaChair />, roles: ["ROLE_MANAGER"] },
        { path: "/manager/staff", label: "Nhân viên chi nhánh", icon: <FaUsersCog />, roles: ["ROLE_MANAGER"] },
        { path: "/manager/discounts", label: "Giảm giá chi nhánh", icon: <FaTags />, roles: ["ROLE_MANAGER"] },
        { path: "/manager/discounts/history", label: "Lịch sử giảm giá", icon: <FaClock />, roles: ["ROLE_MANAGER"] },
        // { path: "/manager/vouchers", label: "Voucher khách hàng", icon: <FaTags />, roles: ["ROLE_MANAGER"] },
        // { path: "/manager/voucher-history", label: "Lịch sử voucher", icon: <FaHistory />, roles: ["ROLE_MANAGER"] },
      ]
    },
    {
      title: "Báo cáo chi nhánh",
      items: [
        { path: "/manager/analytics", label: "Phân tích chi nhánh", icon: <FaChartLine />, roles: ["ROLE_MANAGER"] },
      ]
    },
    {
      title: "Tài khoản",
      items: [
        { path: "/manager/account", label: "Quản lý tài khoản", icon: <FaUser />, roles: ["ROLE_MANAGER"] },
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
                      end={item.path === "/manager/dashboard"}
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
