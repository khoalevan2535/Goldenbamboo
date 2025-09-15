import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaStore, FaUsers, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import DashboardService, { type DashboardStats } from '../services/DashboardService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">Chào mừng trở lại, {(user as any)?.fullName || 'Admin'}!</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="g-4">
        {/* Chi nhánh */}
        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaStore className="text-primary me-3" style={{ fontSize: '2rem' }} />
                <div>
                  <h2 className="mb-0 fw-bold text-primary">{stats?.totalBranches || 0}</h2>
                  <small className="text-muted">Chi nhánh</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Người dùng */}
        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaUsers className="text-success me-3" style={{ fontSize: '2rem' }} />
                <div>
                  <h2 className="mb-0 fw-bold text-success">{stats?.totalUsers || 0}</h2>
                  <small className="text-muted">Người dùng</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Nhân viên */}
        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaUserTie className="text-info me-3" style={{ fontSize: '2rem' }} />
                <div>
                  <h2 className="mb-0 fw-bold text-info">{stats?.totalStaff || 0}</h2>
                  <small className="text-muted">Nhân viên</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Đơn hàng */}
        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaClipboardList className="text-warning me-3" style={{ fontSize: '2rem' }} />
                <div>
                  <h2 className="mb-0 fw-bold text-warning">{stats?.totalOrders || 0}</h2>
                  <small className="text-muted">Đơn hàng</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;