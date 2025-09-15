import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from '../components/staff/StaffSidebar';
import { useAuth } from '../hooks/useAuth';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import '../style/staff-layout-improved.css';

const StaffLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Header */}
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    zIndex: 1000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={toggleSidebar}
                            className="hamburger-btn"
                        >
                            <span className="hamburger-icon">☰</span>
                        </button>
                        <div className="logo-section">
                            <img
                                src="/logoGoldenBamboo.png"
                                alt="Golden Bamboo Logo"
                                className="header-logo"
                            />
                            <h3 className="header-title">Golden Bamboo Staff</h3>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Tìm kiếm món ăn, đơn hàng..."
                                className="header-search"
                            />
                        </div>

                        <div className="user-section">
                            <span className="user-name">{user?.sub || 'Staff'}</span>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                style={{
                    position: 'fixed',
                    left: sidebarOpen ? 0 : '-280px',
                    top: '60px',
                    width: '280px',
                    height: 'calc(100vh - 60px)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRight: '1px solid #e9ecef',
                    transition: 'left 0.3s ease',
                    zIndex: 999,
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                }}
            >
                <StaffSidebar onClose={closeSidebar} />
            </aside>

            {/* Main Content */}
            <main
                style={{
                    marginLeft: sidebarOpen ? '280px' : 0,
                    marginTop: '60px',
                    flex: 1,
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: '#f8f9fa',
                    minHeight: 'calc(100vh - 60px)',
                }}
            >
                <Outlet />
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <ConfirmModal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                onConfirm={handleConfirmLogout}
                title="Xác nhận đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
            />
        </div>
    );
};

export default StaffLayout;
