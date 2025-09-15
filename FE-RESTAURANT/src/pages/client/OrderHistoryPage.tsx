import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Alert, Spinner } from 'react-bootstrap';
import { Eye, XCircle, Clock, CheckCircle, Truck, CheckLg, X } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { orderApi, type Order, type OrderItem } from '../../services/orderApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import '../../style/client/OrderHistory.scss';

const OrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [cancelingOrder, setCancelingOrder] = useState<number | null>(null);

    // Function để extract tên khách hàng từ description
    const extractCustomerName = (description: string | undefined): string | null => {
        if (!description) return null;
        const match = description.match(/Khách hàng:\s*(.+?)(?:\s|$)/);
        return match ? match[1].trim() : null;
    };

    useEffect(() => {
        if (user?.accountId) {
            loadUserOrders();
        }
    }, [user?.accountId]);


    const loadUserOrders = async () => {
        try {
            setLoading(true);
            console.log('Loading orders for account ID:', user!.accountId);

            const response = await orderApi.getUserOrders(user!.accountId);
            console.log('API Response:', response);

            if (response.success) {
                console.log('API returned data:', response.data);
                console.log('First order total_amount:', response.data?.[0]?.total_amount);
                console.log('First order created_at:', response.data?.[0]?.created_at);

                // Xử lý dữ liệu từ API
                const processedOrders = response.data.map((order: any) => ({
                    ...order,
                    // Đảm bảo total_amount là số (backend trả về totalAmount)
                    total_amount: parseFloat(order.totalAmount) || parseFloat(order.total_amount) || 0,
                    // Đảm bảo created_at có format đúng (backend trả về createdAt)
                    created_at: order.createdAt || order.created_at || new Date().toISOString(),
                    updated_at: order.updatedAt || order.updated_at || new Date().toISOString(),
                    // Đảm bảo order_items có dữ liệu (backend trả về items)
                    order_items: order.items || order.order_items || []
                }));

                setOrders(processedOrders);
            } else {
                console.error('API returned success=false:', response.message);
                toast.error(response.message || 'Không thể tải danh sách đơn hàng');
                setOrders([]);
            }
        } catch (error: any) {
            console.error('Error loading orders:', error);

            // Hiển thị thông báo lỗi chi tiết hơn
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Có lỗi xảy ra khi tải đơn hàng';

            toast.error(`Lỗi: ${errorMessage}`);
            setOrders([]);

            // Log thêm thông tin để debug
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url
            });

            // Không có dữ liệu khi API thất bại
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            // Chỉ cho phép hủy đơn hàng khi trạng thái là PENDING hoặc CONFIRMED
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
                toast.warning('Không thể hủy đơn hàng ở trạng thái này');
                return;
            }

            // Hiển thị thông báo xác nhận
            const result = await Swal.fire({
                title: 'Xác nhận hủy đơn hàng',
                text: `Bạn có chắc chắn muốn hủy đơn hàng ${orderId}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Có, hủy đơn hàng!',
                cancelButtonText: 'Không, giữ lại',
                reverseButtons: true
            });

            // Nếu người dùng không xác nhận, thoát khỏi function
            if (!result.isConfirmed) {
                return;
            }

            setCancelingOrder(orderId);

            const response = await orderApi.updateOrderStatus(orderId, 'CANCELED');

            if (response.success) {
                // Hiển thị thông báo thành công
                await Swal.fire({
                    title: 'Đã hủy đơn hàng!',
                    text: 'Đơn hàng của bạn đã được hủy thành công.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Cập nhật trạng thái trong state
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: 'CANCELED' }
                            : order
                    )
                );
            } else {
                await Swal.fire({
                    title: 'Lỗi!',
                    text: response.message || 'Không thể hủy đơn hàng',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error: any) {
            console.error('Error canceling order:', error);
            await Swal.fire({
                title: 'Lỗi!',
                text: error.message || 'Có lỗi xảy ra khi hủy đơn hàng',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setCancelingOrder(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'PENDING': { variant: 'warning', text: 'Chờ xử lý', icon: <Clock /> },
            'CONFIRMED': { variant: 'info', text: 'Đã xác nhận', icon: <CheckCircle /> },
            'PREPARING': { variant: 'primary', text: 'Đang chuẩn bị', icon: <Clock /> },
            'READY': { variant: 'success', text: 'Sẵn sàng', icon: <CheckLg /> },
            'DELIVERING': { variant: 'info', text: 'Đang giao', icon: <Truck /> },
            'COMPLETED': { variant: 'success', text: 'Hoàn thành', icon: <CheckLg /> },
            'CANCELED': { variant: 'danger', text: 'Đã hủy', icon: <X /> }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            variant: 'secondary',
            text: status,
            icon: <Clock />
        };

        return (
            <Badge bg={config.variant} className="d-flex align-items-center gap-1">
                {config.icon}
                {config.text}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | string | null | undefined) => {
        if (amount === null || amount === undefined) return '0 ₫';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount) || numAmount === 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(numAmount);
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'Chưa có thông tin';
        try {
            // Xử lý các format date khác nhau
            let date: Date;
            if (dateString.includes('T')) {
                // ISO format
                date = new Date(dateString);
            } else if (dateString.includes(' ')) {
                // SQL datetime format
                date = new Date(dateString.replace(' ', 'T'));
            } else {
                date = new Date(dateString);
            }

            if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Ngày không hợp lệ';
        }
    };

    const canCancelOrder = (status: string) => {
        return ['PENDING', 'CONFIRMED'].includes(status);
    };


    if (!user) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">Vui lòng đăng nhập để xem đơn hàng của bạn.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <h4 className="mb-0">
                                📋 Lịch sử đơn hàng
                            </h4>
                            <small className="text-muted">
                                Xem tất cả đơn hàng đã đặt của bạn
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Đang tải đơn hàng...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-4">
                                    <Clock size={48} className="text-muted mb-3" />
                                    <h5>Chưa có đơn hàng nào</h5>
                                    <p className="text-muted">Hãy đặt món ăn để bắt đầu!</p>
                                </div>
                            ) : (
                                <Table responsive hover>
                                    <thead>
                                        <tr>
                                            <th>Mã đơn hàng</th>
                                            <th>Trạng thái</th>
                                            <th>Tổng tiền</th>
                                            <th>Thời gian đặt</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <strong>{order.order_code || order.id}</strong>
                                                </td>
                                                <td>{getStatusBadge(order.status)}</td>
                                                <td>
                                                    <div className="fw-bold text-primary">
                                                        {formatCurrency(order.total_amount)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <small>{formatDateTime(order.created_at)}</small>
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

                                                        {canCancelOrder(order.status) && (
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                title="Hủy đơn hàng"
                                                                disabled={cancelingOrder === order.id}
                                                            >
                                                                {cancelingOrder === order.id ? (
                                                                    <Spinner animation="border" size="sm" />
                                                                ) : (
                                                                    <XCircle />
                                                                )}
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

            {/* Order Details Modal */}
            <Modal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn hàng {selectedOrder?.order_code || selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin đơn hàng</h6>
                                    <p><strong>Mã đơn hàng:</strong> {selectedOrder.id}</p>
                                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                    <p><strong>Phương thức thanh toán:</strong> {selectedOrder.payment_method}</p>
                                    <p><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Họ tên:</strong> {extractCustomerName(selectedOrder.description) || selectedOrder.customer_name || 'Khách hàng'}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedOrder.customer_phone || 'N/A'}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedOrder.customer_address || 'N/A'}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <h6>Thông tin thanh toán</h6>
                                    <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.total_amount)}</p>
                                    <p><strong>Đã thanh toán trước:</strong> {formatCurrency(selectedOrder.prepay)}</p>
                                </Col>
                            </Row>

                            <h6>Danh sách món ăn</h6>
                            <div className="order-items-summary">
                                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                                    selectedOrder.order_items.map((item, index) => (
                                        <div key={item.id || index} className="order-item-summary mb-3">
                                            <div className="d-flex align-items-center">
                                                {/* Hình ảnh món ăn */}
                                                <div className="item-image me-3">
                                                    <img
                                                        src={item.dish_image || '/images/default-dish.svg'}
                                                        alt={item.name || item.dish_name || 'Món ăn'}
                                                        className="rounded"
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            objectFit: 'cover',
                                                            backgroundColor: '#f8f9fa',
                                                            border: '1px solid #e9ecef'
                                                        }}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/images/default-dish.svg';
                                                        }}
                                                    />
                                                </div>

                                                {/* Thông tin món ăn */}
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 fw-bold">{item.name || item.dish_name || 'Món ăn'}</h6>
                                                    <small className="text-muted d-block">Món lẻ</small>
                                                </div>

                                                {/* Số lượng */}
                                                <div className="quantity-section me-3 text-center">
                                                    <span className="badge bg-light text-dark px-2 py-1">
                                                        x{item.quantity}
                                                    </span>
                                                </div>

                                                {/* Giá */}
                                                <div className="price-section text-end">
                                                    <div className="unit-price text-warning fw-bold mb-1">
                                                        {formatCurrency(item.unit_price || 0)}
                                                    </div>
                                                    <div className="total-price fw-bold text-primary">
                                                        {formatCurrency(item.final_price || item.total_price || (item.unit_price * item.quantity) || 0)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Đường phân cách */}
                                            {index < selectedOrder.order_items.length - 1 && (
                                                <hr className="my-2" style={{ borderColor: '#e9ecef' }} />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-muted text-center py-4">
                                        <i className="fas fa-utensils me-2"></i>
                                        Không có món ăn nào
                                    </div>
                                )}
                            </div>

                            <div className="mt-3">
                                <small className="text-muted">
                                    <strong>Thời gian đặt:</strong> {formatDateTime(selectedOrder.created_at)}
                                </small>
                                {selectedOrder.updated_at !== selectedOrder.created_at && (
                                    <small className="text-muted ms-3">
                                        <strong>Cập nhật lần cuối:</strong> {formatDateTime(selectedOrder.updated_at)}
                                    </small>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default OrderHistoryPage;
