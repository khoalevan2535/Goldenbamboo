import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { CheckCircle, ArrowRight } from 'react-bootstrap-icons';

const StaffTestPage: React.FC = () => {
    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <h4 className="mb-0">
                                        <CheckCircle className="me-2 text-success" />
                                        Test Page - Staff Interface
                                    </h4>
                                    <small className="text-muted">
                                        Kiểm tra giao diện staff mới
                                    </small>
                                </Col>
                                <Col md={4} className="text-end">
                                    <Alert variant="success" className="mb-0">
                                        <strong>✅ Hoạt động!</strong> Import CSS đã được sửa
                                    </Alert>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🎯 Tính năng đã hoàn thành</h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Layout mới giống admin/manager
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Sidebar navigation thống nhất
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Dashboard với thống kê
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Quản lý đơn hàng đầy đủ
                                </li>
                                <li className="mb-2">
                                    <CheckCircle className="text-success me-2" />
                                    Import CSS đã được sửa
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">🚀 Cách sử dụng</h5>
                        </Card.Header>
                        <Card.Body>
                            <p>Giao diện staff mới đã sẵn sàng sử dụng:</p>
                            
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary"
                                    onClick={() => window.location.href = '/staff/new/dashboard'}
                                >
                                    <CheckCircle className="me-2" />
                                    Dashboard
                                    <ArrowRight className="ms-2" />
                                </Button>
                                
                                <Button 
                                    variant="outline-primary"
                                    onClick={() => window.location.href = '/staff/new/order-management'}
                                >
                                    <CheckCircle className="me-2" />
                                    Quản lý đơn hàng
                                    <ArrowRight className="ms-2" />
                                </Button>
                                
                                <Button 
                                    variant="outline-info"
                                    onClick={() => window.location.href = '/staff/new/demo'}
                                >
                                    <CheckCircle className="me-2" />
                                    Trang demo
                                    <ArrowRight className="ms-2" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffTestPage;

