import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { 
    Cart3, 
    Eye, 
    Clock,
    CheckCircle,
    GraphUp,
    Person,
    ArrowRight
} from 'react-bootstrap-icons';

const StaffDemoPage: React.FC = () => {
    return (
        <Container fluid className="mt-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <h4 className="mb-0">
                                        <GraphUp className="me-2" />
                                        Giao diện Staff mới - Giống Admin/Manager
                                    </h4>
                                    <small className="text-muted">
                                        Layout và giao diện tương tự như admin và manager
                                    </small>
                                </Col>
                                <Col md={4} className="text-end">
                                    <Alert variant="success" className="mb-0">
                                        <strong>✅ Hoàn thành!</strong> Giao diện đã sẵn sàng
                                    </Alert>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Features Overview */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <Cart3 className="me-2" />
                                Quản lý đơn hàng
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Tạo đơn hàng mới
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Quản lý trạng thái đơn hàng
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Xem chi tiết đơn hàng
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Thanh toán đơn hàng
                                </li>
                            </ul>
                            <Button 
                                variant="primary" 
                                className="w-100"
                                onClick={() => window.location.href = '/staff/new/order-management'}
                            >
                                <Eye className="me-2" />
                                Xem giao diện
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <TrendingUp className="me-2" />
                                Dashboard
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Thống kê tổng quan
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Đơn hàng gần đây
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Thao tác nhanh
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Giao diện hiện đại
                                </li>
                            </ul>
                            <Button 
                                variant="info" 
                                className="w-100"
                                onClick={() => window.location.href = '/staff/new/dashboard'}
                            >
                                <TrendingUp className="me-2" />
                                Xem Dashboard
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">
                                <Person className="me-2" />
                                Layout mới
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Sidebar giống admin/manager
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Header thống nhất
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Responsive design
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Navigation dễ dàng
                                </li>
                            </ul>
                            <Button 
                                variant="success" 
                                className="w-100"
                                onClick={() => window.location.href = '/staff/new'}
                            >
                                <Person className="me-2" />
                                Trải nghiệm
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Navigation Guide */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <Clock className="me-2" />
                                Hướng dẫn sử dụng
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h6>🔗 Các đường dẫn mới:</h6>
                                    <ul>
                                        <li><code>/staff/new/dashboard</code> - Dashboard tổng quan</li>
                                        <li><code>/staff/new/order</code> - Tạo đơn hàng</li>
                                        <li><code>/staff/new/order-management</code> - Quản lý đơn hàng</li>
                                        <li><code>/staff/new/order-history</code> - Lịch sử đơn hàng</li>
                                        <li><code>/staff/new/tables</code> - Quản lý bàn</li>
                                    </ul>
                                </Col>
                                <Col md={6}>
                                    <h6>🎯 Tính năng chính:</h6>
                                    <ul>
                                        <li>Giao diện giống admin/manager</li>
                                        <li>Sidebar navigation thống nhất</li>
                                        <li>Dashboard với thống kê</li>
                                        <li>Quản lý đơn hàng đầy đủ</li>
                                        <li>Responsive trên mọi thiết bị</li>
                                    </ul>
                                </Col>
                            </Row>
                            
                            <hr />
                            
                            <div className="text-center">
                                <h6>🚀 Sẵn sàng sử dụng!</h6>
                                <p className="text-muted">
                                    Giao diện staff mới đã được tạo với layout và chức năng tương tự admin/manager.
                                    Bạn có thể truy cập qua đường dẫn <code>/staff/new</code>
                                </p>
                                
                                <div className="d-flex justify-content-center gap-3">
                                    <Button 
                                        variant="primary" 
                                        size="lg"
                                        onClick={() => window.location.href = '/staff/new/dashboard'}
                                    >
                                        <GraphUp className="me-2" />
                                        Bắt đầu với Dashboard
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-primary" 
                                        size="lg"
                                        onClick={() => window.location.href = '/staff/new/order-management'}
                                    >
                                        <Cart3 className="me-2" />
                                        Quản lý đơn hàng
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffDemoPage;
