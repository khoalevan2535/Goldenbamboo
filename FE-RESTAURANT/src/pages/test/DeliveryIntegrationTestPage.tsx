import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import DeliveryTestComponent from '../../components/delivery/DeliveryTestComponent';

const DeliveryIntegrationTestPage: React.FC = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>🚚 Test Tích Hợp Giao Hàng Tiết Kiệm</h3>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Trang này dùng để test tính năng tích hợp Giao Hàng Tiết Kiệm (GHTK) vào hệ thống.
              </p>
              
              <div className="alert alert-info">
                <h5>📋 Các tính năng cần test:</h5>
                <ul>
                  <li>✅ Kết nối API GHTK</li>
                  <li>✅ Lấy danh sách tỉnh/thành phố</li>
                  <li>✅ Lấy danh sách quận/huyện</li>
                  <li>✅ Lấy danh sách phường/xã</li>
                  <li>✅ Tính phí vận chuyển</li>
                  <li>✅ Tạo đơn hàng GHTK</li>
                  <li>✅ Quản lý địa chỉ giao hàng</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <DeliveryTestComponent />
        </Col>
      </Row>
    </Container>
  );
};

export default DeliveryIntegrationTestPage;


