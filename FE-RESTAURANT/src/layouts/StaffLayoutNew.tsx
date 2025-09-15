import { Outlet } from "react-router-dom";
import { useState } from "react";
import StaffSidebarNew from "../components/staff/StaffSidebarNew";
import Header from "../components/Header";
import "./AdminLayout.css"; // Sử dụng chung CSS với AdminLayout

export default function StaffLayoutNew() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <Header 
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Container cho sidebar và content */}
      <div className="admin-container">
        <StaffSidebarNew collapsed={sidebarCollapsed} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

