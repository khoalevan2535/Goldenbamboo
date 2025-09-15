import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface StaffSidebarProps {
    onClose?: () => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = () => {
        if (onClose && window.innerWidth <= 991.98) {
            onClose();
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* User Profile Section */}
            <div style={{ 
                padding: '15px', 
                borderBottom: '1px solid #ddd', 
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>👤</div>
                <h6 style={{ margin: '0 0 5px 0' }}>{user?.sub || 'Staff User'}</h6>
                <small style={{ color: '#666' }}>Chi nhánh {user?.branchId || 'N/A'}</small>
                <div style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontSize: '12px',
                    marginTop: '5px',
                    display: 'inline-block'
                }}>
                    Online
                </div>
            </div>

            {/* Navigation Menu - Simplified for 3 main functions */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        color: '#666', 
                        marginBottom: '15px',
                        textTransform: 'uppercase',
                        textAlign: 'center'
                    }}>
                        CHỨC NĂNG CHÍNH
                    </div>
                    
                    {/* Order Creation */}
                    <NavLink 
                        to="/staff/order" 
                        onClick={handleNavClick}
                        style={{
                            display: 'block',
                            padding: '15px 20px',
                            textDecoration: 'none',
                            color: isActive('/staff/order') ? '#007bff' : '#333',
                            backgroundColor: isActive('/staff/order') ? '#e3f2fd' : 'transparent',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            border: isActive('/staff/order') ? '2px solid #007bff' : '2px solid transparent',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Tạo đơn hàng</div>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Order mới</div>
                        </div>
                    </NavLink>

                    {/* Order History */}
                    <NavLink 
                        to="/staff/listorder" 
                        onClick={handleNavClick}
                        style={{
                            display: 'block',
                            padding: '15px 20px',
                            textDecoration: 'none',
                            color: isActive('/staff/listorder') ? '#007bff' : '#333',
                            backgroundColor: isActive('/staff/listorder') ? '#e3f2fd' : 'transparent',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            border: isActive('/staff/listorder') ? '2px solid #007bff' : '2px solid transparent',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Lịch sử đơn hàng</div>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Order history</div>
                        </div>
                    </NavLink>

                    {/* Table Management */}
                    <NavLink 
                        to="/staff/tables" 
                        onClick={handleNavClick}
                        style={{
                            display: 'block',
                            padding: '15px 20px',
                            textDecoration: 'none',
                            color: isActive('/staff/tables') ? '#007bff' : '#333',
                            backgroundColor: isActive('/staff/tables') ? '#e3f2fd' : 'transparent',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            border: isActive('/staff/tables') ? '2px solid #007bff' : '2px solid transparent',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🪑</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Danh sách bàn</div>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Table management</div>
                        </div>
                    </NavLink>
                </div>
            </div>

            {/* Logout Button */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button 
                    onClick={handleLogout} 
                    style={{
                        width: '100%',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🚪 Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default StaffSidebar;