import React from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Eye, ArrowRight, Cart3, Database } from 'react-bootstrap-icons';

const StaffOrderSummary: React.FC = () => {
    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <h4 className="mb-0">
                                <CheckCircle className="me-2 text-success" />
                                Staff Order Page - Hoàn thành
                            </h4>
                            <small className="text-muted">
                                Trang tạo đơn hàng cho staff đã được triển khai
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
                                Tính năng đã triển khai
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="success">
                                <strong>✅ Hoàn thành!</strong>
                            </Alert>
                            
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Hiển thị tất cả món ăn và combo
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Lọc theo danh mục
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Tìm kiếm món ăn/combo
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Chuyển đổi giữa món ăn và combo
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Giỏ hàng với thêm/xóa sản phẩm
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Tính tổng tiền tự động
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Giao diện responsive
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Layout giống admin/manager
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
                                Các trang có sẵn
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
                                        Trang tạo đơn hàng
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
                            <h5 className="mb-0">📋 Chi tiết triển khai</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <div className="col-md-6">
                                    <h6>🎯 Tính năng chính:</h6>
                                    <ul className="small">
                                        <li>Hiển thị món ăn và combo từ API</li>
                                        <li>Lọc theo danh mục (Categories)</li>
                                        <li>Tìm kiếm theo tên</li>
                                        <li>Chuyển đổi tab món ăn/combo</li>
                                        <li>Giỏ hàng với thêm/xóa sản phẩm</li>
                                        <li>Tính tổng tiền tự động</li>
                                        <li>Giao diện responsive</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6>🔧 Công nghệ sử dụng:</h6>
                                    <ul className="small">
                                        <li>React + TypeScript</li>
                                        <li>React Bootstrap</li>
                                        <li>Custom hooks (useDishes, useCombos, useCategories)</li>
                                        <li>API integration</li>
                                        <li>State management</li>
                                        <li>Responsive design</li>
                                        <li>Error handling</li>
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
                                    <h6>1. Truy cập trang:</h6>
                                    <p className="small">
                                        Vào <code>http://localhost:5173/staff/new/order</code>
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <h6>2. Chọn món ăn:</h6>
                                    <p className="small">
                                        Click nút <code>+</code> để thêm vào giỏ hàng
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <h6>3. Tạo đơn hàng:</h6>
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

export default StaffOrderSummary;

