import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Table } from 'react-bootstrap';
import { 
    Cart3, 
    Search, 
    Plus, 
    CurrencyDollar,
    CheckCircle,
    XCircle,
    Eye,
    ArrowRight,
    Database,
    GraphUp
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { useCategories } from '../../hooks/useCategories';
import { DishService } from '../../services/DishService';
import { ComboService } from '../../services/ComboService';
import { CategoryService } from '../../services/CategoryService';

const StaffOrderApiCompare: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Manager API (same as manager uses)
    const { dishPage, loading: dishesLoading, fetchDishes } = useDishes();
    const { comboPage, loading: combosLoading, fetchCombos } = useCombos();
    const { categoryPage, loading: categoriesLoading, fetchCategories } = useCategories();
    
    // Client API data
    const [clientCategories, setClientCategories] = useState<any[]>([]);
    const [clientDishes, setClientDishes] = useState<any[]>([]);
    const [clientCombos, setClientCombos] = useState<any[]>([]);

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
            
            // Load manager API data
            fetchCategories({ status: 'APPROVED' });
            fetchDishes({});
            fetchCombos({});
            
            // Load client API data
            const categoriesResponse = await CategoryService.getClientCategories(user.branchId);
            setClientCategories(categoriesResponse);
            
            const dishesResponse = await DishService.getClientDishes(user.branchId, { status: 'ACTIVE' });
            setClientDishes(dishesResponse.content || []);
            
            const combosResponse = await ComboService.getClientCombos(user.branchId, { status: 'ACTIVE' });
            setClientCombos(combosResponse.content || []);
            
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
                                        So sánh API - Manager vs Client
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
                {/* Manager API */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <GraphUp className="me-2" />
                                Manager API (useDishes, useCombos, useCategories)
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Categories:</strong> {categoryPage?.content?.length || 0}
                                <ul className="small mt-1">
                                    {categoryPage?.content?.slice(0, 3).map((cat: any) => (
                                        <li key={cat.id}>- {cat.name} ({cat.status})</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Dishes:</strong> {dishPage?.content?.length || 0}
                                <ul className="small mt-1">
                                    {dishPage?.content?.slice(0, 3).map((dish: any) => (
                                        <li key={dish.id}>- {dish.name}: {(dish.basePrice || 0).toLocaleString()}đ</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Combos:</strong> {comboPage?.content?.length || 0}
                                <ul className="small mt-1">
                                    {comboPage?.content?.slice(0, 3).map((combo: any) => (
                                        <li key={combo.id}>- {combo.name}: {(combo.basePrice || 0).toLocaleString()}đ</li>
                                    ))}
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Client API */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Database className="me-2" />
                                Client API (getClientCategories, getClientDishes, getClientCombos)
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Categories:</strong> {clientCategories.length}
                                <ul className="small mt-1">
                                    {clientCategories.slice(0, 3).map((cat: any) => (
                                        <li key={cat.id}>- {cat.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Dishes:</strong> {clientDishes.length}
                                <ul className="small mt-1">
                                    {clientDishes.slice(0, 3).map((dish: any) => (
                                        <li key={dish.id}>- {dish.name}: {(dish.price || 0).toLocaleString()}đ</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Combos:</strong> {clientCombos.length}
                                <ul className="small mt-1">
                                    {clientCombos.slice(0, 3).map((combo: any) => (
                                        <li key={combo.id}>- {combo.name}: {(combo.price || 0).toLocaleString()}đ</li>
                                    ))}
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Detailed Comparison */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">📊 Chi tiết so sánh</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>API Type</th>
                                        <th>Categories</th>
                                        <th>Dishes</th>
                                        <th>Combos</th>
                                        <th>Price Field</th>
                                        <th>Status Field</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Manager API</strong></td>
                                        <td>{categoryPage?.content?.length || 0}</td>
                                        <td>{dishPage?.content?.length || 0}</td>
                                        <td>{comboPage?.content?.length || 0}</td>
                                        <td>basePrice</td>
                                        <td>operationalStatus</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Client API</strong></td>
                                        <td>{clientCategories.length}</td>
                                        <td>{clientDishes.length}</td>
                                        <td>{clientCombos.length}</td>
                                        <td>price</td>
                                        <td>status</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* API Endpoints */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🔗 API Endpoints</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <div className="col-md-6">
                                    <h6>Manager API:</h6>
                                    <ul className="small">
                                        <li>GET /categories</li>
                                        <li>GET /dishes</li>
                                        <li>GET /combos</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6>Client API:</h6>
                                    <ul className="small">
                                        <li>GET /api/client/menu/categories?branchId={user?.branchId}</li>
                                        <li>GET /api/client/menu/dishes?branchId={user?.branchId}</li>
                                        <li>GET /api/client/menu/combos?branchId={user?.branchId}</li>
                                    </ul>
                                </div>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffOrderApiCompare;

