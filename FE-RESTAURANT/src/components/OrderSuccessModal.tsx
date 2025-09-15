import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CheckCircle, Receipt, Clock, CurrencyDollar, Cart3 } from 'react-bootstrap-icons';

interface OrderSuccessModalProps {
    show: boolean;
    onHide: () => void;
    orderData: {
        id: string | number;
        totalAmount: number;
        itemCount: number;
        createdAt: string;
    };
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ show, onHide, orderData }) => {
    return (
        <Modal show={show} onHide={onHide} centered size="md">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="d-flex align-items-center">
                    <CheckCircle className="text-success me-2" size={24} />
                    <span className="text-success fw-bold">Đơn hàng tạo thành công!</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
                <div className="text-center mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '80px', height: '80px' }}>
                        <CheckCircle className="text-success" size={40} />
                    </div>
                    <h5 className="text-success mb-2">Cảm ơn bạn đã sử dụng dịch vụ!</h5>
                    <p className="text-muted">Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
                </div>

                <div className="bg-light rounded p-3 mb-3">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                        <Receipt className="me-2" />
                        Thông tin đơn hàng
                    </h6>
                    <div className="row g-2">
                        <div className="col-6">
                            <div className="d-flex align-items-center">
                                <Receipt className="text-primary me-2" size={16} />
                                <div>
                                    <small className="text-muted">Mã đơn hàng</small>
                                    <div className="fw-bold">#{orderData.id}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center">
                                <CurrencyDollar className="text-success me-2" size={16} />
                                <div>
                                    <small className="text-muted">Tổng tiền</small>
                                    <div className="fw-bold text-success">
                                        {orderData.totalAmount?.toLocaleString()}đ
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center">
                                <Cart3 className="text-info me-2" size={16} />
                                <div>
                                    <small className="text-muted">Số món</small>
                                    <div className="fw-bold">{orderData.itemCount} món</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center">
                                <Clock className="text-warning me-2" size={16} />
                                <div>
                                    <small className="text-muted">Thời gian</small>
                                    <div className="fw-bold small">
                                        {new Date(orderData.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="alert alert-info mb-0">
                    <small>
                        <strong>Lưu ý:</strong> Đơn hàng đang ở trạng thái "Đang chờ xử lý". 
                        Bạn có thể theo dõi trạng thái đơn hàng trong phần "Quản lý đơn hàng".
                    </small>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="outline-secondary" onClick={onHide} className="me-2">
                    Đóng
                </Button>
                <Button variant="primary" onClick={onHide}>
                    Tạo đơn hàng mới
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default OrderSuccessModal;
