import React from 'react';
import { Modal, Button, Row, Col, Card } from 'react-bootstrap';
import { CheckCircle, ArrowRight } from 'react-bootstrap-icons';
import '../../style/client/OrderSuccessModal.scss';

interface OrderSuccessModalProps {
    show: boolean;
    onHide: () => void;
    orderCode: string;
    totalAmount: number;
    onViewOrders: () => void;
    onBackToMenu: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
    show,
    onHide,
    orderCode,
    totalAmount,
    onViewOrders,
    onBackToMenu
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="order-success-modal"
        >
            <Modal.Body className="p-0">
                <div className="success-header">
                    <div className="success-icon">
                        <CheckCircle size={48} />
                    </div>
                    <h2>Đặt Hàng Thành Công! 🎉</h2>
                    <p>Cảm ơn bạn đã mua hàng tại Golden Bamboo</p>
                </div>

                <div className="order-details">
                    <Row>
                        <Col md={6}>
                            <Card className="detail-card">
                                <Card.Body>
                                    <div className="detail-item">
                                        <span className="label">Mã đơn hàng:</span>
                                        <span className="value order-code">{orderCode}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Tổng tiền:</span>
                                        <span className="value amount">{formatCurrency(totalAmount)}</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="detail-card">
                                <Card.Body>
                                    <div className="detail-item">
                                        <span className="label">Trạng thái:</span>
                                        <span className="value status">
                                            <span className="badge bg-warning">Chờ xử lý</span>
                                        </span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div className="next-steps">
                    <h5>Bước tiếp theo:</h5>
                    <div className="steps-list">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <strong>Xác nhận đơn hàng</strong>
                                <p>Nhân viên sẽ xác nhận đơn hàng của bạn trong vòng 5-10 phút</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <strong>Chuẩn bị món ăn</strong>
                                <p>Đầu bếp sẽ bắt đầu chuẩn bị món ăn theo yêu cầu</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <strong>Giao hàng</strong>
                                <p>Món ăn sẽ được giao đến địa chỉ của bạn</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <Button
                        variant="outline-primary"
                        size="lg"
                        onClick={onViewOrders}
                        className="view-orders-btn"
                    >
                        <ArrowRight className="me-2" />
                        Xem đơn hàng của tôi
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={onBackToMenu}
                        className="back-menu-btn"
                    >
                        Quay về Menu
                    </Button>
                </div>

                <div className="contact-info">
                    <p>
                        <strong>Liên hệ hỗ trợ:</strong> 1900-xxxx |
                        <strong>Email:</strong> support@goldenbamboo.com
                    </p>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default OrderSuccessModal;
