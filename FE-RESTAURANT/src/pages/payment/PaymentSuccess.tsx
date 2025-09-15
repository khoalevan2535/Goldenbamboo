import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { CheckCircle, XCircle, ArrowLeft } from 'react-bootstrap-icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VNPayService } from '../../services/VNPayService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        // Get payment parameters from URL
        const params = Object.fromEntries(searchParams.entries());
        
        // Call backend to verify payment
        const result = await VNPayService.handlePaymentReturn(params);
        
        setPaymentResult(result);
        
        if (result.success) {
          toast.success('Thanh toán thành công!');
        } else {
          toast.error('Thanh toán thất bại!');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Lỗi xác thực thanh toán!');
        setPaymentResult({
          success: false,
          message: 'Lỗi xác thực thanh toán'
        });
      } finally {
        setLoading(false);
      }
    };

    handlePaymentResult();
  }, [searchParams]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang xác thực thanh toán...</p>
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
              {paymentResult?.success ? (
                <>
                  <CheckCircle size={80} className="text-success mb-3" />
                  <h3 className="text-success mb-3">Thanh toán thành công!</h3>
                  <p className="text-muted mb-4">
                    Cảm ơn bạn đã đặt hàng tại Golden Bamboo Restaurant.
                    Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
                  </p>
                  {paymentResult.orderId && (
                    <Alert variant="info">
                      <strong>Mã đơn hàng:</strong> {paymentResult.orderId}
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <XCircle size={80} className="text-danger mb-3" />
                  <h3 className="text-danger mb-3">Thanh toán thất bại!</h3>
                  <p className="text-muted mb-4">
                    {paymentResult?.message || 'Có lỗi xảy ra trong quá trình thanh toán.'}
                  </p>
                </>
              )}
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/order')}
                >
                  <ArrowLeft className="me-2" />
                  Quay lại đặt hàng
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Về trang chủ
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default PaymentSuccess;
