import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { 
    Cart3, 
    Eye, 
    CheckCircle, 
    XCircle, 
    Clock,
    Search,
    Filter,
    Receipt,
    CreditCard,
    ArrowClockwise,
    Plus,
    Edit,
    Trash,
    CurrencyDollar
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { StaffOrderService } from '../../services/StaffOrderService';
import { type OrderResponseDTO } from '../../interfaces/OrderResponseDTO';
import { type OrderItemResponseDTO } from '../../interfaces/OrderItemResponseDTO';

interface OrderWithItems extends OrderResponseDTO {
    items: OrderItemResponseDTO[];
}

const StaffOrderManagementPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load orders
    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get today's unpaid orders for the staff's branch
            const todayOrders = await StaffOrderService.getTodayUnpaidOrders(user?.branchId);
            setOrders(todayOrders);
            
        } catch (err: any) {
            console.error('Error loading orders:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [user?.branchId]);

    // Load orders on component mount
    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Filter orders based on search and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === '' || 
            order.id.toString().includes(searchTerm) ||
            order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerPhone?.includes(searchTerm) ||
            order.tableName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PREPARING': return 'info';
            case 'READY_FOR_PICKUP': return 'success';
            case 'COMPLETED': return 'primary';
            case 'PAID': return 'success';
            case 'CANCELED': return 'danger';
            case 'COD_PENDING': return 'secondary';
            default: return 'secondary';
        }
    };

    // Get status display text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PREPARING': return 'Đang chuẩn bị';
            case 'READY_FOR_PICKUP': return 'Sẵn sàng';
            case 'COMPLETED': return 'Hoàn thành';
            case 'PAID': return 'Đã thanh toán';
            case 'CANCELED': return 'Đã hủy';
            case 'COD_PENDING': return 'Chờ thanh toán';
            default: return status;
        }
    };

    // Handle order status update
    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            setIsProcessing(true);
            await StaffOrderService.updateOrderStatus(orderId, newStatus);
            await loadOrders(); // Reload orders
            setShowDetailModal(false);
        } catch (err: any) {
            console.error('Error updating order status:', err);
            setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle payment
    const handlePayment = async (orderId: number, paymentData: any) => {
        try {
            setIsProcessing(true);
            await StaffOrderService.payOrder(orderId, paymentData);
            await loadOrders(); // Reload orders
            setShowPaymentModal(false);
        } catch (err: any) {
            console.error('Error processing payment:', err);
            setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle view order details
    const handleViewOrder = async (orderId: number) => {
        try {
            const order = await StaffOrderService.getOrderById(orderId);
            setSelectedOrder(order as OrderWithItems);
            setShowDetailModal(true);
        } catch (err: any) {
            console.error('Error loading order details:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng');
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải danh sách đơn hàng...</p>
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
                                        <Cart3 className="me-2" />
                                        Quản lý đơn hàng - Staff
                                    </h4>
                                    <small className="text-muted">
                                        Chi nhánh: {user?.branchId || 'N/A'}
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={loadOrders}
                                        disabled={loading}
                                    >
                                        <ArrowClockwise className="me-2" />
                                        Làm mới
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <strong>Lỗi:</strong> {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Row className="mb-4">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn, tên khách, SĐT, bàn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PREPARING">Đang chuẩn bị</option>
                        <option value="READY_FOR_PICKUP">Sẵn sàng</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="CANCELED">Đã hủy</option>
                        <option value="COD_PENDING">Chờ thanh toán</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <div className="d-flex gap-2">
                        <Badge bg="info" className="px-3 py-2">
                            Tổng: {filteredOrders.length} đơn
                        </Badge>
                        <Badge bg="success" className="px-3 py-2">
                            Chưa thanh toán: {filteredOrders.filter(o => o.status !== 'PAID').length}
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Orders Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <Receipt className="me-2" />
                                Danh sách đơn hàng hôm nay
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-5">
                                    <Cart3 size={48} className="text-muted mb-3" />
                                    <h5 className="text-muted">Không có đơn hàng nào</h5>
                                    <p className="text-muted">
                                        {searchTerm || statusFilter !== 'ALL' 
                                            ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                                            : 'Chưa có đơn hàng nào được tạo hôm nay'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Bàn</th>
                                            <th>Khách hàng</th>
                                            <th>Số món</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <strong>#{order.id}</strong>
                                                </td>
                                                <td>
                                                    {order.tableName || 'Tại quầy'}
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">
                                                            {order.customerName || 'Khách hàng tại quầy'}
                                                        </div>
                                                        {order.customerPhone && (
                                                            <small className="text-muted d-block">
                                                                📞 {order.customerPhone}
                                                            </small>
                                                        )}
                                                        {order.voucherCode && (
                                                            <small className="text-info d-block">
                                                                🎫 Voucher: {order.voucherCode}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">
                                                        {order.items?.length || 0} món
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="text-success fw-bold">
                                                        {formatCurrency(order.totalAmount || 0)}
                                                        </div>
                                                        {order.discountAmount && order.discountAmount > 0 && (
                                                            <small className="text-success">
                                                                (Giảm: -{formatCurrency(order.discountAmount)})
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadgeVariant(order.status)}>
                                                        {getStatusText(order.status)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div>
                                                        <small className="text-muted d-block">
                                                            📅 Tạo: {formatDate(order.createdAt || '')}
                                                        </small>
                                                        {order.updatedAt && order.updatedAt !== order.createdAt && (
                                                            <small className="text-info d-block">
                                                                🔄 Cập nhật: {formatDate(order.updatedAt)}
                                                    </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleViewOrder(order.id)}
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye />
                                                        </Button>
                                                        {order.status === 'READY_FOR_PICKUP' && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                                title="Hoàn thành"
                                                            >
                                                                <CheckCircle />
                                                            </Button>
                                                        )}
                                                        {order.status !== 'PAID' && order.status !== 'CANCELED' && (
                                                            <Button
                                                                variant="outline-info"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowPaymentModal(true);
                                                                }}
                                                                title="Thanh toán"
                                                            >
                                                                <CreditCard />
                                                            </Button>
                                                        )}
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

            {/* Order Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Receipt className="me-2" />
                        Chi tiết đơn hàng #{selectedOrder?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            {/* Order Info */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Bàn:</strong> {selectedOrder.tableName || 'Tại quầy'}
                                </Col>
                                <Col md={6}>
                                    <strong>Trạng thái:</strong> 
                                    <Badge bg={getStatusBadgeVariant(selectedOrder.status)} className="ms-2">
                                        {getStatusText(selectedOrder.status)}
                                    </Badge>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Khách hàng:</strong> {selectedOrder.customerName || 'Khách hàng tại quầy'}
                                </Col>
                                <Col md={6}>
                                    <strong>SĐT:</strong> {selectedOrder.customerPhone || 'N/A'}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Thời gian tạo:</strong> {formatDate(selectedOrder.createdAt || '')}
                                </Col>
                                <Col md={6}>
                                    <strong>Tổng tiền:</strong> 
                                    <span className="text-success fw-bold ms-2">
                                        {formatCurrency(selectedOrder.totalAmount || 0)}
                                    </span>
                                </Col>
                            </Row>
                            
                            {/* Voucher/Discount Info */}
                            {(selectedOrder.voucherCode || selectedOrder.discountAmount) && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        {selectedOrder.voucherCode && (
                                            <div>
                                                <strong>Mã voucher:</strong>
                                                <Badge bg="info" className="ms-2">
                                                    {selectedOrder.voucherCode}
                                                </Badge>
                                            </div>
                                        )}
                                    </Col>
                                    <Col md={6}>
                                        {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                                            <div>
                                                <strong>Giảm giá tổng:</strong>
                                                <span className="text-success fw-bold ms-2">
                                                    -{formatCurrency(selectedOrder.discountAmount)}
                                                </span>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            )}
                            
                            {/* Payment Info */}
                            {selectedOrder.paymentMethod && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <strong>Phương thức thanh toán:</strong>
                                        <Badge bg="primary" className="ms-2">
                                            {selectedOrder.paymentMethod === 'CASH' ? 'Tiền mặt' :
                                             selectedOrder.paymentMethod === 'CARD' ? 'Thẻ' :
                                             selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                                             selectedOrder.paymentMethod}
                                        </Badge>
                                    </Col>
                                    <Col md={6}>
                                        {selectedOrder.paymentStatus && (
                                            <div>
                                                <strong>Trạng thái thanh toán:</strong>
                                                <Badge bg={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'} className="ms-2">
                                                    {selectedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </Badge>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            )}

                            {/* Order Items */}
                            <h6 className="mt-4 mb-3">Danh sách món ăn:</h6>
                            <Table responsive size="sm" className="table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Món ăn</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Giảm giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item) => {
                                        const hasDiscount = item.finalPrice && item.finalPrice < item.unitPrice;
                                        const originalPrice = item.originalPrice || item.unitPrice || 0;
                                        const finalPrice = item.finalPrice || originalPrice;
                                        const discountAmount = originalPrice - finalPrice;
                                        
                                        return (
                                        <tr key={item.id}>
                                            <td>
                                                <div>
                                                        <div className="fw-medium">{item.dishName || 'Món ăn'}</div>
                                                        {item.specialInstructions && (
                                                            <small className="text-muted d-block">
                                                                <i>Ghi chú: {item.specialInstructions}</i>
                                                            </small>
                                                        )}
                                                        {item.discountName && (
                                                            <small className="text-success d-block">
                                                                <Badge bg="success" size="sm">
                                                                    🎫 {item.discountName}
                                                                </Badge>
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">
                                                        {item.quantity}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div>
                                                        {hasDiscount ? (
                                                            <>
                                                                <div className="text-decoration-line-through text-muted small">
                                                                    {formatCurrency(originalPrice)}
                                                                </div>
                                                                <div className="text-success fw-bold">
                                                                    {formatCurrency(finalPrice)}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="fw-medium">
                                                                {formatCurrency(originalPrice)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {hasDiscount ? (
                                                        <div>
                                                            <Badge bg="success" size="sm">
                                                                -{formatCurrency(discountAmount)}
                                                            </Badge>
                                                            {item.discountValue && (
                                                                <div className="small text-success">
                                                                    ({item.discountValue}%)
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                            </td>
                                                <td className="fw-bold text-success">
                                                {formatCurrency(item.totalPrice || 0)}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan={4} className="text-end fw-bold">
                                            Tổng cộng:
                                        </td>
                                        <td className="fw-bold text-success fs-5">
                                            {formatCurrency(selectedOrder.totalAmount || 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>

                            {/* Order Summary */}
                            <div className="mt-4 p-3 bg-light rounded">
                                <h6 className="mb-3">Tóm tắt đơn hàng:</h6>
                                <Row>
                                    <Col md={6}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tổng món ăn:</span>
                                            <strong>{selectedOrder.items?.length || 0} món</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tổng số lượng:</span>
                                            <strong>{selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</strong>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Giảm giá:</span>
                                                <strong className="text-success">-{formatCurrency(selectedOrder.discountAmount)}</strong>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold">Tổng thanh toán:</span>
                                            <strong className="text-success fs-5">{formatCurrency(selectedOrder.totalAmount || 0)}</strong>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="mt-3">
                                    <strong>Ghi chú đơn hàng:</strong>
                                    <div className="p-2 bg-light rounded mt-2">
                                        <p className="text-muted mb-0">{selectedOrder.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                    {selectedOrder?.status === 'PENDING' && (
                        <Button 
                            variant="info" 
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'PREPARING')}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Spinner size="sm" /> : 'Bắt đầu chuẩn bị'}
                        </Button>
                    )}
                    {selectedOrder?.status === 'PREPARING' && (
                        <Button 
                            variant="success" 
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'READY_FOR_PICKUP')}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Spinner size="sm" /> : 'Sẵn sàng phục vụ'}
                        </Button>
                    )}
                    {selectedOrder?.status === 'READY_FOR_PICKUP' && (
                        <Button 
                            variant="primary" 
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'COMPLETED')}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Spinner size="sm" /> : 'Hoàn thành'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <CreditCard className="me-2" />
                        Thanh toán đơn hàng #{selectedOrder?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <div className="text-center mb-4">
                                <h4 className="text-success">
                                    {formatCurrency(selectedOrder.totalAmount || 0)}
                                </h4>
                                <p className="text-muted">Số tiền cần thanh toán</p>
                            </div>
                            
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phương thức thanh toán</Form.Label>
                                    <Form.Select>
                                        <option value="CASH">Tiền mặt</option>
                                        <option value="CARD">Thẻ</option>
                                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Số tiền nhận</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập số tiền khách đưa"
                                        min={selectedOrder.totalAmount || 0}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Ghi chú</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Ghi chú thêm (nếu có)"
                                    />
                                </Form.Group>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Hủy
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={() => {
                            // Handle payment logic here
                            handlePayment(selectedOrder?.id || 0, {
                                paymentMethod: 'CASH',
                                amount: selectedOrder?.totalAmount || 0
                            });
                        }}
                        disabled={isProcessing}
                    >
                        {isProcessing ? <Spinner size="sm" /> : 'Xác nhận thanh toán'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StaffOrderManagementPage;