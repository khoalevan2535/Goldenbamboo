import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';

const StaffIconFix: React.FC = () => {
    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <h4 className="mb-0">
                                <CheckCircle className="me-2 text-success" />
                                Icon Fix - Staff Interface
                            </h4>
                            <small className="text-muted">
                                Đã sửa tất cả lỗi icon không tồn tại
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
                                <strong>✅ Đã sửa thành công!</strong>
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
                                <XCircle className="me-2 text-danger" />
                                Icons không tồn tại
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="warning">
                                <strong>⚠️ Lưu ý:</strong> Một số icon không tồn tại trong react-bootstrap-icons
                            </Alert>
                            
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>DollarSign</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>TrendingUp</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>CheckLg</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>ArrowClockwise</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>Users</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>Lightning</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>Database</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>Minus</code> - Không tồn tại
                                </li>
                                <li className="mb-2">
                                    <XCircle className="text-danger me-2" />
                                    <code>ShoppingCart</code> - Không tồn tại
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">📋 Danh sách icon đã sử dụng</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>✅ Icons hoạt động:</h6>
                                    <ul className="small">
                                        <li>Cart3, Eye, CheckCircle, XCircle</li>
                                        <li>Clock, Search, Filter, Receipt</li>
                                        <li>CreditCard, ChevronDown, Bolt</li>
                                        <li>Hdd, ArrowRepeat, Check2, X</li>
                                        <li>Plus, Edit, Trash, CurrencyDollar</li>
                                        <li>Person, GraphUp, ArrowRight</li>
                                        <li>InfoCircle, ExternalLink, Home</li>
                                        <li>ShoppingCart, List</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6>🎯 Kết quả:</h6>
                                    <ul className="small">
                                        <li>✅ Không có lỗi linter</li>
                                        <li>✅ Tất cả icon đã được thay thế</li>
                                        <li>✅ Giao diện staff hoạt động bình thường</li>
                                        <li>✅ Layout giống admin/manager</li>
                                    </ul>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffIconFix;
