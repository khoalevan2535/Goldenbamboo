import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { 
    CheckCircle, 
    ArrowRight, 
    InfoCircle,
    ExternalLink,
    Home,
    ShoppingCart,
    List,
    Clock,
    Person
} from 'react-bootstrap-icons';

const StaffGuidePage: React.FC = () => {
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
                                        <InfoCircle className="me-2 text-info" />
                                        Hướng dẫn sử dụng giao diện Staff mới
                                    </h4>
                                    <small className="text-muted">
                                        Giao diện giống admin/manager với đầy đủ chức năng
                                    </small>
                                </Col>
                                <Col md={4} className="text-end">
                                    <Alert variant="info" className="mb-0">
                                        <strong>ℹ️ Lưu ý:</strong> Sử dụng đường dẫn mới
                                    </Alert>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* URL Guide */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <ExternalLink className="me-2" />
                                Đường dẫn truy cập
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h6>✅ Đường dẫn mới (Khuyến nghị):</h6>
                                    <ul className="list-unstyled">
                                        <li className="mb-2">
                                            <Badge bg="success" className="me-2">NEW</Badge>
                                            <code>/staff/new/dashboard</code> - Dashboard
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="success" className="me-2">NEW</Badge>
                                            <code>/staff/new/order-management</code> - Quản lý đơn hàng
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="success" className="me-2">NEW</Badge>
                                            <code>/staff/new/order</code> - Tạo đơn hàng
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="success" className="me-2">NEW</Badge>
                                            <code>/staff/new/order-history</code> - Lịch sử đơn hàng
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="success" className="me-2">NEW</Badge>
                                            <code>/staff/new/tables</code> - Quản lý bàn
                                        </li>
                                    </ul>
                                </Col>
                                <Col md={6}>
                                    <h6>🔄 Đường dẫn cũ (Vẫn hoạt động):</h6>
                                    <ul className="list-unstyled">
                                        <li className="mb-2">
                                            <Badge bg="secondary" className="me-2">OLD</Badge>
                                            <code>/staff/order</code> - Tạo đơn hàng
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="secondary" className="me-2">OLD</Badge>
                                            <code>/staff/listorder</code> - Lịch sử đơn hàng
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="secondary" className="me-2">OLD</Badge>
                                            <code>/staff/tables</code> - Quản lý bàn
                                        </li>
                                        <li className="mb-2">
                                            <Badge bg="info" className="me-2">AUTO</Badge>
                                            <code>/staff/dashboard</code> - Tự động chuyển hướng
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Access */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <Home className="me-2" />
                                Dashboard
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p>Tổng quan hoạt động chi nhánh với thống kê và đơn hàng gần đây.</p>
                            <Button 
                                variant="primary" 
                                className="w-100"
                                onClick={() => window.location.href = '/staff/new/dashboard'}
                            >
                                <Home className="me-2" />
                                Truy cập Dashboard
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">
                                <List className="me-2" />
                                Quản lý đơn hàng
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p>Xem, cập nhật trạng thái và quản lý tất cả đơn hàng.</p>
                            <Button 
                                variant="success" 
                                className="w-100"
                                onClick={() => window.location.href = '/staff/new/order-management'}
                            >
                                <List className="me-2" />
                                Quản lý đơn hàng
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <ShoppingCart className="me-2" />
                                Tạo đơn hàng
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p>Tạo đơn hàng mới với menu và giỏ hàng trực quan.</p>
                            <Button 
                                variant="info" 
                                className="w-100"
                                onClick={() => window.location.href = '/staff/new/order'}
                            >
                                <ShoppingCart className="me-2" />
                                Tạo đơn hàng
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Features */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <CheckCircle className="me-2 text-success" />
                                Tính năng mới
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h6>🎨 Giao diện mới:</h6>
                                    <ul>
                                        <li>Layout giống admin/manager</li>
                                        <li>Sidebar navigation thống nhất</li>
                                        <li>Header với thông tin user</li>
                                        <li>Responsive design</li>
                                    </ul>
                                </Col>
                                <Col md={6}>
                                    <h6>⚡ Chức năng nâng cao:</h6>
                                    <ul>
                                        <li>Dashboard với thống kê</li>
                                        <li>Quản lý đơn hàng đầy đủ</li>
                                        <li>Realtime updates</li>
                                        <li>Pagination và search</li>
                                    </ul>
                                </Col>
                            </Row>
                            
                            <hr />
                            
                            <div className="text-center">
                                <h6>🚀 Bắt đầu sử dụng ngay!</h6>
                                <p className="text-muted">
                                    Giao diện staff mới đã sẵn sàng với đầy đủ chức năng.
                                    Hãy thử truy cập các đường dẫn mới để trải nghiệm.
                                </p>
                                
                                <div className="d-flex justify-content-center gap-3">
                                    <Button 
                                        variant="primary" 
                                        size="lg"
                                        onClick={() => window.location.href = '/staff/new/dashboard'}
                                    >
                                        <Home className="me-2" />
                                        Dashboard
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-primary" 
                                        size="lg"
                                        onClick={() => window.location.href = '/staff/new/order-management'}
                                    >
                                        <List className="me-2" />
                                        Quản lý đơn hàng
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-info" 
                                        size="lg"
                                        onClick={() => window.location.href = '/staff/new/demo'}
                                    >
                                        <InfoCircle className="me-2" />
                                        Demo
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

export default StaffGuidePage;
