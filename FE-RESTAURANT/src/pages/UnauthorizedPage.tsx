import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaSignInAlt } from 'react-icons/fa';

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="text-center border-warning">
            <Card.Header className="bg-warning text-dark">
              <FaExclamationTriangle className="me-2" />
              <strong>Không có quyền truy cập</strong>
            </Card.Header>
            <Card.Body>
              <h4 className="text-warning mb-3">⚠️ Truy cập bị từ chối</h4>
              <p className="text-muted mb-4">
                Bạn không có quyền truy cập vào trang này. 
                Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
              </p>
              
              <div className="mb-3">
                <small className="text-muted">
                  Đang cố gắng truy cập: <code>{from}</code>
                </small>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/')}
                  className="d-flex align-items-center"
                >
                  <FaHome className="me-2" />
                  Về trang chủ
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/login')}
                  className="d-flex align-items-center"
                >
                  <FaSignInAlt className="me-2" />
                  Đăng nhập khác
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
