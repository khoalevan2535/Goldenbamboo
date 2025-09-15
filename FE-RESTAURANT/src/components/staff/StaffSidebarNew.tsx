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
  FaShoppingCart,
  FaHistory,
  FaListAlt
} from "react-icons/fa";
import { useEffect, useState } from "react";
import "../Sidebar.css";
import { ConfirmModal } from "../shared/ConfirmModal";
import { useAuth } from "../../hooks/useAuth";

interface StaffSidebarNewProps {
  collapsed?: boolean;
}

export default function StaffSidebarNew({ collapsed = false }: StaffSidebarNewProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const role = user?.role || 'ROLE_USER';
  const canonical = role && role.startsWith('ROLE_') ? role : (role?.toLowerCase() === 'admin' ? 'ROLE_ADMIN' : role?.toLowerCase() === 'manager' ? 'ROLE_MANAGER' : role?.toLowerCase() === 'staff' ? 'ROLE_STAFF' : role?.toLowerCase() === 'user' ? 'ROLE_USER' : role);

  // Cấu trúc sidebar cho Staff - Chỉ giữ lại chức năng cần thiết
  const sidebarGroups = [
    {
      title: "Tổng quan",
      items: [
        { path: "/staff/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, roles: ["ROLE_STAFF"] },
      ]
    },
    {
      title: "Quản lý đơn hàng",
      items: [
        { path: "/staff/order", label: "Tạo đơn hàng", icon: <FaShoppingCart />, roles: ["ROLE_STAFF"] },
        { path: "/staff/order-management", label: "Quản lý đơn hàng", icon: <FaListAlt />, roles: ["ROLE_STAFF"] },
        { path: "/staff/order-history", label: "Lịch sử đơn hàng", icon: <FaHistory />, roles: ["ROLE_STAFF"] },
      ]
    },
    {
      title: "Quản lý món ăn",
      items: [
        { path: "/staff/dishes", label: "Danh sách món ăn", icon: <FaUtensils />, roles: ["ROLE_STAFF"] },
        { path: "/staff/combos", label: "Danh sách combo", icon: <FaBoxes />, roles: ["ROLE_STAFF"] },
      ]
    },
    {
      title: "Kiểm tra discount",
      items: [
        { path: "/staff/discount-check", label: "Kiểm tra discount", icon: <FaTags />, roles: ["ROLE_STAFF"] },
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
                      end={item.path === "/staff/order"}
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
