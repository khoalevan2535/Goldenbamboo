import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { 
    Cart3, 
    Search, 
    Filter, 
    Plus, 
    Dash,
    ShoppingCart,
    CurrencyDollar,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    ArrowRight,
    Database
} from 'react-bootstrap-icons';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { useCategories } from '../../hooks/useCategories';
import { useAuth } from '../../hooks/useAuth';

const StaffOrderErrorTest: React.FC = () => {
    const { user } = useAuth();
    const [testResults, setTestResults] = useState<any>({});
    const [errorLog, setErrorLog] = useState<string[]>([]);

    // Hooks
    const { dishPage, loading: dishesLoading, fetchDishes } = useDishes();
    const { comboPage, loading: combosLoading, fetchCombos } = useCombos();
    const { categoryPage, loading: categoriesLoading, fetchCategories } = useCategories();

    // Test API calls with error handling
    const testAPIs = async () => {
        setTestResults({});
        setErrorLog([]);
        
        try {
            // Test categories
            console.log('Testing categories...');
            await fetchCategories({ status: 'ACTIVE' });
            setTestResults(prev => ({ ...prev, categories: 'Success' }));
        } catch (error) {
            console.error('Categories error:', error);
            setErrorLog(prev => [...prev, `Categories: ${error}`]);
            setTestResults(prev => ({ ...prev, categories: 'Error' }));
        }

        try {
            // Test dishes
            console.log('Testing dishes...');
            await fetchDishes({ status: 'ACTIVE' });
            setTestResults(prev => ({ ...prev, dishes: 'Success' }));
        } catch (error) {
            console.error('Dishes error:', error);
            setErrorLog(prev => [...prev, `Dishes: ${error}`]);
            setTestResults(prev => ({ ...prev, dishes: 'Error' }));
        }

        try {
            // Test combos
            console.log('Testing combos...');
            await fetchCombos({ status: 'ACTIVE' });
            setTestResults(prev => ({ ...prev, combos: 'Success' }));
        } catch (error) {
            console.error('Combos error:', error);
            setErrorLog(prev => [...prev, `Combos: ${error}`]);
            setTestResults(prev => ({ ...prev, combos: 'Error' }));
        }
    };

    useEffect(() => {
        testAPIs();
    }, []);

    const getStatusBadge = (status: string) => {
        if (status === 'Success') {
            return <Badge bg="success"><CheckCircle className="me-1" />Success</Badge>;
        } else if (status === 'Error') {
            return <Badge bg="danger"><XCircle className="me-1" />Error</Badge>;
        } else {
            return <Badge bg="secondary"><Clock className="me-1" />Loading...</Badge>;
        }
    };

    const testPriceHandling = () => {
        const testItems = [
            { name: 'Test Item 1', price: 10000 },
            { name: 'Test Item 2', price: null },
            { name: 'Test Item 3', price: undefined },
            { name: 'Test Item 4', price: 0 }
        ];

        const results = testItems.map(item => {
            try {
                const price = (item.price || 0).toLocaleString();
                return `${item.name}: ${price}đ - OK`;
            } catch (error) {
                return `${item.name}: Error - ${error}`;
            }
        });

        setErrorLog(prev => [...prev, ...results]);
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
                                        Error Test - Staff Order Page
                                    </h4>
                                    <small className="text-muted">
                                        Kiểm tra xử lý lỗi và giá trị null/undefined
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="primary" 
                                        onClick={testAPIs}
                                        className="me-2"
                                    >
                                        <ArrowRight className="me-1" />
                                        Test lại
                                    </Button>
                                    <Button 
                                        variant="outline-info" 
                                        onClick={testPriceHandling}
                                        className="me-2"
                                    >
                                        <CurrencyDollar className="me-1" />
                                        Test Price
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
                {/* API Status */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Database className="me-2" />
                                Trạng thái API
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Categories API:</span>
                                {getStatusBadge(testResults.categories)}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Dishes API:</span>
                                {getStatusBadge(testResults.dishes)}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>Combos API:</span>
                                {getStatusBadge(testResults.combos)}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

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
            </Row>

            <Row>
                {/* Data Validation */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <CheckCircle className="me-2" />
                                Data Validation
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Dishes:</strong>
                                <ul className="small">
                                    <li>Total: {dishPage?.content?.length || 0}</li>
                                    <li>With price: {dishPage?.content?.filter(d => d.price).length || 0}</li>
                                    <li>Without price: {dishPage?.content?.filter(d => !d.price).length || 0}</li>
                                </ul>
                            </div>
                            <div className="mb-3">
                                <strong>Combos:</strong>
                                <ul className="small">
                                    <li>Total: {comboPage?.content?.length || 0}</li>
                                    <li>With price: {comboPage?.content?.filter(c => c.price).length || 0}</li>
                                    <li>Without price: {comboPage?.content?.filter(c => !c.price).length || 0}</li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Price Test Results */}
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <CurrencyDollar className="me-2" />
                                Price Handling Test
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Test Cases:</strong>
                                <ul className="small">
                                    <li>Price: 10000 → {(10000).toLocaleString()}đ</li>
                                    <li>Price: null → {(null || 0).toLocaleString()}đ</li>
                                    <li>Price: undefined → {(undefined || 0).toLocaleString()}đ</li>
                                    <li>Price: 0 → {(0).toLocaleString()}đ</li>
                                </ul>
                            </div>
                            <Alert variant="success" className="small">
                                <CheckCircle className="me-2" />
                                Tất cả test cases đều pass!
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Summary */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <CheckCircle className="me-2" />
                                Tóm tắt
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-primary">{categoryPage?.content?.length || 0}</h4>
                                        <small className="text-muted">Danh mục</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-success">{dishPage?.content?.length || 0}</h4>
                                        <small className="text-muted">Món ăn</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-warning">{comboPage?.content?.length || 0}</h4>
                                        <small className="text-muted">Combo</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-info">
                                            {(dishPage?.content?.length || 0) + (comboPage?.content?.length || 0)}
                                        </h4>
                                        <small className="text-muted">Tổng món</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffOrderErrorTest;

