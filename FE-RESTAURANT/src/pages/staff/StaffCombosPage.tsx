import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { 
    Boxes, 
    Search, 
    Eye, 
    CheckCircle, 
    XCircle, 
    ExclamationTriangle,
    ArrowClockwise,
    Filter
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useCombos } from '../../hooks/useCombos';
import { useDebounce } from '../../hooks/useDebounce';
import apiClient from '../../utils/apiClient';

interface ComboWithAvailability {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    image?: string;
    operationalStatus: 'ACTIVE' | 'INACTIVE';
    availabilityStatus: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
    dishes?: Array<{
        id: number;
        name: string;
        quantity: number;
    }>;
}

const StaffCombosPage: React.FC = () => {
    const { user } = useAuth();
    const [combos, setCombos] = useState<ComboWithAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
    const [selectedCombo, setSelectedCombo] = useState<ComboWithAvailability | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Use hooks for data fetching
    const { comboPage, loading: combosLoading, fetchCombos, fetchCombosForStaff } = useCombos();
    
    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Load combos using Staff API (không bao gồm DISCONTINUED)
            // Trang danh sách combo sử dụng phân trang
            await fetchCombosForStaff({
                name: debouncedSearchTerm || undefined,
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
    }, [user?.branchId, debouncedSearchTerm, fetchCombos]);

    // Load data on component mount and when filters change
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Update combos state when comboPage changes
    useEffect(() => {
        if (comboPage?.content) {
            // Backend đã lọc bỏ DISCONTINUED, không cần lọc frontend nữa
            setCombos(comboPage.content.map(combo => ({
                id: combo.id,
                name: combo.name,
                description: combo.description || '',
                basePrice: combo.basePrice || 0,
                image: combo.image,
                operationalStatus: combo.operationalStatus || 'ACTIVE',
                availabilityStatus: combo.availabilityStatus || 'AVAILABLE',
                dishes: combo.dishes || []
            })));
        }
    }, [comboPage]);

    // Filter combos based on availability filter
    const filteredCombos = combos.filter(combo => {
        if (availabilityFilter === 'ALL') return true;
        return combo.availabilityStatus === availabilityFilter;
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
    const handleAvailabilityUpdate = async (comboId: number, newStatus: string) => {
        try {
            setIsUpdating(true);
            setError(null);

            await apiClient.patch(`/combos/${comboId}/availability-status`, {
                status: newStatus
            });

            // Update local state
            setCombos(prevCombos => 
                prevCombos.map(combo => 
                    combo.id === comboId 
                        ? { ...combo, availabilityStatus: newStatus as any }
                        : combo
                )
            );

            setShowUpdateModal(false);
            setSelectedCombo(null);

        } catch (err: any) {
            console.error('Error updating combo availability:', err);
            setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái combo');
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle view combo details
    const handleViewCombo = (combo: ComboWithAvailability) => {
        setSelectedCombo(combo);
        setShowUpdateModal(true);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading || combosLoading) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải danh sách combo...</p>
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
                                        <Boxes className="me-2" />
                                        Danh sách combo - Staff
                                    </h4>
                                    <small className="text-muted">
                                        Chi nhánh: {user?.branchId || 'N/A'} | 
                                        Quyền: Chỉ được thay đổi trạng thái còn/hết hàng | 
                                        Lưu ý: Combo ngừng bán không hiển thị
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
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm combo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
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
                            Tổng: {filteredCombos.length} combo
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Combos Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <Boxes className="me-2" />
                                Danh sách combo
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {filteredCombos.length === 0 ? (
                                <div className="text-center py-5">
                                    <Boxes size={48} className="text-muted mb-3" />
                                    <h5 className="text-muted">Không có combo nào</h5>
                                    <p className="text-muted">
                                        {searchTerm || availabilityFilter !== 'ALL' 
                                            ? 'Không tìm thấy combo phù hợp với bộ lọc'
                                            : 'Chưa có combo nào trong chi nhánh'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Tên combo</th>
                                            <th>Mô tả</th>
                                            <th>Giá</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCombos.map((combo) => (
                                            <tr key={combo.id}>
                                                <td>
                                                    {combo.image ? (
                                                        <img 
                                                            src={combo.image} 
                                                            alt={combo.name}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            className="rounded"
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="bg-light rounded d-flex align-items-center justify-content-center"
                                                            style={{ width: '50px', height: '50px' }}
                                                        >
                                                            <Boxes size={20} className="text-muted" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="fw-medium">{combo.name}</div>
                                                </td>
                                                <td>
                                                    {combo.description && (
                                                        <small className="text-muted">
                                                            {combo.description.length > 50 
                                                                ? `${combo.description.substring(0, 50)}...`
                                                                : combo.description
                                                            }
                                                        </small>
                                                    )}
                                                </td>
                                                <td>
                                                    <strong className="text-success">
                                                        {formatCurrency(combo.basePrice)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <Badge bg={getAvailabilityBadgeVariant(combo.availabilityStatus)}>
                                                        {getAvailabilityText(combo.availabilityStatus)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleViewCombo(combo)}
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
            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Boxes className="me-2" />
                        Cập nhật trạng thái combo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCombo && (
                        <div>
                            <Row>
                                <Col md={4}>
                                    <div className="text-center">
                                        {selectedCombo.image && (
                                            <img 
                                                src={selectedCombo.image} 
                                                alt={selectedCombo.name}
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                className="rounded mb-3"
                                            />
                                        )}
                                        <h5>{selectedCombo.name}</h5>
                                        <p className="text-success fw-bold">
                                            {formatCurrency(selectedCombo.basePrice)}
                                        </p>
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Trạng thái hiện tại</Form.Label>
                                            <div>
                                                <Badge bg={getAvailabilityBadgeVariant(selectedCombo.availabilityStatus)} className="fs-6">
                                                    {getAvailabilityText(selectedCombo.availabilityStatus)}
                                                </Badge>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Thay đổi trạng thái</Form.Label>
                                            <Form.Select
                                                defaultValue={selectedCombo.availabilityStatus}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value;
                                                    if (newStatus !== selectedCombo.availabilityStatus) {
                                                        handleAvailabilityUpdate(selectedCombo.id, newStatus);
                                                    }
                                                }}
                                                disabled={isUpdating}
                                            >
                                                <option value="AVAILABLE">Còn hàng - Có thể order</option>
                                                <option value="OUT_OF_STOCK">Hết hàng - Hiển thị nhưng không thể order</option>
                                            </Form.Select>
                                        </Form.Group>

                                        {selectedCombo.description && (
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mô tả</Form.Label>
                                                <p className="text-muted">{selectedCombo.description}</p>
                                            </Form.Group>
                                        )}

                                        {selectedCombo.dishes && selectedCombo.dishes.length > 0 && (
                                            <Form.Group className="mb-3">
                                                <Form.Label>Danh sách món ăn</Form.Label>
                                                <div className="border rounded p-3">
                                                    {selectedCombo.dishes.map((dish, index) => (
                                                        <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                                            <span>{dish.name}</span>
                                                            <Badge bg="secondary">x{dish.quantity}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Form.Group>
                                        )}

                                        <Alert variant="info" className="mt-3">
                                            <ExclamationTriangle className="me-2" />
                                            <strong>Lưu ý:</strong> Staff chỉ có thể thay đổi trạng thái còn/hết hàng. 
                                            Không thể ngừng bán hoặc chỉnh sửa thông tin combo khác.
                                        </Alert>
                                    </Form>
                                </Col>
                            </Row>
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

export default StaffCombosPage;
