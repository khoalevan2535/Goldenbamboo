import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { 
    CupHot, 
    Search, 
    Eye, 
    CheckCircle, 
    XCircle, 
    ExclamationTriangle,
    ArrowClockwise,
    Filter
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { useCategories } from '../../hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import apiClient from '../../utils/apiClient';

interface DishWithAvailability {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    image?: string;
    categoryId: number;
    categoryName: string;
    operationalStatus: 'ACTIVE' | 'INACTIVE';
    availabilityStatus: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
}

const StaffDishesPage: React.FC = () => {
    const { user } = useAuth();
    const [dishes, setDishes] = useState<DishWithAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
    const [selectedDish, setSelectedDish] = useState<DishWithAvailability | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Use hooks for data fetching
    const { dishPage, loading: dishesLoading, fetchDishes, fetchDishesForStaff } = useDishes();
    const { categoryPage, loading: categoriesLoading, fetchCategories } = useCategories();
    
    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Load categories first
            await fetchCategories({
                status: 'ACTIVE',
                branchId: user?.branchId
            });

            // Load dishes using Staff API (không bao gồm DISCONTINUED)
            // Trang danh sách món ăn sử dụng phân trang
            await fetchDishesForStaff({
                name: debouncedSearchTerm || undefined,
                categoryId: categoryFilter || undefined,
                status: 'ACTIVE',
                branchId: user?.branchId,
                // Không set page và size, để hook sử dụng pagination mặc định (page=0, size=10)
            });

        } catch (err: any) {
            console.error('Error loading data:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [user?.branchId, debouncedSearchTerm, categoryFilter, fetchDishes, fetchCategories]);

    // Load data on component mount and when filters change
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Update dishes state when dishPage changes
    useEffect(() => {
        if (dishPage?.content) {
            // Backend đã lọc bỏ DISCONTINUED, không cần lọc frontend nữa
            setDishes(dishPage.content.map(dish => ({
                id: dish.id,
                name: dish.name,
                description: dish.description || '',
                basePrice: dish.basePrice || 0,
                image: dish.image,
                categoryId: dish.categoryId,
                categoryName: dish.categoryName || 'Không có danh mục',
                operationalStatus: dish.operationalStatus || 'ACTIVE',
                availabilityStatus: dish.availabilityStatus || 'AVAILABLE'
            })));
        }
    }, [dishPage]);

    // Filter dishes based on availability filter
    const filteredDishes = dishes.filter(dish => {
        if (availabilityFilter === 'ALL') return true;
        return dish.availabilityStatus === availabilityFilter;
    });

    // Get availability badge variant
    const getAvailabilityBadgeVariant = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'OUT_OF_STOCK': return 'warning';
            case 'DISCONTINUED': return 'danger';
            default: return 'secondary';
        }
    };

    // Get availability text
    const getAvailabilityText = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'Còn hàng';
            case 'OUT_OF_STOCK': return 'Hết hàng';
            case 'DISCONTINUED': return 'Ngừng bán';
            default: return status;
        }
    };

    // Handle availability update
    const handleAvailabilityUpdate = async (dishId: number, newStatus: string) => {
        try {
            setIsUpdating(true);
            setError(null);

            await apiClient.patch(`/dishes/${dishId}/availability-status`, {
                status: newStatus
            });

            // Update local state
            setDishes(prevDishes => 
                prevDishes.map(dish => 
                    dish.id === dishId 
                        ? { ...dish, availabilityStatus: newStatus as any }
                        : dish
                )
            );

            setShowUpdateModal(false);
            setSelectedDish(null);

        } catch (err: any) {
            console.error('Error updating dish availability:', err);
            setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái món ăn');
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle view dish details
    const handleViewDish = (dish: DishWithAvailability) => {
        setSelectedDish(dish);
        setShowUpdateModal(true);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading || dishesLoading || categoriesLoading) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải danh sách món ăn...</p>
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
                                        <CupHot className="me-2" />
                                        Danh sách món ăn - Staff
                                    </h4>
                                    <small className="text-muted">
                                        Chi nhánh: {user?.branchId || 'N/A'} | 
                                        Quyền: Chỉ được thay đổi trạng thái còn/hết hàng | 
                                        Lưu ý: Món ăn ngừng bán không hiển thị
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={loadData}
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
                <Col md={4}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={categoryFilter || ''}
                        onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categoryPage?.content?.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="AVAILABLE">Còn hàng</option>
                        <option value="OUT_OF_STOCK">Hết hàng</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <div className="d-flex gap-2">
                        <Badge bg="info" className="px-3 py-2">
                            Tổng: {filteredDishes.length} món
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Dishes Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <CupHot className="me-2" />
                                Danh sách món ăn
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {filteredDishes.length === 0 ? (
                                <div className="text-center py-5">
                                    <CupHot size={48} className="text-muted mb-3" />
                                    <h5 className="text-muted">Không có món ăn nào</h5>
                                    <p className="text-muted">
                                        {searchTerm || categoryFilter || availabilityFilter !== 'ALL' 
                                            ? 'Không tìm thấy món ăn phù hợp với bộ lọc'
                                            : 'Chưa có món ăn nào trong chi nhánh'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Tên món</th>
                                            <th>Danh mục</th>
                                            <th>Giá</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDishes.map((dish) => (
                                            <tr key={dish.id}>
                                                <td>
                                                    {dish.image ? (
                                                        <img 
                                                            src={dish.image} 
                                                            alt={dish.name}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            className="rounded"
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="bg-light rounded d-flex align-items-center justify-content-center"
                                                            style={{ width: '50px', height: '50px' }}
                                                        >
                                                            <CupHot size={20} className="text-muted" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{dish.name}</div>
                                                        {dish.description && (
                                                            <small className="text-muted">
                                                                {dish.description.length > 50 
                                                                    ? `${dish.description.substring(0, 50)}...`
                                                                    : dish.description
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">
                                                        {dish.categoryName}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <strong className="text-success">
                                                        {formatCurrency(dish.basePrice)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <Badge bg={getAvailabilityBadgeVariant(dish.availabilityStatus)}>
                                                        {getAvailabilityText(dish.availabilityStatus)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleViewDish(dish)}
                                                        title="Xem chi tiết và cập nhật trạng thái"
                                                    >
                                                        <Eye />
                                                    </Button>
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

            {/* Update Availability Modal */}
            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <CupHot className="me-2" />
                        Cập nhật trạng thái món ăn
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDish && (
                        <div>
                            <div className="text-center mb-4">
                                {selectedDish.image && (
                                    <img 
                                        src={selectedDish.image} 
                                        alt={selectedDish.name}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        className="rounded mb-3"
                                    />
                                )}
                                <h5>{selectedDish.name}</h5>
                                <p className="text-muted">{selectedDish.description}</p>
                                <p className="text-success fw-bold">
                                    {formatCurrency(selectedDish.basePrice)}
                                </p>
                            </div>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng thái hiện tại</Form.Label>
                                    <div>
                                        <Badge bg={getAvailabilityBadgeVariant(selectedDish.availabilityStatus)} className="fs-6">
                                            {getAvailabilityText(selectedDish.availabilityStatus)}
                                        </Badge>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Thay đổi trạng thái</Form.Label>
                                        <Form.Select
                                            defaultValue={selectedDish.availabilityStatus}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                if (newStatus !== selectedDish.availabilityStatus) {
                                                    handleAvailabilityUpdate(selectedDish.id, newStatus);
                                                }
                                            }}
                                            disabled={isUpdating}
                                        >
                                            <option value="AVAILABLE">Còn hàng - Có thể order</option>
                                            <option value="OUT_OF_STOCK">Hết hàng - Hiển thị nhưng không thể order</option>
                                        </Form.Select>
                                </Form.Group>

                                <Alert variant="info" className="mt-3">
                                    <ExclamationTriangle className="me-2" />
                                    <strong>Lưu ý:</strong> Staff chỉ có thể thay đổi trạng thái còn/hết hàng. 
                                    Không thể ngừng bán hoặc chỉnh sửa thông tin món ăn khác.
                                </Alert>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StaffDishesPage;
