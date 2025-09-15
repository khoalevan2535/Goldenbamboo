import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { Tag, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { DishService } from '../../services/DishService';

const StaffDiscountDebugPage: React.FC = () => {
    const { user } = useAuth();
    const { dishes, fetchDishesForStaff } = useDishes();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedDish, setSelectedDish] = useState<any>(null);
    const [discountData, setDiscountData] = useState({
        discountPercentage: 10,
        discountActive: true,
        discountStartDate: new Date().toISOString(),
        discountEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Loading dishes data...');
            await fetchDishesForStaff({ page: 0, size: 100 });
            console.log('Dishes loaded:', dishes);
        } catch (err: any) {
            console.error('Error loading dishes:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const testSetDiscount = async () => {
        if (!selectedDish) {
            setError('Vui lòng chọn món ăn');
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            
            console.log('Setting discount for dish:', selectedDish.id);
            console.log('Discount data:', discountData);
            
            const response = await DishService.updateDiscount(selectedDish.id, discountData);
            console.log('Discount response:', response);
            
            setSuccess(`Đã set discount cho món ăn: ${selectedDish.name}`);
            await loadData(); // Reload data
        } catch (err: any) {
            console.error('Error setting discount:', err);
            setError(`Lỗi khi set discount: ${err.message || err.toString()}`);
        }
    };

    const testRemoveDiscount = async () => {
        if (!selectedDish) {
            setError('Vui lòng chọn món ăn');
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            
            console.log('Removing discount for dish:', selectedDish.id);
            
            const response = await DishService.removeDiscount(selectedDish.id);
            console.log('Remove discount response:', response);
            
            setSuccess(`Đã xóa discount cho món ăn: ${selectedDish.name}`);
            await loadData(); // Reload data
        } catch (err: any) {
            console.error('Error removing discount:', err);
            setError(`Lỗi khi xóa discount: ${err.message || err.toString()}`);
        }
    };

    if (loading) {
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
                            <h4>Discount Debug Page</h4>
                            <p className="mb-0 text-muted">Debug việc tạo discount cho món ăn</p>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger">
                                    <strong>Error:</strong> {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success">
                                    <strong>Success:</strong> {success}
                                </Alert>
                            )}

                            <div className="mb-4">
                                <h5>Chọn món ăn để test discount:</h5>
                                <div className="mb-3">
                                    <small className="text-muted">
                                        Status: {loading ? 'Loading...' : 'Loaded'} | 
                                        Dishes count: {(dishes || []).length} | 
                                        User: {user?.email} | 
                                        Role: {user?.role}
                                    </small>
                                </div>
                                <Row>
                                    {(dishes || []).slice(0, 6).map(dish => (
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
                                                        <span className="text-primary">
                                                            {dish.basePrice?.toLocaleString()}đ
                                                        </span>
                                                    </div>
                                                    <div className="small text-muted">
                                                        <div>ID: {dish.id}</div>
                                                        <div>Active: {dish.discountActive ? '✅' : '❌'}</div>
                                                        {dish.discountPercentage && (
                                                            <div>%: {dish.discountPercentage}%</div>
                                                        )}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>

                            {selectedDish && (
                                <div className="mb-4">
                                    <h5>Món ăn đã chọn: {selectedDish.name}</h5>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Discount Percentage (%)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={discountData.discountPercentage}
                                                    onChange={(e) => setDiscountData({
                                                        ...discountData,
                                                        discountPercentage: parseInt(e.target.value) || 0
                                                    })}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Discount Active</Form.Label>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={discountData.discountActive}
                                                    onChange={(e) => setDiscountData({
                                                        ...discountData,
                                                        discountActive: e.target.checked
                                                    })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="success"
                                            onClick={testSetDiscount}
                                        >
                                            <Tag className="me-2" />
                                            Set Discount
                                        </Button>
                                        <Button 
                                            variant="danger"
                                            onClick={testRemoveDiscount}
                                        >
                                            <XCircle className="me-2" />
                                            Remove Discount
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <Button variant="primary" onClick={loadData}>
                                    <Tag className="me-2" />
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

export default StaffDiscountDebugPage;
