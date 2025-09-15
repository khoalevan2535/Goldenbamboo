import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { 
    Clock, 
    Search, 
    Filter, 
    Eye, 
    Calendar,
    Receipt,
    ArrowClockwise,
    Download,
    Printer
} from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

interface OrderItem {
    id: number;
    dishId?: number;
    comboId?: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

interface Order {
    id: number;
    tableId: number;
    tableName: string;
    customerName?: string;
    customerPhone?: string;
    status: 'PENDING' | 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELED' | 'PAID' | 'COD_PENDING';
    items: OrderItem[];
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    notes?: string;
}

const StaffOrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [dateFilter, setDateFilter] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const branchId = user?.branchId;

    // Load order history
    const loadOrderHistory = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading order history...');

            const params = new URLSearchParams();
            if (branchId) params.append('branchId', branchId.toString());
            params.append('page', '0');
            params.append('size', '1000'); // Load all history
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);
            if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
            if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);

            // Try multiple endpoints
            let response;
            try {
                response = await apiClient.get(`/staff/orders/history?${params.toString()}`);
            } catch (error) {
                // Fallback to regular orders endpoint
                response = await apiClient.get(`/orders?${params.toString()}`);
            }

            const responseData = response?.data || response || {};
            const ordersData = responseData.orders || responseData.content || responseData || [];

            if (Array.isArray(ordersData)) {
                // Sort by creation date (newest first)
                const sortedOrders = ordersData.sort((a: Order, b: Order) => {
                    const dateA = new Date(a.createdAt || a.created_at || 0);
                    const dateB = new Date(b.createdAt || b.created_at || 0);
                    return dateB.getTime() - dateA.getTime();
                });

                setOrders(sortedOrders);
                setTotalOrders(sortedOrders.length);
                
                // Calculate total revenue
                const revenue = sortedOrders.reduce((sum: number, order: Order) => {
                    return sum + (order.totalAmount || 0);
                }, 0);
                setTotalRevenue(revenue);

                console.log('✅ Order history loaded:', {
                    totalOrders: sortedOrders.length,
                    totalRevenue: revenue
                });
            } else {
                setOrders([]);
                setTotalOrders(0);
                setTotalRevenue(0);
            }
        } catch (error: any) {
            console.error('❌ Error loading order history:', error);
            toast.error('Lỗi khi tải lịch sử đơn hàng');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount and when filters change
    useEffect(() => {
        if (branchId) {
            loadOrderHistory();
        }
    }, [branchId, searchTerm, statusFilter, dateFilter]);

    // Get status badge
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

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date time
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Handle view details
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // Export to CSV (placeholder)
    const handleExport = () => {
        toast.info('Chức năng xuất file sẽ được phát triển');
    };

    // Print order (placeholder)
    const handlePrint = () => {
        toast.info('Chức năng in sẽ được phát triển');
    };

    if (!user) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">Vui lòng đăng nhập để xem lịch sử đơn hàng.</Alert>
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
                                        <Clock className="me-2" />
                                        Lịch sử đơn hàng
                                    </h4>
                                    <small className="text-muted">
                                        Tổng {totalOrders} đơn hàng • Doanh thu: {formatCurrency(totalRevenue)}
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <div className="d-flex justify-content-end align-items-center gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => window.location.href = '/staff/order'}
                                        >
                                            <Receipt className="me-1" />
                                            Tạo đơn hàng
                                        </Button>
                                        
                                        <Button 
                                            variant="outline-success" 
                                            size="sm"
                                            onClick={handleExport}
                                        >
                                            <Download className="me-1" />
                                            Xuất file
                                        </Button>
                                        
                                        <Button 
                                            variant="primary" 
                                            onClick={loadOrderHistory}
                                            disabled={loading}
                                        >
                                            <ArrowClockwise className="me-1" />
                                            Làm mới
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-3">
                <Col md={3}>
                    <div className="input-group">
                        <span className="input-group-text">
                            <Search />
                        </span>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo ID, tên khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="CANCELED">Đã hủy</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PREPARING">Đang chuẩn bị</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                </Col>
                <Col md={3}>
                    <div className="d-flex justify-content-end">
                        <Badge bg="info" className="me-2">
                            {totalOrders} đơn hàng
                        </Badge>
                        <Badge bg="success">
                            {formatCurrency(totalRevenue)}
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Orders Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Đang tải lịch sử đơn hàng...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-4">
                                    <Clock size={48} className="text-muted mb-3" />
                                    <h5>Không có đơn hàng nào</h5>
                                    <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc tạo đơn hàng mới</p>
                                </div>
                            ) : (
                                <Table responsive hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Bàn</th>
                                            <th>Khách hàng</th>
                                            <th>Trạng thái</th>
                                            <th>Tổng tiền</th>
                                            <th>Thời gian tạo</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <strong>#{order.id}</strong>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">
                                                        {order.tableName || 'Khách lẻ'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div>{order.customerName || 'Khách lẻ'}</div>
                                                        {order.customerPhone && (
                                                            <small className="text-muted">{order.customerPhone}</small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{getStatusBadge(order.status)}</td>
                                                <td>
                                                    <div className="fw-bold text-primary">
                                                        {formatCurrency(order.totalAmount)}
                                                    </div>
                                                    {order.discountAmount > 0 && (
                                                        <small className="text-success">
                                                            -{formatCurrency(order.discountAmount)}
                                                        </small>
                                                    )}
                                                </td>
                                                <td>
                                                    <small>{formatDateTime(order.createdAt)}</small>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(order)}
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye />
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={handlePrint}
                                                            title="In đơn hàng"
                                                        >
                                                            <Printer />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Order Details Modal */}
            <Modal 
                show={showDetailsModal} 
                onHide={() => setShowDetailsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn hàng #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin đơn hàng</h6>
                                    <p><strong>Bàn:</strong> {selectedOrder.tableName || 'Khách lẻ'}</p>
                                    <p><strong>Khách hàng:</strong> {selectedOrder.customerName || 'Khách lẻ'}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedOrder.customerPhone || 'N/A'}</p>
                                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin thanh toán</h6>
                                    <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                                    <p><strong>Giảm giá:</strong> {formatCurrency(selectedOrder.discountAmount)}</p>
                                    <p><strong>Thành tiền:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                                    <p><strong>Thời gian tạo:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                                </Col>
                            </Row>
                            
                            <h6>Danh sách món ăn</h6>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>Món</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div>
                                                    <div>{item.name}</div>
                                                    {item.notes && (
                                                        <small className="text-muted">Ghi chú: {item.notes}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unitPrice)}</td>
                                            <td>{formatCurrency(item.totalPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            {selectedOrder.notes && (
                                <div className="mt-3">
                                    <h6>Ghi chú đơn hàng</h6>
                                    <p className="text-muted">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handlePrint}>
                        <Printer className="me-1" />
                        In đơn hàng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StaffOrderHistoryPage;
