import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaClock, FaStar } from 'react-icons/fa';
import { BranchService } from '../../services/BranchService';
import CommentSection from '../../components/CommentSection';
import type { BranchResponseDTO } from '../../interfaces';

const BranchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<BranchResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBranch = async () => {
      if (!id) {
        setError('ID nhà hàng không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const branchData = await BranchService.getById(parseInt(id));
        setBranch(branchData);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin nhà hàng');
      } finally {
        setLoading(false);
      }
    };

    loadBranch();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { variant: string; text: string } } = {
      'OPEN': { variant: 'success', text: 'Đang mở cửa' },
      'CLOSED': { variant: 'danger', text: 'Đã đóng cửa' },
      'MAINTENANCE': { variant: 'warning', text: 'Bảo trì' },
      'INACTIVE': { variant: 'secondary', text: 'Không hoạt động' }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3">
            <h5>Đang tải thông tin nhà hàng...</h5>
            <p className="text-muted">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-center">
            <Button variant="outline-danger" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!branch) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Không tìm thấy nhà hàng!</Alert.Heading>
          <p>Nhà hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <hr />
          <div className="d-flex justify-content-center">
            <Button variant="outline-warning" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <FaArrowLeft className="me-2" />
        Quay lại
      </Button>

      {/* Branch Information */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-2">{branch.name}</h2>
                  <div className="mb-2">
                    {getStatusBadge(branch.status)}
                  </div>
                </div>
              </div>

              {branch.description && (
                <p className="text-muted mb-4">{branch.description}</p>
              )}

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h6 className="text-primary">
                      <FaMapMarkerAlt className="me-2" />
                      Địa chỉ
                    </h6>
                    <p className="mb-0">{branch.address}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h6 className="text-primary">
                      <FaPhone className="me-2" />
                      Liên hệ
                    </h6>
                    <p className="mb-0">{branch.phone || 'Chưa cập nhật'}</p>
                  </div>
                </Col>
              </Row>

              {branch.latitude && branch.longitude && (
                <div className="mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <FaMapMarkerAlt className="me-2" />
                    Xem trên bản đồ
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Comment Section */}
          <CommentSection 
            restaurantId={branch.id}
            onCommentAdded={(comment) => {
              console.log('New comment added for restaurant:', comment);
            }}
          />
        </Col>

        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Thao tác nhanh</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary"
                  onClick={() => navigate(`/menu/${branch.id}`)}
                >
                  <FaClock className="me-2" />
                  Xem thực đơn
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={() => navigate(`/reservation?branchId=${branch.id}`)}
                >
                  Đặt bàn
                </Button>
                <Button 
                  variant="outline-success"
                  onClick={() => navigate(`/order?branchId=${branch.id}`)}
                >
                  Đặt món
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Branch Stats */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Thông tin chi tiết</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted">Ngày tạo</small>
                <div>{new Date(branch.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
              {branch.updatedAt && (
                <div className="mb-3">
                  <small className="text-muted">Cập nhật lần cuối</small>
                  <div>{new Date(branch.updatedAt).toLocaleDateString('vi-VN')}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BranchDetailPage;
