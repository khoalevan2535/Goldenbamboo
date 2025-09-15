import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import CommentSection from '../components/CommentSection';
import styles from '../style/CommentDemoPage.module.scss';

const CommentDemoPage: React.FC = () => {
  const handleCommentAdded = (comment: any) => {
    console.log('New comment added:', comment);
  };

  return (
    <div className={styles.demoPage}>
      <Container fluid>
        <Row>
          <Col>
            {/* Header */}
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                <i className="fas fa-comments me-3"></i>
                Demo Giao Diện Bình Luận
              </h1>
              <p className={styles.pageSubtitle}>
                Giao diện bình luận hiện đại và responsive cho client - Tích hợp API thực tế
              </p>
            </div>

            {/* Demo Info Cards */}
            <Row className="mb-5">
              <Col md={4} className="mb-3">
                <Card className={styles.infoCard}>
                  <Card.Body className="text-center">
                    <i className="fas fa-star text-warning mb-3" style={{ fontSize: '2rem' }}></i>
                    <h5>Đánh giá Sao</h5>
                    <p className="text-muted">Hệ thống đánh giá 5 sao tương tác với API</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className={styles.infoCard}>
                  <Card.Body className="text-center">
                    <i className="fas fa-reply text-primary mb-3" style={{ fontSize: '2rem' }}></i>
                    <h5>Trả lời Bình luận</h5>
                    <p className="text-muted">Chức năng trả lời và tương tác real-time</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className={styles.infoCard}>
                  <Card.Body className="text-center">
                    <i className="fas fa-mobile-alt text-success mb-3" style={{ fontSize: '2rem' }}></i>
                    <h5>Responsive Design</h5>
                    <p className="text-muted">Tối ưu cho mọi thiết bị</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Comment Section cho Sản phẩm */}
            <Row className="mb-5">
              <Col>
                <Card className={styles.demoCard}>
                  <Card.Header className={styles.demoHeader}>
                    <h4 className="mb-0">
                      <i className="fas fa-utensils me-2"></i>
                      Bình luận cho Sản phẩm (Product ID: 1)
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <CommentSection 
                      productId={1}
                      onCommentAdded={handleCommentAdded}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Comment Section cho Nhà hàng */}
            <Row className="mb-5">
              <Col>
                <Card className={styles.demoCard}>
                  <Card.Header className={styles.demoHeader}>
                    <h4 className="mb-0">
                      <i className="fas fa-store me-2"></i>
                      Bình luận cho Nhà hàng (Restaurant ID: 1)
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <CommentSection 
                      restaurantId={1}
                      onCommentAdded={handleCommentAdded}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Features List */}
            <Row className="mt-5">
              <Col lg={8} className="mx-auto">
                <Card className={styles.featuresCard}>
                  <Card.Header className={styles.featuresHeader}>
                    <h4 className="mb-0">
                      <i className="fas fa-list-check me-2"></i>
                      Tính năng chính
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <ul className={styles.featuresList}>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Đánh giá 5 sao tương tác
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Form viết bình luận hiện đại
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Trả lời bình luận
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Avatar và thông tin người dùng
                          </li>
                        </ul>
                      </Col>
                      <Col md={6}>
                        <ul className={styles.featuresList}>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Hiển thị thời gian thông minh
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Giao diện responsive
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Animation mượt mà
                          </li>
                          <li>
                            <i className="fas fa-check text-success me-2"></i>
                            Tích hợp authentication
                          </li>
                        </ul>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* API Endpoints */}
            <Row className="mt-4">
              <Col lg={8} className="mx-auto">
                <Card className={styles.usageCard}>
                  <Card.Header className={styles.usageHeader}>
                    <h4 className="mb-0">
                      <i className="fas fa-code me-2"></i>
                      API Endpoints
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <div className={styles.codeBlock}>
                      <pre>
                        <code>
{`// Tạo bình luận
POST /api/comments
{
  "content": "Nội dung bình luận",
  "rating": 5,
  "productId": 1,
  "restaurantId": 1,
  "parentId": 1 // Cho trả lời
}

// Lấy bình luận theo sản phẩm
GET /api/comments/product/{productId}?page=0&size=10

// Lấy bình luận theo nhà hàng
GET /api/comments/restaurant/{restaurantId}?page=0&size=10

// Thống kê bình luận
GET /api/comments/product/{productId}/stats
GET /api/comments/restaurant/{restaurantId}/stats

// Xóa bình luận
DELETE /api/comments/{commentId}`}
                        </code>
                      </pre>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CommentDemoPage;
