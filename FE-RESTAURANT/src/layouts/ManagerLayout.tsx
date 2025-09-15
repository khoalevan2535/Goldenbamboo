import { Outlet } from "react-router-dom";
import { useState } from "react";
import ManagerSidebar from "../components/ManagerSidebar";
import Header from "../components/Header";
import "./AdminLayout.css"; // Sử dụng chung CSS với AdminLayout

export default function ManagerLayout() {
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
        <ManagerSidebar collapsed={sidebarCollapsed} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
