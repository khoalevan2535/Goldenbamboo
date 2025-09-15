import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { 
    Cart3, 
    Search, 
    Filter, 
    Plus, 
    CurrencyDollar,
    Clock,
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

const StaffOrderApiTest: React.FC = () => {
    const { user } = useAuth();
    const [testResults, setTestResults] = useState<any>({});
    const [errorLog, setErrorLog] = useState<string[]>([]);
    const [clientData, setClientData] = useState<any>({});

    // Test Client API calls
    const testClientAPIs = async () => {
        if (!user?.branchId) {
            setErrorLog(['User branchId not found']);
            return;
        }

        setTestResults({});
        setErrorLog([]);
        
        try {
            // Test client categories
            console.log('Testing client categories...');
            const categories = await CategoryService.getClientCategories(user.branchId);
            setTestResults(prev => ({ ...prev, clientCategories: 'Success' }));
            setClientData(prev => ({ ...prev, categories }));
        } catch (error) {
            console.error('Client categories error:', error);
            setErrorLog(prev => [...prev, `Client Categories: ${error}`]);
            setTestResults(prev => ({ ...prev, clientCategories: 'Error' }));
        }

        try {
            // Test client dishes
            console.log('Testing client dishes...');
            const dishes = await DishService.getClientDishes(user.branchId, { status: 'ACTIVE' });
            setTestResults(prev => ({ ...prev, clientDishes: 'Success' }));
            setClientData(prev => ({ ...prev, dishes }));
        } catch (error) {
            console.error('Client dishes error:', error);
            setErrorLog(prev => [...prev, `Client Dishes: ${error}`]);
            setTestResults(prev => ({ ...prev, clientDishes: 'Error' }));
        }

        try {
            // Test client combos
            console.log('Testing client combos...');
            const combos = await ComboService.getClientCombos(user.branchId, { status: 'ACTIVE' });
            setTestResults(prev => ({ ...prev, clientCombos: 'Success' }));
            setClientData(prev => ({ ...prev, combos }));
        } catch (error) {
            console.error('Client combos error:', error);
            setErrorLog(prev => [...prev, `Client Combos: ${error}`]);
            setTestResults(prev => ({ ...prev, clientCombos: 'Error' }));
        }
    };

    useEffect(() => {
        testClientAPIs();
    }, [user?.branchId]);

    const getStatusBadge = (status: string) => {
        if (status === 'Success') {
            return <Badge bg="success"><CheckCircle className="me-1" />Success</Badge>;
        } else if (status === 'Error') {
            return <Badge bg="danger"><XCircle className="me-1" />Error</Badge>;
        } else {
            return <Badge bg="secondary"><Clock className="me-1" />Loading...</Badge>;
        }
    };

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
                                        Client API Test - Staff Order
                                    </h4>
                                    <small className="text-muted">
                                        Kiểm tra API client menu với branchId
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="primary" 
                                        onClick={testClientAPIs}
                                        className="me-2"
                                    >
                                        <ArrowRight className="me-1" />
                                        Test lại
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

            <Row>
                {/* User Info */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Eye className="me-2" />
                                Thông tin User
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-2">
                                <strong>Username:</strong> {user?.username || 'N/A'}
                            </div>
                            <div className="mb-2">
                                <strong>Email:</strong> {user?.email || 'N/A'}
                            </div>
                            <div className="mb-2">
                                <strong>Roles:</strong> {user?.roles?.join(', ') || 'N/A'}
                            </div>
                            <div className="mb-2">
                                <strong>Branch ID:</strong> {user?.branchId || 'N/A'}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* API Status */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Database className="me-2" />
                                Trạng thái Client API
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Client Categories API:</span>
                                {getStatusBadge(testResults.clientCategories)}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Client Dishes API:</span>
                                {getStatusBadge(testResults.clientDishes)}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Client Combos API:</span>
                                {getStatusBadge(testResults.clientCombos)}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Error Log */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <XCircle className="me-2" />
                                Error Log
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {errorLog.length === 0 ? (
                                <Alert variant="info">
                                    <Eye className="me-2" />
                                    Không có lỗi nào
                                </Alert>
                            ) : (
                                <div>
                                    {errorLog.map((error, index) => (
                                        <div key={index} className="small mb-1 p-2 border rounded">
                                            {error}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Data Summary */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <CheckCircle className="me-2" />
                                Dữ liệu Client API
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Categories:</strong>
                                <ul className="small">
                                    <li>Total: {clientData.categories?.length || 0}</li>
                                    {clientData.categories?.slice(0, 3).map((cat: any) => (
                                        <li key={cat.id}>- {cat.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Dishes:</strong>
                                <ul className="small">
                                    <li>Total: {clientData.dishes?.content?.length || 0}</li>
                                    {clientData.dishes?.content?.slice(0, 3).map((dish: any) => (
                                        <li key={dish.id}>- {dish.name}: {(dish.price || 0).toLocaleString()}đ</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Combos:</strong>
                                <ul className="small">
                                    <li>Total: {clientData.combos?.content?.length || 0}</li>
                                    {clientData.combos?.content?.slice(0, 3).map((combo: any) => (
                                        <li key={combo.id}>- {combo.name}: {(combo.price || 0).toLocaleString()}đ</li>
                                    ))}
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* API Endpoints */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🔗 API Endpoints được sử dụng</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <div className="col-md-4">
                                    <h6>Categories API:</h6>
                                    <code className="small">
                                        GET /api/client/menu/categories?branchId={user?.branchId}
                                    </code>
                                </div>
                                <div className="col-md-4">
                                    <h6>Dishes API:</h6>
                                    <code className="small">
                                        GET /api/client/menu/dishes?branchId={user?.branchId}&status=ACTIVE
                                    </code>
                                </div>
                                <div className="col-md-4">
                                    <h6>Combos API:</h6>
                                    <code className="small">
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

export default StaffOrderApiTest;

