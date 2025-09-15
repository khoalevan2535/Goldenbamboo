import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button, Badge, Dropdown } from 'react-bootstrap';
import { 
    House, 
    Cart3, 
    Clock, 
    People, 
    Gear, 
    Bell, 
    Person,
    BoxArrowRight,
    Speedometer2,
    Receipt,
    Table
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/staff-modern.css';

interface ModernStaffLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const ModernStaffLayout: React.FC<ModernStaffLayoutProps> = ({ 
    children, 
    title = "Staff Dashboard",
    subtitle = "Quản lý nhà hàng hiệu quả"
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState(3);

    const navItems = [
        { 
            path: '/staff/dashboard', 
            icon: <Speedometer2 />, 
            label: 'Dashboard',
            badge: null
        },
        { 
            path: '/staff/orders', 
            icon: <Cart3 />, 
            label: 'Tạo đơn hàng',
            badge: null
        },
        { 
            path: '/staff/order-management', 
            icon: <Receipt />, 
            label: 'Quản lý đơn hàng',
            badge: 5
        },
        { 
            path: '/staff/tables', 
            icon: <Table />, 
            label: 'Quản lý bàn',
            badge: null
        },
        { 
            path: '/staff/customers', 
            icon: <People />, 
            label: 'Khách hàng',
            badge: null
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActivePath = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="staff-container">
            {/* Header */}
            <div className="staff-header">
                <Container fluid>
                    <Row className="align-items-center">
                        <Col>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h1 className="mb-1">
                                        <House className="me-3" />
                                        {title}
                                    </h1>
                                    <p className="subtitle mb-0">
                                        {subtitle} • Chi nhánh: <strong>{user?.branchName || 'Chưa xác định'}</strong>
                                    </p>
                                </div>
                                
                                <div className="d-flex align-items-center gap-3">
                                    {/* Notifications */}
                                    <Button 
                                        variant="outline-light" 
                                        className="position-relative"
                                        onClick={() => navigate('/staff/notifications')}
                                    >
                                        <Bell size={20} />
                                        {notifications > 0 && (
                                            <Badge 
                                                bg="danger" 
                                                className="position-absolute top-0 start-100 translate-middle"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {notifications}
                                            </Badge>
                                        )}
                                    </Button>

                                    {/* User Menu */}
                                    <Dropdown>
                                        <Dropdown.Toggle 
                                            variant="outline-light" 
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <Person size={20} />
                                            <span>{user?.name || user?.sub || 'Staff'}</span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="modern-dropdown">
                                            <Dropdown.Header>
                                                <strong>{user?.name || user?.sub}</strong>
                                                <br />
                                                <small className="text-muted">{user?.role || 'Staff'}</small>
                                            </Dropdown.Header>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={() => navigate('/staff/profile')}>
                                                <Person className="me-2" />
                                                Hồ sơ cá nhân
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => navigate('/staff/settings')}>
                                                <Gear className="me-2" />
                                                Cài đặt
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={handleLogout} className="text-danger">
                                                <BoxArrowRight className="me-2" />
                                                Đăng xuất
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Content */}
            <Container fluid className="py-4">
                <Row>
                    {/* Sidebar Navigation */}
                    <Col lg={3} xl={2} className="mb-4">
                        <div className="modern-card">
                            <div className="p-3">
                                <Nav className="flex-column nav-modern">
                                    {navItems.map((item, index) => (
                                        <Nav.Item key={index}>
                                            <Nav.Link
                                                href={item.path}
                                                active={isActivePath(item.path)}
                                                className="d-flex align-items-center justify-content-between py-3"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(item.path);
                                                }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <span className="me-3">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge && (
                                                    <Badge bg="primary" className="badge-modern">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="modern-card mt-4">
                            <div className="p-3">
                                <h6 className="fw-bold mb-3">Thống kê nhanh</h6>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Đơn hàng hôm nay:</span>
                                    <Badge bg="success">12</Badge>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Đang chờ:</span>
                                    <Badge bg="warning">3</Badge>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Bàn trống:</span>
                                    <Badge bg="info">8</Badge>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Main Content Area */}
                    <Col lg={9} xl={10}>
                        <div className="fade-in">
                            {children}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Button 
                    className="quick-action-btn"
                    onClick={() => navigate('/staff/orders')}
                    title="Tạo đơn hàng mới"
                >
                    <Cart3 size={24} />
                </Button>
                <Button 
                    className="quick-action-btn"
                    onClick={() => navigate('/staff/order-management')}
                    title="Quản lý đơn hàng"
                >
                    <Receipt size={24} />
                </Button>
                <Button 
                    className="quick-action-btn"
                    onClick={() => navigate('/staff/tables')}
                    title="Quản lý bàn"
                >
                    <Table size={24} />
                </Button>
            </div>
        </div>
    );
};

export default ModernStaffLayout;




