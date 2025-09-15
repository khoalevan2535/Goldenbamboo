import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { XCircle, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="text-center">
            <Card.Body className="py-5">
              <XCircle size={80} className="text-warning mb-3" />
              <h3 className="text-warning mb-3">Thanh toán đã bị hủy</h3>
              <p className="text-muted mb-4">
                Bạn đã hủy quá trình thanh toán. 
                Đơn hàng của bạn chưa được xử lý.
              </p>
              
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

export default PaymentCancel;






