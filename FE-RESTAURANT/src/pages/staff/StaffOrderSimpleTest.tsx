import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { 
    Cart3, 
    Search, 
    Plus, 
    CurrencyDollar,
    CheckCircle,
    XCircle,
    Eye,
    ArrowRight,
    Database
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { DishService } from '../../services/DishService';
import { ComboService } from '../../services/ComboService';
import { CategoryService } from '../../services/CategoryService';

const StaffOrderSimpleTest: React.FC = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [dishes, setDishes] = useState<any[]>([]);
    const [combos, setCombos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [user?.branchId]);

    const loadData = async () => {
        if (!user?.branchId) {
            setError('User branchId not found');
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading data for branchId:', user.branchId);
            
            // Load categories
            const categoriesResponse = await CategoryService.getClientCategories(user.branchId);
            console.log('Categories response:', categoriesResponse);
            setCategories(categoriesResponse);
            
            // Load dishes
            const dishesResponse = await DishService.getClientDishes(user.branchId, { status: 'ACTIVE' });
            console.log('Dishes response:', dishesResponse);
            setDishes(dishesResponse.content || []);
            
            // Load combos
            const combosResponse = await ComboService.getClientCombos(user.branchId, { status: 'ACTIVE' });
            console.log('Combos response:', combosResponse);
            setCombos(combosResponse.content || []);
            
        } catch (error) {
            console.error('Error loading data:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'ACTIVE') {
            return <Badge bg="success">Có sẵn</Badge>;
        } else {
            return <Badge bg="secondary">Hết hàng</Badge>;
        }
    };

    if (loading) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Đang tải dữ liệu...</p>
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
                                        <Database className="me-2" />
                                        Test API đơn giản - Staff Order
                                    </h4>
                                    <small className="text-muted">
                                        Branch ID: {user?.branchId || 'N/A'}
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="primary" 
                                        onClick={loadData}
                                        className="me-2"
                                    >
                                        <ArrowRight className="me-1" />
                                        Reload
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => window.location.href = '/staff/new/order'}
                                    >
                                        <Cart3 className="me-1" />
                                        Xem trang Order
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">
                            <XCircle className="me-2" />
                            <strong>Lỗi:</strong> {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Categories */}
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Eye className="me-2" />
                                Categories ({categories.length})
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {categories.length === 0 ? (
                                <Alert variant="info">
                                    <Eye className="me-2" />
                                    Không có categories
                                </Alert>
                            ) : (
                                <div>
                                    {categories.map(category => (
                                        <div key={category.id} className="mb-2 p-2 border rounded">
                                            <div className="fw-bold">{category.name}</div>
                                            <div className="small text-muted">ID: {category.id}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Dishes */}
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Cart3 className="me-2" />
                                Dishes ({dishes.length})
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {dishes.length === 0 ? (
                                <Alert variant="info">
                                    <Eye className="me-2" />
                                    Không có dishes
                                </Alert>
                            ) : (
                                <div>
                                    {dishes.slice(0, 5).map(dish => (
                                        <div key={dish.id} className="mb-2 p-2 border rounded">
                                            <div className="fw-bold">{dish.name}</div>
                                            <div className="small text-muted">
                                                <CurrencyDollar className="me-1" />
                                                {(dish.price || 0).toLocaleString()}đ
                                            </div>
                                            <div className="small text-muted">Category: {dish.categoryId}</div>
                                            {getStatusBadge(dish.status)}
                                        </div>
                                    ))}
                                    {dishes.length > 5 && (
                                        <div className="text-center text-muted small">
                                            ... và {dishes.length - 5} món khác
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Combos */}
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Cart3 className="me-2" />
                                Combos ({combos.length})
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {combos.length === 0 ? (
                                <Alert variant="info">
                                    <Eye className="me-2" />
                                    Không có combos
                                </Alert>
                            ) : (
                                <div>
                                    {combos.slice(0, 5).map(combo => (
                                        <div key={combo.id} className="mb-2 p-2 border rounded">
                                            <div className="fw-bold">{combo.name}</div>
                                            <div className="small text-muted">
                                                <CurrencyDollar className="me-1" />
                                                {(combo.price || 0).toLocaleString()}đ
                                            </div>
                                            {getStatusBadge(combo.status)}
                                        </div>
                                    ))}
                                    {combos.length > 5 && (
                                        <div className="text-center text-muted small">
                                            ... và {combos.length - 5} combo khác
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* API Info */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🔗 API Endpoints được sử dụng</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <div className="col-md-4">
                                    <h6>Categories:</h6>
                                    <code className="small d-block">
                                        GET /api/client/menu/categories?branchId={user?.branchId}
                                    </code>
                                </div>
                                <div className="col-md-4">
                                    <h6>Dishes:</h6>
                                    <code className="small d-block">
                                        GET /api/client/menu/dishes?branchId={user?.branchId}&status=ACTIVE
                                    </code>
                                </div>
                                <div className="col-md-4">
                                    <h6>Combos:</h6>
                                    <code className="small d-block">
                                        GET /api/client/menu/combos?branchId={user?.branchId}&status=ACTIVE
                                    </code>
                                </div>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffOrderSimpleTest;

