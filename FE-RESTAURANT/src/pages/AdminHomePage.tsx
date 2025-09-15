import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

export default function AdminHomePage() {
  return (
    <div className="container mt-4">
      {/* Tiêu đề */}
      <h2 className="mb-4 fw-bold text-primary">Trang chủ quản trị chuỗi nhà hàng</h2>

      {/* Lời chào */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>🍽 Chào mừng bạn quay lại!</h5>
          <p>Quản lý toàn bộ hệ thống nhà hàng của bạn từ một nơi.</p>
        </Card.Body>
      </Card>

      {/* Các ô thống kê */}
      <Row className="g-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">Số nhà hàng</h5>
              <h2 className="fw-bold text-primary">4</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">Món ăn</h5>
              <h2 className="fw-bold text-success">6</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">Đơn hàng hôm nay</h5>
              <h2 className="fw-bold text-warning">20</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">Doanh thu hôm nay</h5>
              <h2 className="fw-bold text-danger">25,500,000 ₫</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Phần hướng dẫn / thông báo */}
      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-bold mb-3">📢 Thông báo mới</h5>
          <ul>
            <li>Nhà hàng chi nhánh Hà Nội đã đạt 200 đơn hôm nay.</li>
            <li>Hệ thống sẽ bảo trì từ 0h-2h sáng mai.</li>
            <li>Thêm món mới vào thực đơn tháng này.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}
