import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    const orderInfo = searchParams.get('vnp_OrderInfo');
    const txnRef = searchParams.get('vnp_TxnRef');

    if (responseCode === '00') {
      setPaymentStatus('success');
      setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xử lý.');
    } else {
      setPaymentStatus('failed');
      setMessage('Thanh toán thất bại. Vui lòng thử lại.');
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang xử lý kết quả thanh toán...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="text-center">
            <Card.Body className="py-5">
              {paymentStatus === 'success' ? (
                <>
                  <FaCheckCircle size={64} className="text-success mb-3" />
                  <h3 className="text-success mb-3">Thanh toán thành công!</h3>
                  <p className="text-muted mb-4">
                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xử lý thành công.
                  </p>
                  <Alert variant="success">
                    <strong>Mã đơn hàng:</strong> {searchParams.get('vnp_TxnRef')}
                  </Alert>
                </>
              ) : (
                <>
                  <FaTimesCircle size={64} className="text-danger mb-3" />
                  <h3 className="text-danger mb-3">Thanh toán thất bại</h3>
                  <p className="text-muted mb-4">
                    Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                  </p>
                  <Alert variant="danger">
                    <strong>Mã lỗi:</strong> {searchParams.get('vnp_ResponseCode')}
                  </Alert>
                </>
              )}
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary me-2"
                  onClick={() => navigate('/admin/staff-menu')}
                >
                  Quay lại Menu
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.close()}
                >
                  Đóng trang
                </button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

