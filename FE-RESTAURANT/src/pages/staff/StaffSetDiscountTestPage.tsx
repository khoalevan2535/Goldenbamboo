import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, InputGroup } from 'react-bootstrap';
import { Tag, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { DishService } from '../../services/DishService';
import { ComboService } from '../../services/ComboService';
import { calculateDishPrice, calculateComboPrice, formatPrice, formatPercentage } from '../../utils/discountUtils';

const StaffSetDiscountTestPage: React.FC = () => {
    const { user } = useAuth();
    const { dishes, fetchDishesForStaff } = useDishes();
    const { combos, fetchCombosForStaff } = useCombos();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            await Promise.all([
                fetchDishesForStaff({ page: 0, size: 100 }),
                fetchCombosForStaff({ page: 0, size: 100 })
            ]);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const setDiscount = async (item: any, type: 'dish' | 'combo', discountData: any) => {
        try {
            setError(null);
            setSuccess(null);
            
            if (type === 'dish') {
                await DishService.updateDiscount(item.id, discountData);
                setSuccess(`Đã set discount cho món ăn: ${item.name}`);
            } else {
                // Tạm thời disable combo discount vì backend chưa hỗ trợ
                setError(`Combo discount chưa được hỗ trợ. Backend chưa implement API /combos/{id}/discount`);
                return;
            }
            
            await loadData(); // Reload data
        } catch (err: any) {
            setError(`Lỗi khi set discount: ${err.message}`);
        }
    };

    const removeDiscount = async (item: any, type: 'dish' | 'combo') => {
        try {
            setError(null);
            setSuccess(null);
            
            if (type === 'dish') {
                await DishService.removeDiscount(item.id);
                setSuccess(`Đã xóa discount cho món ăn: ${item.name}`);
            } else {
                // Tạm thời disable combo discount vì backend chưa hỗ trợ
                setError(`Combo discount chưa được hỗ trợ. Backend chưa implement API /combos/{id}/discount`);
                return;
            }
            
            await loadData(); // Reload data
        } catch (err: any) {
            setError(`Lỗi khi xóa discount: ${err.message}`);
        }
    };

    const quickSetDiscount = (item: any, type: 'dish' | 'combo', percentage: number) => {
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 30); // 30 ngày sau

        setDiscount(item, type, {
            discountPercentage: percentage,
            discountActive: true,
            discountStartDate: now.toISOString(),
            discountEndDate: endDate.toISOString()
        });
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
                            <h4>Set Discount Test (Staff)</h4>
                            <p className="mb-0 text-muted">Test set discount cho món ăn và combo để demo hệ thống</p>
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
                                <h5>Món ăn ({(dishes || []).length})</h5>
                                <Row>
                                    {(dishes || []).slice(0, 6).map(dish => {
                                        const discountInfo = calculateDishPrice(dish);
                                        return (
                                            <Col md={4} lg={3} key={dish.id} className="mb-3">
                                                <Card className="h-100">
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
                                                                            -{formatPercentage(discountInfo.discountPercentage)}
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
                                                        <div className="d-flex gap-1 flex-wrap">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-success"
                                                                onClick={() => quickSetDiscount(dish, 'dish', 10)}
                                                            >
                                                                10%
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-warning"
                                                                onClick={() => quickSetDiscount(dish, 'dish', 20)}
                                                            >
                                                                20%
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-danger"
                                                                onClick={() => quickSetDiscount(dish, 'dish', 30)}
                                                            >
                                                                30%
                                                            </Button>
                                                            {discountInfo.hasDiscount && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline-secondary"
                                                                    onClick={() => removeDiscount(dish, 'dish')}
                                                                >
                                                                    <XCircle size={12} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>

                            <div className="mb-4">
                                <h5>Combo ({(combos || []).length})</h5>
                                <Row>
                                    {(combos || []).slice(0, 4).map(combo => {
                                        const discountInfo = calculateComboPrice(combo);
                                        return (
                                            <Col md={4} lg={3} key={combo.id} className="mb-3">
                                                <Card className="h-100">
                                                    <Card.Img
                                                        variant="top"
                                                        src={combo.image || '/images/default-combo.svg'}
                                                        style={{ height: '120px', objectFit: 'cover' }}
                                                    />
                                                    <Card.Body>
                                                        <Card.Title className="h6">{combo.name}</Card.Title>
                                                        <div className="mb-2">
                                                            {discountInfo.hasDiscount ? (
                                                                <>
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <span className="text-success fw-bold">
                                                                            {formatPrice(discountInfo.finalPrice)}đ
                                                                        </span>
                                                                        <span className="badge bg-danger ms-2">
                                                                            -{formatPercentage(discountInfo.discountPercentage)}
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
                                                        <div className="d-flex gap-1 flex-wrap">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-secondary"
                                                                disabled
                                                                title="Combo discount chưa được hỗ trợ"
                                                            >
                                                                15% (N/A)
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-secondary"
                                                                disabled
                                                                title="Combo discount chưa được hỗ trợ"
                                                            >
                                                                25% (N/A)
                                                            </Button>
                                                            <small className="text-muted">Backend chưa hỗ trợ</small>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>

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

export default StaffSetDiscountTestPage;
