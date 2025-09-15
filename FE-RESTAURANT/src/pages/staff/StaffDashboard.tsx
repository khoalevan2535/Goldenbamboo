import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { 
    Cart3, 
    Clock,
    CheckCircle,
    XCircle,
    CurrencyDollar,
    Person,
    GraphUp,
    Eye,
    Plus,
    ArrowRepeat
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import { toast } from 'react-toastify';

interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    todayOrders: number;
    activeTables: number;
}

const StaffDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        activeTables: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    const branchId = user?.branchId;

    useEffect(() => {
        if (branchId) {
            loadDashboardData();
        }
    }, [branchId]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load stats
            const statsResponse = await apiClient.get(`/staff/dashboard/stats?branchId=${branchId}`);
            if (statsResponse) {
                setStats(statsResponse);
            }

            // Load recent orders
            const ordersResponse = await apiClient.get(`/staff/orders/recent?branchId=${branchId}&limit=5`);
            if (ordersResponse && Array.isArray(ordersResponse)) {
                setRecentOrders(ordersResponse);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Lỗi khi tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'PENDING': { variant: 'warning', text: 'Chờ xử lý' },
            'PREPARING': { variant: 'info', text: 'Đang chuẩn bị' },
            'READY_FOR_PICKUP': { variant: 'primary', text: 'Sẵn sàng' },
            'COMPLETED': { variant: 'success', text: 'Hoàn thành' },
            'CANCELED': { variant: 'danger', text: 'Đã hủy' },
            'PAID': { variant: 'success', text: 'Đã thanh toán' },
            'COD_PENDING': { variant: 'warning', text: 'Chờ thanh toán' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải dữ liệu dashboard...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <h4 className="mb-0">
                                        <GraphUp className="me-2" />
                                        Dashboard - Staff
                                    </h4>
                                    <small className="text-muted">
                                        Tổng quan hoạt động chi nhánh
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <div className="d-flex justify-content-end align-items-center gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => window.location.href = '/staff/new/order'}
                                        >
                                            <Plus className="me-1" />
                                            Tạo đơn hàng
                                        </Button>
                                        
                                        <Button 
                                            variant="outline-info" 
                                            size="sm"
                                            onClick={() => window.location.href = '/staff/new/order-management'}
                                        >
                                            <Eye className="me-1" />
                                            Quản lý đơn hàng
                                        </Button>
                                        
                                        <Button 
                                            variant="primary" 
                                            onClick={loadDashboardData}
                                            disabled={loading}
                                        >
                                            <ArrowRepeat className="me-1" />
                                            Làm mới
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={2}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Cart3 size={32} className="text-primary mb-2" />
                            <h5 className="mb-1">{stats.totalOrders}</h5>
                            <small className="text-muted">Tổng đơn hàng</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Clock size={32} className="text-warning mb-2" />
                            <h5 className="mb-1">{stats.pendingOrders}</h5>
                            <small className="text-muted">Chờ xử lý</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <CheckCircle size={32} className="text-success mb-2" />
                            <h5 className="mb-1">{stats.completedOrders}</h5>
                            <small className="text-muted">Hoàn thành</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <CurrencyDollar size={32} className="text-info mb-2" />
                            <h5 className="mb-1">{formatCurrency(stats.totalRevenue)}</h5>
                            <small className="text-muted">Doanh thu</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <GraphUp size={32} className="text-primary mb-2" />
                            <h5 className="mb-1">{stats.todayOrders}</h5>
                            <small className="text-muted">Hôm nay</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Person size={32} className="text-secondary mb-2" />
                            <h5 className="mb-1">{stats.activeTables}</h5>
                            <small className="text-muted">Bàn hoạt động</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders */}
            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <Clock className="me-2" />
                                Đơn hàng gần đây
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-4">
                                    <Cart3 size={48} className="text-muted mb-3" />
                                    <h6>Chưa có đơn hàng nào</h6>
                                    <p className="text-muted">Hãy tạo đơn hàng đầu tiên</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Bàn</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <strong>#{order.id}</strong>
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary">
                                                            {order.tableName || 'Khách lẻ'}
                                                        </Badge>
                                                    </td>
                                                    <td>{getStatusBadge(order.status)}</td>
                                                    <td>
                                                        <strong className="text-primary">
                                                            {formatCurrency(order.totalAmount)}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <small>{formatDateTime(order.createdAt)}</small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <GraphUp className="me-2" />
                                Thao tác nhanh
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary" 
                                    size="lg"
                                    onClick={() => window.location.href = '/staff/new/order'}
                                >
                                    <Plus className="me-2" />
                                    Tạo đơn hàng mới
                                </Button>
                                
                                <Button 
                                    variant="outline-info" 
                                    size="lg"
                                    onClick={() => window.location.href = '/staff/new/order-management'}
                                >
                                    <Eye className="me-2" />
                                    Quản lý đơn hàng
                                </Button>
                                
                                <Button 
                                    variant="outline-secondary" 
                                    size="lg"
                                    onClick={() => window.location.href = '/staff/new/tables'}
                                >
                                    <Person className="me-2" />
                                    Quản lý bàn
                                </Button>
                                
                                <Button 
                                    variant="outline-warning" 
                                    size="lg"
                                    onClick={() => window.location.href = '/staff/new/order-history'}
                                >
                                    <Clock className="me-2" />
                                    Lịch sử đơn hàng
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffDashboard;
