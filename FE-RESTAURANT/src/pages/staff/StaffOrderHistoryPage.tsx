import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, InputGroup, Pagination } from 'react-bootstrap';
import { 
    Clock, 
    Search, 
    Eye, 
    PencilSquare, 
    CheckCircle, 
    XCircle,
    Calendar,
    Person,
    Phone,
    Receipt,
    CurrencyDollar,
    Filter
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { StaffOrderService } from '../../services/StaffOrderService';
import { TableService } from '../../services/TableService';
import { toast } from 'react-toastify';

interface OrderItem {
    id: number;
    dishId?: number;
    comboId?: number;
    dishName?: string;
    comboName?: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
}

interface Order {
    id: number;
    tableId?: number;
    tableName?: string;
    customerName: string;
    customerPhone?: string;
    notes?: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    specialInstructions?: string;
}

interface OrderPage {
    content: Order[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

const StaffOrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [dateFilter, setDateFilter] = useState('');
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Edit form states
    const [editForm, setEditForm] = useState({
        customerName: '',
        customerPhone: '',
        notes: '',
        status: 'PENDING' as string,
        tableId: null as number | null
    });
    
    const [tables, setTables] = useState<any[]>([]);

    // Load tables for the branch
    const loadTables = useCallback(async () => {
        if (user?.branchId) {
            try {
                const tablesData = await TableService.getTablesByBranch(user.branchId);
                setTables(tablesData);
            } catch (error) {
                console.error('Error loading tables:', error);
            }
        }
    }, [user?.branchId]);

    // Load orders
    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Load tất cả orders trước, sau đó filter client-side
            const params = {
                page: 0,
                size: 1000, // Load tất cả orders
            };
            
            console.log('Loading orders with params:', params);
            const response = await StaffOrderService.getOrders(params);
            console.log('Orders response:', response);
            
            // Backend trả về {orders: [...], totalElements, totalPages, currentPage, size}
            // Frontend expect {content: [...], totalElements, totalPages, number, size}
            let filteredOrders = response.orders || [];
            
            // Client-side filtering (tạm thời cho đến khi backend hỗ trợ)
            if (searchTerm) {
                filteredOrders = filteredOrders.filter(order => 
                    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.id.toString().includes(searchTerm)
                );
            }
            
            if (statusFilter !== 'ALL') {
                filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
            }
            
            if (dateFilter) {
                const filterDate = new Date(dateFilter).toDateString();
                filteredOrders = filteredOrders.filter(order => 
                    new Date(order.createdAt).toDateString() === filterDate
                );
            }
            
            // Client-side pagination
            const startIndex = currentPage * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredOrders.length / pageSize);
            
            setOrders(paginatedOrders);
            setTotalPages(totalPages);
            setTotalElements(filteredOrders.length);
            
        } catch (err: any) {
            console.error('Error loading orders:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, statusFilter, dateFilter]);

    // Load data on component mount and when filters change
    useEffect(() => {
        loadTables();
    }, [loadTables]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Handle search
    const handleSearch = () => {
        setCurrentPage(0);
        // loadOrders sẽ được gọi tự động do useEffect dependency
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'CONFIRMED': return 'info';
            case 'PREPARING': return 'primary';
            case 'READY': return 'success';
            case 'DELIVERED': return 'dark';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'PREPARING': return 'Đang chuẩn bị';
            case 'READY': return 'Sẵn sàng';
            case 'DELIVERED': return 'Đã giao';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    // Handle view order details
    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    // Handle edit order
    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order);
        setEditForm({
            customerName: order.customerName,
            customerPhone: order.customerPhone || '',
            notes: order.notes || '',
            status: order.status,
            tableId: order.tableId || null
        });
        setShowEditModal(true);
    };

    // Handle update order
    const handleUpdateOrder = async () => {
        if (!selectedOrder) return;

        try {
            setIsUpdating(true);
            
            const updateData = {
                customerName: editForm.customerName,
                customerPhone: editForm.customerPhone || null,
                notes: editForm.notes || null,
                status: editForm.status,
                tableId: editForm.tableId
            };

            await StaffOrderService.updateOrder(selectedOrder.id, updateData);
            
            toast.success('Cập nhật đơn hàng thành công!');
            setShowEditModal(false);
            setSelectedOrder(null);
            loadOrders(); // Refresh the list
            
        } catch (err: any) {
            console.error('Error updating order:', err);
            toast.error(err.message || 'Có lỗi xảy ra khi cập nhật đơn hàng');
        } finally {
            setIsUpdating(false);
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

    if (loading && orders.length === 0) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải lịch sử đơn hàng...</p>
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
                                        <Clock className="me-2" />
                                        Lịch sử đơn hàng - Staff
                                    </h4>
                                    <small className="text-muted">
                                        Chi nhánh: {user?.branchId || 'N/A'} | Tổng: {totalElements} đơn hàng
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={loadOrders}
                                        disabled={loading}
                                    >
                                        <Clock className="me-2" />
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
                <Col md={3}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </InputGroup>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="PREPARING">Đang chuẩn bị</option>
                        <option value="READY">Sẵn sàng</option>
                        <option value="DELIVERED">Đã giao</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Button variant="primary" onClick={handleSearch} disabled={loading}>
                        <Filter className="me-2" />
                        Lọc
                    </Button>
                </Col>
            </Row>

            {/* Orders Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <Receipt className="me-2" />
                                Danh sách đơn hàng
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {orders.length === 0 ? (
                                <div className="text-center py-5">
                                    <Clock size={48} className="text-muted mb-3" />
                                    <h5 className="text-muted">Không có đơn hàng nào</h5>
                                    <p className="text-muted">
                                        {searchTerm || statusFilter !== 'ALL' || dateFilter
                                            ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                                            : 'Chưa có đơn hàng nào trong chi nhánh'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table responsive hover className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách hàng</th>
                                                <th>Bàn</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Thời gian</th>
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
                                                        <div>
                                                            <div className="fw-medium">{order.customerName}</div>
                                                            {order.customerPhone && (
                                                                <small className="text-muted">
                                                                    <Phone className="me-1" size={12} />
                                                                    {order.customerPhone}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {order.tableName ? (
                                                            <Badge bg="info">Bàn {order.tableName}</Badge>
                                                        ) : (
                                                            <span className="text-muted">Không chọn bàn</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Badge bg={getStatusBadgeVariant(order.status)}>
                                                            {getStatusText(order.status)}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <strong className="text-success">
                                                            {formatCurrency(order.totalAmount)}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="small">
                                                                <Calendar className="me-1" size={12} />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button
                                                                variant="outline-info"
                                                                size="sm"
                                                                onClick={() => handleViewOrder(order)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye />
                                                            </Button>
                                                            <Button
                                                                variant="outline-warning"
                                                                size="sm"
                                                                onClick={() => handleEditOrder(order)}
                                                                title="Chỉnh sửa"
                                                            >
                                                                <PencilSquare />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center p-3">
                                            <Pagination>
                                                <Pagination.First 
                                                    onClick={() => handlePageChange(0)}
                                                    disabled={currentPage === 0}
                                                />
                                                <Pagination.Prev 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 0}
                                                />
                                                
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                                    return (
                                                        <Pagination.Item
                                                            key={page}
                                                            active={page === currentPage}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page + 1}
                                                        </Pagination.Item>
                                                    );
                                                })}
                                                
                                                <Pagination.Next 
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages - 1}
                                                />
                                                <Pagination.Last 
                                                    onClick={() => handlePageChange(totalPages - 1)}
                                                    disabled={currentPage === totalPages - 1}
                                                />
                                            </Pagination>
                                        </div>
                                    )}
                                </>
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
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                                    {selectedOrder.customerPhone && (
                                        <p><strong>SĐT:</strong> {selectedOrder.customerPhone}</p>
                                    )}
                                    {selectedOrder.tableName && (
                                        <p><strong>Bàn:</strong> Bàn {selectedOrder.tableName}</p>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin đơn hàng</h6>
                                    <p><strong>Trạng thái:</strong> 
                                        <Badge bg={getStatusBadgeVariant(selectedOrder.status)} className="ms-2">
                                            {getStatusText(selectedOrder.status)}
                                        </Badge>
                                    </p>
                                    <p><strong>Tổng tiền:</strong> 
                                        <span className="text-success fw-bold ms-2">
                                            {formatCurrency(selectedOrder.totalAmount)}
                                        </span>
                                    </p>
                                    <p><strong>Thời gian:</strong> {formatDate(selectedOrder.createdAt)}</p>
                                </Col>
                            </Row>

                            {/* Order Items */}
                            <h6>Chi tiết món ăn</h6>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Món ăn</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">
                                                        {item.dishName || item.comboName}
                                                    </div>
                                                    {item.specialInstructions && (
                                                        <small className="text-muted">
                                                            {item.specialInstructions}
                                                        </small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unitPrice)}</td>
                                            <td>{formatCurrency(item.unitPrice * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="mt-3">
                                    <h6>Ghi chú</h6>
                                    <p className="text-muted">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Order Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <PencilSquare className="me-2" />
                        Chỉnh sửa đơn hàng #{selectedOrder?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên khách hàng</Form.Label>
                            <Form.Control
                                type="text"
                                value={editForm.customerName}
                                onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                value={editForm.customerPhone}
                                onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                                placeholder="Nhập số điện thoại (tùy chọn)"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bàn</Form.Label>
                            <Form.Select
                                value={editForm.tableId || ''}
                                onChange={(e) => setEditForm({...editForm, tableId: e.target.value ? Number(e.target.value) : null})}
                            >
                                <option value="">Không chọn bàn</option>
                                {tables.map(table => (
                                    <option key={table.id} value={table.id}>
                                        Bàn {table.name} - {table.seats} chỗ
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={editForm.status}
                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            >
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="CONFIRMED">Đã xác nhận</option>
                                <option value="PREPARING">Đang chuẩn bị</option>
                                <option value="READY">Sẵn sàng</option>
                                <option value="DELIVERED">Đã giao</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editForm.notes}
                                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                placeholder="Nhập ghi chú (tùy chọn)"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpdateOrder}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="me-2" />
                                Cập nhật
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StaffOrderHistoryPage;
