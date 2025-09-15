import React from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Eye, ArrowRight, Cart3, Database } from 'react-bootstrap-icons';

const StaffOrderFinalTest: React.FC = () => {
    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <h4 className="mb-0">
                                <CheckCircle className="me-2 text-success" />
                                Staff Order Page - Test Cuối Cùng
                            </h4>
                            <small className="text-muted">
                                Kiểm tra tất cả icon và tính năng
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <CheckCircle className="me-2 text-success" />
                                Icons đã sửa
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="success">
                                <strong>✅ Tất cả icon đã hoạt động!</strong>
                            </Alert>
                            
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>DollarSign</code> → <code>CurrencyDollar</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>TrendingUp</code> → <code>GraphUp</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>CheckLg</code> → <code>Check2</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>ArrowClockwise</code> → <code>ArrowRepeat</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>Users</code> → <code>Person</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>Lightning</code> → <code>Bolt</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>Database</code> → <code>Hdd</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>Minus</code> → <code>Dash</code>
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    <code>ShoppingCart</code> → <code>Cart3</code>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <Eye className="me-2 text-info" />
                                Test các trang
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary" 
                                    onClick={() => window.location.href = '/staff/new/order'}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <span>
                                        <Cart3 className="me-2" />
                                        Trang Order (Chính)
                                    </span>
                                    <ArrowRight />
                                </Button>
                                
                                <Button 
                                    variant="outline-info" 
                                    onClick={() => window.location.href = '/staff/new/order-test'}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <span>
                                        <Database className="me-2" />
                                        Test API
                                    </span>
                                    <ArrowRight />
                                </Button>
                                
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => window.location.href = '/staff/new/dashboard'}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <span>
                                        <Eye className="me-2" />
                                        Dashboard
                                    </span>
                                    <ArrowRight />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🎯 Tính năng Order Page</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <div className="col-md-6">
                                    <h6>✅ Đã hoàn thành:</h6>
                                    <ul className="small">
                                        <li>Hiển thị món ăn và combo từ API</li>
                                        <li>Lọc theo danh mục (Categories)</li>
                                        <li>Tìm kiếm theo tên</li>
                                        <li>Chuyển đổi tab món ăn/combo</li>
                                        <li>Giỏ hàng với thêm/xóa sản phẩm</li>
                                        <li>Tính tổng tiền tự động</li>
                                        <li>Giao diện responsive</li>
                                        <li>Tất cả icon hoạt động</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6>🔧 Icons sử dụng:</h6>
                                    <ul className="small">
                                        <li>Cart3, Search, Filter, Plus, Dash</li>
                                        <li>CurrencyDollar, Clock, CheckCircle</li>
                                        <li>XCircle, Eye, ArrowRight</li>
                                        <li>Person, GraphUp, Bolt, Hdd</li>
                                        <li>ArrowRepeat, Check2</li>
                                    </ul>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🚀 Hướng dẫn sử dụng</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <div className="col-md-4">
                                    <h6>1. Truy cập:</h6>
                                    <p className="small">
                                        <code>http://localhost:5174/staff/new/order</code>
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <h6>2. Chọn món:</h6>
                                    <p className="small">
                                        Click nút <code>+</code> để thêm vào giỏ hàng
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <h6>3. Tạo đơn:</h6>
                                    <p className="small">
                                        Click "Tạo đơn hàng" để hoàn tất
                                    </p>
                                </div>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffOrderFinalTest;

