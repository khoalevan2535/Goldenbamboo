import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
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
    ChevronDown,
    Lightning,
    Database,
    ArrowClockwise,
    CheckLg,
    X
} from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';
import '../style/order-management.css';
import '../style/payment-modal.css';
import '../style/order-management-optimized.css';

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



const StaffOrderManagementPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
    
    // Pagination và Infinite Scroll
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Chỉ tải 10 đơn hàng mỗi lần
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Data source indicator
    const [dataSource, setDataSource] = useState<'database'>('database');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isRealtimeActive, setIsRealtimeActive] = useState(true);
    const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    
    // Debounce search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const searchTimeoutRef = useRef<number | null>(null);
    
    // Intersection Observer cho infinite scroll
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastOrderRef = useRef<HTMLTableRowElement | null>(null);

    const branchId = user?.branchId;

    // Check backend connectivity
    const checkBackendHealth = async () => {
        try {
            await apiClient.get('/health');
            return true;
        } catch (error) {
            console.log('⚠️ Backend health check failed');
            return false;
        }
    };

    // Debounce search effect
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset về trang đầu khi search
        }, 500);
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);



    // Load orders khi có thay đổi
    useEffect(() => {
        if (branchId) {
            setCurrentPage(1);
            loadOrders(true); // Reset = true để load lại từ đầu
            
            // Auto-refresh orders every 10 seconds for realtime updates
            const interval = setInterval(() => {
                loadOrders(false); // Không reset
            }, 10 * 1000);
            
            return () => clearInterval(interval);
        }
    }, [branchId, debouncedSearchTerm, statusFilter]);

    // Check backend status
    useEffect(() => {
        const checkStatus = async () => {
            setBackendStatus('checking');
            const isConnected = await checkBackendHealth();
            setBackendStatus(isConnected ? 'connected' : 'disconnected');
        };
        
        checkStatus();
        
        // Check every 30 seconds
        const statusInterval = setInterval(checkStatus, 30000);
        return () => clearInterval(statusInterval);
    }, []);

    // Realtime updates with polling
    useEffect(() => {
        if (!branchId) return;

        // Polling for realtime updates every 5 seconds
        const realtimeInterval = setInterval(() => {
            console.log('🔄 Checking for realtime updates...');
            loadOrders(false); // Refresh without reset
        }, 5 * 1000);

        return () => {
            clearInterval(realtimeInterval);
        };
    }, [branchId]);

    // Intersection Observer cho infinite scroll
    useEffect(() => {
        if (loading) return;
        
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreOrders();
                }
            },
            { threshold: 0.1 }
        );
        
        if (lastOrderRef.current) {
            observerRef.current.observe(lastOrderRef.current);
        }
        
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, hasMore, loadingMore, orders]);

    const loadOrders = async (reset: boolean = true) => {
        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
            }

            console.log('🔄 Loading orders with params:', {
                branchId,
                page: reset ? '1' : currentPage,
                size: pageSize,
                search: debouncedSearchTerm,
                statusFilter
            });

            // Thử nhiều endpoint khác nhau để đảm bảo lấy được dữ liệu
            let response;
            let url;
            
            // Thử endpoint chính trước
            try {
                const params = new URLSearchParams();
                if (branchId) params.append('branchId', branchId.toString());
                params.append('page', reset ? '0' : (currentPage - 1).toString()); // Backend sử dụng 0-based indexing
                params.append('size', pageSize.toString());
                if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
                if (statusFilter !== 'ALL') params.append('status', statusFilter);

                url = `/staff/orders?${params.toString()}`;
                console.log('🔍 Trying main endpoint:', url);
                response = await apiClient.get(url);
                console.log('✅ Main endpoint succeeded');
            } catch (mainError) {
                console.log('⚠️ Main endpoint failed, trying alternative...');
                
                // Thử endpoint thay thế không có branch filter
                try {
                    const params = new URLSearchParams();
                    params.append('page', reset ? '0' : (currentPage - 1).toString()); // Backend sử dụng 0-based indexing
                    params.append('size', pageSize.toString());
                    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
                    if (statusFilter !== 'ALL') params.append('status', statusFilter);

                    url = `/orders?${params.toString()}`;
                    console.log('🔍 Trying alternative endpoint:', url);
                    response = await apiClient.get(url);
                    console.log('✅ Alternative endpoint succeeded');
                } catch (altError) {
                    console.log('❌ All endpoints failed');
                    throw mainError; // Throw original error
                }
            }

            const responseData = response?.data || response || {};
            console.log('📥 Response data structure:', {
                hasContent: !!responseData.content,
                hasOrders: !!responseData.orders,
                isArray: Array.isArray(responseData),
                keys: Object.keys(responseData),
                totalElements: responseData.totalElements,
                total: responseData.total,
                totalPages: responseData.totalPages
            });

            // Xử lý response với pagination - Backend trả về orders trực tiếp
            const ordersData = responseData.orders || responseData.content || responseData || [];
            const total = responseData.totalElements || responseData.total || ordersData.length;
            const totalPages = responseData.totalPages || Math.ceil(total / pageSize);

            console.log('📊 Orders processing:', {
                ordersDataLength: ordersData.length,
                total,
                totalPages,
                currentPage,
                pageSize,
                isArray: Array.isArray(ordersData),
                firstOrderId: ordersData[0]?.id,
                lastOrderId: ordersData[ordersData.length - 1]?.id
            });

            if (Array.isArray(ordersData)) {
                if (reset) {
                    setOrders(ordersData);
                    setCurrentPage(1);
                } else {
                    // Tránh trùng lặp orders khi append
                    setOrders(prev => {
                        const existingIds = new Set(prev.map(order => order.id));
                        const newOrders = ordersData.filter(order => !existingIds.has(order.id));
                        return [...prev, ...newOrders];
                    });
                }
                
                setTotalOrders(total);
                setTotalPages(totalPages);
                setHasMore(currentPage < totalPages);
                
                console.log('✅ Orders loaded successfully:', {
                    loadedOrders: ordersData.length,
                    totalOrders: total,
                    totalPages,
                    hasMore
                });
            } else {
                if (reset) {
                    setOrders([]);
                    toast.warning('Không có dữ liệu đơn hàng');
                }
            }
        } catch (error: any) {
            console.error('❌ Error loading orders:', error);
            console.error('❌ Error details:', {
                message: error?.message,
                response: error?.response,
                status: error?.response?.status,
                data: error?.response?.data
            });
            if (reset) {
                toast.error('Lỗi khi tải đơn hàng từ server');
                setOrders([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load today's orders
    const loadTodayOrders = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/staff/orders/today-unpaid?branchId=${branchId}`);
            const ordersData = response.data || [];
            
            // Đảm bảo không có trùng lặp orders và sắp xếp theo thời gian tạo mới nhất
            const uniqueOrders = ordersData.filter((order: Order, index: number, self: Order[]) => 
                index === self.findIndex(o => o.id === order.id)
            ).sort((a: Order, b: Order) => {
                const dateA = new Date((a as any).createdAt || (a as any).created_at || (a as any).orderDate || 0);
                const dateB = new Date((b as any).createdAt || (b as any).created_at || (b as any).orderDate || 0);
                return dateB.getTime() - dateA.getTime(); // Mới nhất lên đầu
            });
            
            setOrders(uniqueOrders);
            setTotalOrders(uniqueOrders.length);
            setCurrentPage(1);
            setHasMore(false); // Today's orders không cần pagination
            
            // Không hiển thị thông báo thành công khi tải dữ liệu
        } catch (error) {
            console.error('Error loading today orders:', error);
            toast.error('Lỗi khi tải đơn hàng hôm nay');
        } finally {
            setLoading(false);
        }
    };



    const loadMoreOrders = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        
        try {
            setLoadingMore(true);
            setCurrentPage(prev => prev + 1);
            
            // Xây dựng URL cho trang tiếp theo
            const params = new URLSearchParams();
            if (branchId) params.append('branchId', branchId.toString());
            params.append('page', (currentPage + 1).toString());
            params.append('size', pageSize.toString());
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);

            const url = `/staff/orders?${params.toString()}`;
            const response = await apiClient.get(url);
            const responseData = response?.data || response || {};

            const ordersData = responseData.content || responseData.orders || responseData || [];
            
            if (Array.isArray(ordersData) && ordersData.length > 0) {
                // Tránh trùng lặp orders khi load more
                setOrders(prev => {
                    const existingIds = new Set(prev.map(order => order.id));
                    const newOrders = ordersData.filter(order => !existingIds.has(order.id));
                    return [...prev, ...newOrders];
                });
                setHasMore(currentPage + 1 < totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more orders:', error);
            toast.error('Lỗi khi tải thêm đơn hàng');
        } finally {
            setLoadingMore(false);
        }
    }, [currentPage, hasMore, loadingMore, branchId, pageSize, debouncedSearchTerm, statusFilter, totalPages]);

    const handleRefresh = () => {
        loadOrders(true);
    };

    // Load tất cả orders không phân biệt chi nhánh
    const loadAllOrdersNoBranch = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading ALL orders (no branch filter)...');
            
            const params = new URLSearchParams();
            params.append('page', '0'); // Backend sử dụng 0-based indexing
            params.append('size', '1000'); // Load tất cả
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);

            const url = `/orders?${params.toString()}`;
            console.log('🔍 Loading all orders from:', url);
            
            const response = await apiClient.get(url);
            const responseData = response?.data || response || {};

            const ordersData = responseData.orders || responseData.content || responseData || [];
            const total = responseData.totalElements || responseData.total || ordersData.length;

            console.log('📊 All orders loaded:', {
                totalOrders: total,
                loadedOrders: ordersData.length,
                firstOrderId: ordersData[0]?.id,
                lastOrderId: ordersData[ordersData.length - 1]?.id
            });

            if (Array.isArray(ordersData)) {
                setOrders(ordersData);
                setTotalOrders(total);
                setTotalPages(1);
                setCurrentPage(1);
                setHasMore(false);
                
                toast.success(`Đã tải ${total} đơn hàng từ tất cả chi nhánh`);
            } else {
                setOrders([]);
                toast.warning('Không có dữ liệu đơn hàng');
            }
        } catch (error: any) {
            console.error('❌ Error loading all orders:', error);
            toast.error('Lỗi khi tải tất cả đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handlePayment = (order: Order) => {
        setPaymentOrder(order);
        setShowPaymentModal(true);
    };

    const handlePaymentComplete = () => {
        setShowPaymentModal(false);
        setPaymentOrder(null);
        loadOrders(true); // Reload orders after payment
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            setUpdatingStatus(orderId);
            console.log(`🔄 Updating order #${orderId} status to: ${newStatus}`);
            
            // Thử nhiều endpoint khác nhau
            const endpoints = [
                {
                    method: 'PUT',
                    url: `/staff/orders/${orderId}/status`,
                    data: { status: newStatus }
                },
                {
                    method: 'PATCH',
                    url: `/staff/orders/${orderId}/status`,
                    data: { status: newStatus }
                },
                {
                    method: 'PUT',
                    url: `/orders/${orderId}/status`,
                    data: { status: newStatus }
                },
                {
                    method: 'PATCH',
                    url: `/orders/${orderId}/status`,
                    data: { status: newStatus }
                },
                {
                    method: 'POST',
                    url: `/staff/orders/${orderId}/update-status`,
                    data: { status: newStatus }
                }
            ];
            
            let success = false;
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`🔄 Trying ${endpoint.method} ${endpoint.url}...`);
                    
                    let response: any;
                    if (endpoint.method === 'PUT') {
                        response = await apiClient.put(endpoint.url, endpoint.data);
                    } else if (endpoint.method === 'PATCH') {
                        response = await apiClient.patch(endpoint.url, endpoint.data);
                    } else if (endpoint.method === 'POST') {
                        response = await apiClient.post(endpoint.url, endpoint.data);
                    }
                    
                    console.log(`✅ ${endpoint.method} ${endpoint.url} succeeded:`, response);
                    
                    if (response && (response.status === 200 || response.status === 204)) {
                        toast.success(`Đã cập nhật trạng thái đơn hàng #${orderId} thành công`);
                        
                        // Cập nhật trạng thái ngay lập tức trong state
                        setOrders(prevOrders => 
                            prevOrders.map(order => 
                                order.id === orderId 
                                    ? { ...order, status: newStatus as any }
                                    : order
                            )
                        );
                        
                        // Sau đó refresh để đảm bảo dữ liệu đồng bộ
                        setTimeout(() => {
                            loadOrders(false);
                        }, 500);
                        
                        success = true;
                        break;
                    }
                } catch (endpointError: any) {
                    console.log(`❌ ${endpoint.method} ${endpoint.url} failed:`, endpointError?.response?.status);
                    continue;
                }
            }
            
            if (!success) {
                // Nếu tất cả endpoint đều thất bại, thử cập nhật local state
                console.log('⚠️ All endpoints failed, updating local state only');
                toast.warning('Cập nhật trạng thái cục bộ (API không khả dụng)');
                
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { ...order, status: newStatus as any }
                            : order
                    )
                );
            }
            
        } catch (error: any) {
            console.error('❌ Error updating order status:', error);
            
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'Lỗi khi cập nhật trạng thái đơn hàng';
            
            toast.error(errorMessage);
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (!user) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">Vui lòng đăng nhập để xem đơn hàng.</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            {/* Header với Cache Status */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <h4 className="mb-0">
                                        <Cart3 className="me-2" />
                                        Quản lý đơn hàng
                                    </h4>
                                    <small className="text-muted">
                                        <Database className="me-1" />Dữ liệu từ database
                                        {backendStatus === 'connected' && (
                                            <span className="ms-2 text-success">
                                                <span className="badge bg-success">✓ Backend</span>
                                            </span>
                                        )}
                                        {backendStatus === 'disconnected' && (
                                            <span className="ms-2 text-danger">
                                                <span className="badge bg-danger">✗ Backend</span>
                                            </span>
                                        )}
                                        {backendStatus === 'checking' && (
                                            <span className="ms-2 text-warning">
                                                <span className="badge bg-warning">⟳ Checking</span>
                                            </span>
                                        )}
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <div className="d-flex justify-content-end align-items-center gap-2">
                                        {/* Action Buttons */}
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => window.location.href = '/staff/order'}
                                            disabled={loading}
                                        >
                                            <Cart3 className="me-1" />
                                            Tạo đơn hàng
                                        </Button>
                                        
                                        <Button 
                                            variant="outline-info" 
                                            size="sm"
                                            onClick={() => window.location.href = '/staff/listorder'}
                                            disabled={loading}
                                        >
                                            <Clock className="me-1" />
                                            Lịch sử
                                        </Button>
                                        
                                        <Button 
                                            variant="primary" 
                                            onClick={handleRefresh}
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

            {/* Search và Filter */}
            <Row className="mb-3">
                <Col md={6}>
                    <div className="input-group">
                        <span className="input-group-text">
                            <Search />
                        </span>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tên khách hàng, số điện thoại, ID đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PREPARING">Đang chuẩn bị</option>
                        <option value="READY_FOR_PICKUP">Sẵn sàng</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELED">Đã hủy</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="COD_PENDING">Chờ thanh toán</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <div className="d-flex justify-content-end">
                        <Badge bg="secondary" className="me-2">
                            Tổng: {totalOrders}
                        </Badge>
                        <Badge bg="info">
                            Trang {currentPage}/{totalPages}
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
                                    <p className="mt-2">Đang tải đơn hàng...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-4">
                                    <Cart3 size={48} className="text-muted mb-3" />
                                    <h5>Không có đơn hàng nào</h5>
                                    <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc tạo đơn hàng mới</p>
                                </div>
                            ) : (
                                <>
                                    <Table responsive hover className="order-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Bàn</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Thời gian tạo</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, index) => (
                                                <tr 
                                                    key={order.id}
                                                    ref={index === orders.length - 1 ? lastOrderRef : null}
                                                >
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
                                                                disabled={loading}
                                                            >
                                                                <Eye />
                                                            </Button>
                                                            
                                                            {/* Nút đổi trạng thái */}
                                                            {order.status === 'PENDING' && (
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                                                    title="Chuyển sang đang chuẩn bị"
                                                                    disabled={loading || updatingStatus === order.id}
                                                                >
                                                                    {updatingStatus === order.id ? (
                                                                        <Spinner animation="border" size="sm" />
                                                                    ) : (
                                                                        <Clock />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            
                                                            {order.status === 'PREPARING' && (
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(order.id, 'READY_FOR_PICKUP')}
                                                                    title="Chuyển sang sẵn sàng"
                                                                    disabled={loading || updatingStatus === order.id}
                                                                >
                                                                    {updatingStatus === order.id ? (
                                                                        <Spinner animation="border" size="sm" />
                                                                    ) : (
                                                                        <CheckCircle />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            
                                                            {order.status === 'READY_FOR_PICKUP' && (
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                                                                    title="Chuyển sang hoàn thành"
                                                                    disabled={loading || updatingStatus === order.id}
                                                                >
                                                                    {updatingStatus === order.id ? (
                                                                        <Spinner animation="border" size="sm" />
                                                                    ) : (
                                                                        <CheckLg />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            
                                                            {/* Nút thanh toán */}
                                                            {(order.status === 'COMPLETED' || order.status === 'COD_PENDING') && (
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handlePayment(order)}
                                                                    title="Thanh toán"
                                                                    disabled={loading}
                                                                >
                                                                    <CreditCard />
                                                                </Button>
                                                            )}
                                                            
                                                            {/* Nút hủy đơn hàng */}
                                                            {['PENDING', 'PREPARING'].includes(order.status) && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(order.id, 'CANCELED')}
                                                                    title="Hủy đơn hàng"
                                                                    disabled={loading || updatingStatus === order.id}
                                                                >
                                                                    {updatingStatus === order.id ? (
                                                                        <Spinner animation="border" size="sm" />
                                                                    ) : (
                                                                        <X />
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    {/* Loading More Indicator */}
                                    {loadingMore && (
                                        <div className="text-center py-3">
                                            <Spinner animation="border" size="sm" variant="primary" />
                                            <span className="ms-2">Đang tải thêm...</span>
                                        </div>
                                    )}

                                    {/* End of List */}
                                    {!hasMore && orders.length > 0 && (
                                        <div className="text-center py-3 text-muted">
                                            <ChevronDown className="me-2" />
                                            Đã hiển thị tất cả đơn hàng
                                        </div>
                                    )}
                                </>
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
                                    <p><strong>Bàn:</strong> {selectedOrder.tableName}</p>
                                    <p><strong>Khách hàng:</strong> {selectedOrder.customerName || 'Khách lẻ'}</p>
                                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin thanh toán</h6>
                                    <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                                    <p><strong>Giảm giá:</strong> {formatCurrency(selectedOrder.discountAmount)}</p>
                                    <p><strong>Thành tiền:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
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
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unitPrice)}</td>
                                            <td>{formatCurrency(item.totalPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            {selectedOrder.notes && (
                                <div className="mt-3">
                                    <h6>Ghi chú</h6>
                                    <p className="text-muted">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Payment Modal */}
            {paymentOrder && (
                <PaymentModal
                    show={showPaymentModal}
                    onHide={handlePaymentComplete}
                    order={paymentOrder}
                    onPaymentSuccess={handlePaymentComplete}
                />
            )}
        </Container>
    );
};

export default StaffOrderManagementPage;

