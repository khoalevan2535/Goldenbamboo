import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../../services/OrderService';
import { FaCheckCircle, FaTruck, FaHome } from 'react-icons/fa';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderStatus, setOrderStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    handlePaymentSuccess();
  }, []);

  const handlePaymentSuccess = async () => {
    try {
      // Lấy orderId từ URL params hoặc VNPay response
      const urlParams = new URLSearchParams(window.location.search);
      let pendingOrderId = urlParams.get('orderId');
      
      // Nếu không có orderId, thử lấy từ vnp_OrderInfo (VNPay response)
      if (!pendingOrderId) {
        const vnpOrderInfo = urlParams.get('vnp_OrderInfo');
        if (vnpOrderInfo) {
          // VNPay OrderInfo thường có format: "Thanh toan don hang #ORDER_ID"
          const orderIdMatch = vnpOrderInfo.match(/#(\d+)/);
          if (orderIdMatch) {
            pendingOrderId = orderIdMatch[1];
          }
        }
      }
      
      console.log('🔍 URL params:', Object.fromEntries(urlParams.entries()));
      console.log('🔍 Extracted orderId:', pendingOrderId);
      
      if (!pendingOrderId) {
        throw new Error('Không tìm thấy thông tin đơn hàng trong URL');
      }

      console.log('🚀 Processing payment success for order:', pendingOrderId);

      // Xác nhận thanh toán và tạo đơn GHTK
      const response = await orderService.confirmPaymentAndCreateGHTKOrder(pendingOrderId);
      
      console.log('🔍 Payment confirmation response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', response ? Object.keys(response) : 'response is null/undefined');
      
      // Kiểm tra response có tồn tại và có thuộc tính success
      if (response && typeof response === 'object' && response.success === true) {
        setOrderStatus('success');
        setOrderInfo(response);
        
        // Không cần xóa localStorage vì không lưu nữa
        
        toast.success('Thanh toán thành công! Đơn hàng đã được tạo và giao cho GHTK.');
      } else {
        console.error('❌ Response không có success: true. Full response:', response);
        const errorMsg = (response && response.message) ? response.message : 'Không thể xác nhận thanh toán';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Error processing payment success:', error);
      setOrderStatus('error');
      setErrorMessage(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    if (orderInfo?.orderId) {
      navigate(`/orders/${orderInfo.orderId}`);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5 text-center">
              {isProcessing && (
                <>
                  <div className="mb-4">
                    <Spinner animation="border" variant="primary" size="lg" />
                  </div>
                  <h4 className="text-primary mb-3">Đang xử lý thanh toán...</h4>
                  <p className="text-muted">
                    Vui lòng chờ trong giây lát. Chúng tôi đang xác nhận thanh toán và tạo đơn hàng GHTK.
                  </p>
                </>
              )}

              {orderStatus === 'success' && (
                <>
                  <div className="mb-4">
                    <FaCheckCircle size={64} className="text-success" />
                  </div>
                  <h4 className="text-success mb-3">Thanh toán thành công!</h4>
                  <p className="text-muted mb-4">
                    Cảm ơn bạn đã đặt hàng. Đơn hàng đã được tạo và giao cho GHTK để vận chuyển.
                  </p>
                  
                  {orderInfo && (
                    <div className="bg-light p-3 rounded mb-4">
                      <div className="row text-start">
                        <div className="col-6">
                          <small className="text-muted">Mã đơn hàng:</small>
                          <div className="fw-bold">{orderInfo.orderId}</div>
                        </div>
                        {orderInfo.ghtkOrderId && (
                          <div className="col-6">
                            <small className="text-muted">Mã GHTK:</small>
                            <div className="fw-bold text-primary">{orderInfo.ghtkOrderId}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleViewOrder}
                      className="mb-2"
                    >
                      <FaTruck className="me-2" />
                      Xem chi tiết đơn hàng
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleBackToHome}
                    >
                      <FaHome className="me-2" />
                      Về trang chủ
                    </Button>
                  </div>
                </>
              )}

              {orderStatus === 'error' && (
                <>
                  <div className="mb-4">
                    <FaCheckCircle size={64} className="text-warning" />
                  </div>
                  <h4 className="text-warning mb-3">Thanh toán đã thành công</h4>
                  <Alert variant="warning" className="text-start">
                    <strong>Lưu ý:</strong> Thanh toán đã được xử lý thành công, nhưng có lỗi khi tạo đơn hàng GHTK.
                    <br />
                    <strong>Lỗi:</strong> {errorMessage}
                    <br />
                    <br />
                    Vui lòng liên hệ hỗ trợ để được hỗ trợ xử lý đơn hàng.
                  </Alert>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleBackToHome}
                    >
                      <FaHome className="me-2" />
                      Về trang chủ
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccessPage;


