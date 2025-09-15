import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { CreditCard, Cash, QrCode, CheckCircle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import apiClient from '../utils/apiClient';

interface PaymentModalProps {
    show: boolean;
    onHide: () => void;
    order: any;
    onPaymentSuccess: () => void;
}

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    variant: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ show, onHide, order, onPaymentSuccess }) => {
    // Fix timer error
    React.useEffect(() => {
        if (typeof window !== 'undefined' && !window.timer) {
            window.timer = null;
        }
    }, []);
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [vnpayUrl, setVnpayUrl] = useState<string>('');

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'VNPAY',
            name: 'VNPay',
            description: 'Thanh toán qua VNPay (Thẻ ATM, Visa, Mastercard)',
            icon: <CreditCard size={24} />,
            variant: 'primary'
        },
        {
            id: 'COD',
            name: 'Tiền mặt',
            description: 'Thanh toán khi nhận hàng (Cash on Delivery)',
            icon: <Cash size={24} />,
            variant: 'success'
        }
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        // Kiểm tra tổng tiền
        if (!order.totalAmount || order.totalAmount <= 0) {
            toast.error('Không thể thanh toán đơn hàng có tổng tiền bằng 0');
            return;
        }

        setProcessing(true);
        try {
            if (selectedMethod === 'VNPAY') {
                // Gọi API tạo URL thanh toán VNPay
                const requestData = {
                    orderId: order.id,
                    amount: order.totalAmount,
                    orderInfo: `Thanh toan don hang #${order.id}`,
                    returnUrl: `https://f0caf9603318.ngrok-free.app/api/payment/vnpay/return`,
                    cancelUrl: `${window.location.origin}/payment/cancel`
                };
                
                console.log('Sending VNPay request:', requestData);
                console.log('API URL:', '/payment/vnpay/create');

                const response = await apiClient.post('/payment/vnpay/create', requestData);

                console.log('VNPay API response:', response);

                if (!response) {
                    throw new Error('Không nhận được dữ liệu từ server');
                }

                const paymentUrl = response.paymentUrl;
                if (!paymentUrl) {
                    console.error('Payment URL is missing from response:', response);
                    throw new Error('Không nhận được URL thanh toán từ server');
                }

                setVnpayUrl(paymentUrl);
                
                // Mở cửa sổ thanh toán VNPay
                window.open(paymentUrl, '_blank', 'width=800,height=600');
                
                toast.success('Đang chuyển đến trang thanh toán VNPay...');
            } else if (selectedMethod === 'COD') {
                // Xử lý thanh toán COD
                const response = await apiClient.post('/payment/cod/process', {
                    orderId: order.id,
                    amount: order.totalAmount
                });

                toast.success('Đã xác nhận thanh toán tiền mặt');
                onPaymentSuccess();
                onHide();
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: error.config
            });
            
            if (selectedMethod === 'VNPAY') {
                // Thử tạo URL VNPay thông qua API backend
                try {
                    const vnpayResponse = await apiClient.post('/payment/vnpay/create', {
                        orderId: order.id,
                        amount: order.totalAmount,
                        orderInfo: `Thanh toan don hang #${order.id}`,
                        returnUrl: 'http://localhost:5173/payment/success', // Development URL
                        clientIp: '127.0.0.1' // Có thể lấy IP thực từ server
                    });
                    
                    if (vnpayResponse.data.success && vnpayResponse.data.paymentUrl) {
                        console.log('VNPay URL created:', vnpayResponse.data.paymentUrl);
                        setVnpayUrl(vnpayResponse.data.paymentUrl);
                        window.open(vnpayResponse.data.paymentUrl, '_blank', 'width=800,height=600');
                        toast.success('Đang chuyển đến trang thanh toán VNPay...');
                    } else {
                        throw new Error(vnpayResponse.data.message || 'Không thể tạo URL VNPay');
                    }
                } catch (vnpayError) {
                    console.error('VNPay API error:', vnpayError);
                    toast.error('Không thể kết nối VNPay. Vui lòng thử lại sau.');
                }
            } else {
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleVnpayReturn = async () => {
        // Kiểm tra kết quả thanh toán VNPay
        const urlParams = new URLSearchParams(window.location.search);
        const vnpResponseCode = urlParams.get('vnp_ResponseCode');
        const vnpTxnRef = urlParams.get('vnp_TxnRef');

        if (vnpResponseCode === '00') {
            // Thanh toán thành công
            try {
                await apiClient.post('/payment/vnpay/verify', {
                    orderId: order.id,
                    vnpTxnRef: vnpTxnRef
                });
                
                toast.success('Thanh toán VNPay thành công!');
                onPaymentSuccess();
                onHide();
            } catch (error) {
                toast.error('Có lỗi xảy ra khi xác minh thanh toán');
            }
        } else {
            toast.error('Thanh toán VNPay thất bại');
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <div className="d-flex align-items-center">
                        <QrCode className="me-2" />
                        Thanh toán đơn hàng #{order?.id}
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {order && (
                    <>
                        {/* Thông tin đơn hàng */}
                        <Alert variant="info" className="mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Bàn:</strong> {order.tableName}<br />
                                    <strong>Khách hàng:</strong> {order.customerName || 'Khách lẻ'}<br />
                                                                         <strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', {
                                         style: 'currency',
                                         currency: 'VND'
                                     }).format(order.totalAmount || 0)}
                                </div>
                                <Badge bg="warning" className="fs-6">
                                    Chờ thanh toán
                                </Badge>
                            </div>
                        </Alert>

                        {/* Chọn phương thức thanh toán */}
                        <h6 className="mb-3">Chọn phương thức thanh toán:</h6>
                        <Row className="g-3 mb-4">
                            {paymentMethods.map((method) => (
                                <Col md={6} key={method.id}>
                                    <div 
                                        className={`payment-method-card p-3 border rounded cursor-pointer ${
                                            selectedMethod === method.id ? 'border-primary bg-light' : 'border-light'
                                        }`}
                                        onClick={() => setSelectedMethod(method.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className={`me-3 text-${method.variant}`}>
                                                {method.icon}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{method.name}</h6>
                                                <small className="text-muted">{method.description}</small>
                                            </div>
                                            {selectedMethod === method.id && (
                                                <CheckCircle className="text-primary" size={20} />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* Thông tin thanh toán VNPay */}
                        {selectedMethod === 'VNPAY' && (
                            <Alert variant="primary">
                                <h6>Thanh toán qua VNPay</h6>
                                <p className="mb-2">Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch.</p>
                                <ul className="mb-0 small">
                                    <li>Chấp nhận thẻ ATM, Visa, Mastercard</li>
                                    <li>Thanh toán an toàn và bảo mật</li>
                                    <li>Nhận xác nhận ngay lập tức</li>
                                </ul>
                            </Alert>
                        )}

                        {/* Thông tin thanh toán COD */}
                        {selectedMethod === 'COD' && (
                            <Alert variant="success">
                                <h6>Thanh toán tiền mặt</h6>
                                <p className="mb-2">Khách hàng sẽ thanh toán bằng tiền mặt khi nhận hàng.</p>
                                <ul className="mb-0 small">
                                    <li>Không cần thẻ ngân hàng</li>
                                    <li>Thanh toán khi nhận hàng</li>
                                    <li>Phù hợp cho khách hàng không có thẻ</li>
                                </ul>
                            </Alert>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={processing}>
                    Hủy
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handlePayment}
                    disabled={!selectedMethod || processing}
                >
                    {processing ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        'Xác nhận thanh toán'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PaymentModal;
