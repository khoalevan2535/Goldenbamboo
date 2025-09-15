import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { Tag, CheckCircle, XCircle, Eye } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { StaffOrderService } from '../../services/StaffOrderService';
import { calculateDishPrice, formatPrice } from '../../utils/discountUtils';

const StaffDiscountFlowTestPage: React.FC = () => {
    const { user } = useAuth();
    const { dishes, fetchDishesForStaff } = useDishes();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<any>(null);
    const [selectedDish, setSelectedDish] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            await fetchDishesForStaff({ page: 0, size: 100 });
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const testOrderCreation = async () => {
        if (!selectedDish) {
            setError('Vui lòng chọn món ăn để test');
            return;
        }

        setLoading(true);
        setError(null);
        setTestResults(null);

        try {
            // Tính giá sau discount
            const discountInfo = calculateDishPrice(selectedDish);
            
            console.log('=== TEST ORDER CREATION ===');
            console.log('Selected dish:', selectedDish);
            console.log('Discount info:', discountInfo);
            
            // Tạo order với món ăn đã chọn
            const orderRequest = {
                tableId: null,
                customerName: 'Test Customer',
                customerPhone: '0123456789',
                notes: 'Test order for discount flow',
                items: [{
                    dishId: selectedDish.id,
                    quantity: 1,
                    unitPrice: discountInfo.finalPrice, // Sử dụng giá sau discount
                    specialInstructions: `Test món: ${selectedDish.name}`
                }],
                specialInstructions: `Test order - Original: ${formatPrice(discountInfo.originalPrice)}đ, Final: ${formatPrice(discountInfo.finalPrice)}đ`
            };

            console.log('Order request:', orderRequest);

            const createdOrder = await StaffOrderService.createOrder(orderRequest);
            console.log('Created order:', createdOrder);

            setTestResults({
                dish: selectedDish,
                discountInfo,
                orderRequest,
                createdOrder,
                timestamp: new Date().toISOString()
            });

        } catch (err: any) {
            console.error('Order creation error:', err);
            setError(`Lỗi tạo đơn hàng: ${err.message || err.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !testResults) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h4>Discount Flow Test</h4>
                            <p className="mb-0 text-muted">Test thực tế flow discount từ frontend đến backend</p>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger">
                                    <strong>Error:</strong> {error}
                                </Alert>
                            )}

                            <div className="mb-4">
                                <h5>Chọn món ăn để test:</h5>
                                <Row>
                                    {(dishes || []).slice(0, 6).map(dish => {
                                        const discountInfo = calculateDishPrice(dish);
                                        return (
                                            <Col md={4} lg={3} key={dish.id} className="mb-3">
                                                <Card 
                                                    className={`h-100 cursor-pointer ${selectedDish?.id === dish.id ? 'border-primary' : ''}`}
                                                    onClick={() => setSelectedDish(dish)}
                                                >
                                                    <Card.Img
                                                        variant="top"
                                                        src={dish.image || '/images/default-dish.svg'}
                                                        style={{ height: '120px', objectFit: 'cover' }}
                                                    />
                                                    <Card.Body>
                                                        <Card.Title className="h6">{dish.name}</Card.Title>
                                                        <div className="mb-2">
                                                            {discountInfo.hasDiscount ? (
                                                                <>
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <span className="text-success fw-bold">
                                                                            {formatPrice(discountInfo.finalPrice)}đ
                                                                        </span>
                                                                        <span className="badge bg-danger ms-2">
                                                                            -{Math.round(discountInfo.discountPercentage)}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-muted small text-decoration-line-through">
                                                                        {formatPrice(discountInfo.originalPrice)}đ
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span className="text-primary">
                                                                    {formatPrice(discountInfo.originalPrice)}đ
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="small text-muted">
                                                            <div>ID: {dish.id}</div>
                                                            <div>Active: {dish.discountActive ? '✅' : '❌'}</div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>

                            {selectedDish && (
                                <div className="mb-4">
                                    <h5>Món ăn đã chọn: {selectedDish.name}</h5>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="primary"
                                            onClick={testOrderCreation}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Testing...
                                                </>
                                            ) : (
                                                <>
                                                    <Tag className="me-2" />
                                                    Test Order Creation
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {testResults && (
                                <div className="mb-4">
                                    <h5>Test Results:</h5>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Card>
                                                <Card.Header>
                                                    <strong>Frontend Data</strong>
                                                </Card.Header>
                                                <Card.Body>
                                                    <Table size="sm">
                                                        <tbody>
                                                            <tr>
                                                                <td><strong>Dish Name:</strong></td>
                                                                <td>{testResults.dish.name}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Original Price:</strong></td>
                                                                <td>{formatPrice(testResults.discountInfo.originalPrice)}đ</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Final Price:</strong></td>
                                                                <td className="text-success fw-bold">{formatPrice(testResults.discountInfo.finalPrice)}đ</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Discount %:</strong></td>
                                                                <td>{Math.round(testResults.discountInfo.discountPercentage)}%</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Unit Price Sent:</strong></td>
                                                                <td className="text-primary fw-bold">{formatPrice(testResults.orderRequest.items[0].unitPrice)}đ</td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        
                                        <Col md={6}>
                                            <Card>
                                                <Card.Header>
                                                    <strong>Backend Response</strong>
                                                </Card.Header>
                                                <Card.Body>
                                                    <Table size="sm">
                                                        <tbody>
                                                            <tr>
                                                                <td><strong>Order ID:</strong></td>
                                                                <td>#{testResults.createdOrder.id}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Total Amount:</strong></td>
                                                                <td className="text-success fw-bold">{formatPrice(testResults.createdOrder.totalAmount)}đ</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Discount Amount:</strong></td>
                                                                <td className="text-warning">{formatPrice(testResults.createdOrder.discountAmount || 0)}đ</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Item Count:</strong></td>
                                                                <td>{testResults.createdOrder.items?.length || 0}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Status:</strong></td>
                                                                <td><span className="badge bg-success">{testResults.createdOrder.status}</span></td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <div className="mt-3">
                                        <h6>Analysis:</h6>
                                        <div className="alert alert-info">
                                            <strong>Frontend gửi:</strong> {formatPrice(testResults.orderRequest.items[0].unitPrice)}đ<br/>
                                            <strong>Backend trả về:</strong> {formatPrice(testResults.createdOrder.totalAmount)}đ<br/>
                                            <strong>Discount Amount:</strong> {formatPrice(testResults.createdOrder.discountAmount || 0)}đ<br/>
                                            <strong>Kết luận:</strong> {
                                                testResults.createdOrder.totalAmount === testResults.orderRequest.items[0].unitPrice 
                                                    ? "✅ Không có double discount" 
                                                    : "⚠️ Có thể có double discount hoặc logic khác"
                                            }
                                        </div>
                                    </div>

                                    <details className="mt-3">
                                        <summary>Raw Data (Click to expand)</summary>
                                        <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                                            {JSON.stringify(testResults, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            )}

                            <div className="text-center">
                                <Button variant="secondary" onClick={loadData}>
                                    <Eye className="me-2" />
                                    Refresh Data
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffDiscountFlowTestPage;










