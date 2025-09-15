import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Table, Form, Nav, Tab, ProgressBar } from 'react-bootstrap';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaStore, 
  FaUtensils, 
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaLayerGroup,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useAnalyticsOptimized } from '../hooks/useAnalyticsOptimized';
import { BranchService } from '../services/BranchService';
import type { OrderStats, RevenueStats, BranchPerformance } from '../services/AnalyticsService';
import type { BranchResponseDTO } from '../interfaces/BranchResponseDTO';

import ErrorDisplay from '../components/ErrorDisplay';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  // States cho danh sách chi nhánh
  const [branches, setBranches] = useState<BranchResponseDTO[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  // Load danh sách chi nhánh từ database
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setBranchesLoading(true);
        setBranchesError(null);
        
        const response = await BranchService.getAll();
        const branchesData = response?.content || response || [];
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } catch (error: any) {
        console.error('Error loading branches:', error);
        setBranchesError(error.message || 'Không thể tải danh sách chi nhánh');
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };

    loadBranches();
  }, []);

  // Tạo filters cho analytics
  const filters = useMemo(() => ({
    timeRange: timeRange as 'today' | 'week' | 'month' | 'quarter' | 'year',
    branchId: selectedBranch !== 'all' ? parseInt(selectedBranch) : undefined
  }), [timeRange, selectedBranch]);

  // Sử dụng hook tối ưu cho analytics
  const {
    orderStats,
    revenueStats,
    branchPerformance,
    loading,
    error,
    refetchAll,
    isStale
  } = useAnalyticsOptimized({
    filters,
    enabled: true
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'success' : 'danger';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? <FaArrowUp /> : <FaArrowDown />;
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="analytics-loading">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải dữ liệu phân tích...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Row>
          <Col>
            <Card className="border-danger">
              <Card.Body className="text-center">
                <FaExclamationTriangle className="text-danger mb-3" size={48} />
                <h4 className="text-danger mb-3">
                  Không thể tải dữ liệu phân tích
                </h4>
                <p className="text-muted mb-3">
                  Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={refetchAll}
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                    {loading ? ' Đang tải...' : ' Thử lại'}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => window.open('http://localhost:8080', '_blank')}
                  >
                    Mở Backend
                  </Button>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    💡 Nếu backend chưa chạy, hãy khởi động backend trước khi thử lại
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Sử dụng data trực tiếp vì hook đã có fallback values
  const safeOrderStats = orderStats;
  const safeRevenueStats = revenueStats;
  const safeBranchPerformance = branchPerformance;

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="analytics-header d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-2">
                <FaChartBar className="me-3" />
                Phân Tích & Thống Kê
              </h2>
              <p className="mb-0">Theo dõi hiệu suất kinh doanh và xu hướng đơn hàng</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              {isStale && (
                <Badge bg="warning" text="dark">
                  <FaSync className="me-1" />
                  Dữ liệu cũ
                </Badge>
              )}
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={refetchAll}
                disabled={loading}
              >
                <FaSync className={loading ? 'fa-spin' : ''} />
                {loading ? ' Đang tải...' : ' Làm mới'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Thời gian:</Form.Label>
            <Form.Select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chi nhánh:</Form.Label>
            <Form.Select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={branchesLoading}
            >
              <option value="all">Tất cả chi nhánh</option>
              {branchesLoading ? (
                <option disabled>Đang tải chi nhánh...</option>
              ) : branchesError ? (
                <option disabled>Lỗi tải chi nhánh</option>
              ) : (
                branches
                  .filter(branch => branch.status === 'OPEN') // Chỉ hiển thị chi nhánh đang hoạt động
                  .map(branch => (
                    <option key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </option>
                  ))
              )}
            </Form.Select>
            {branchesError && (
              <small className="text-danger">
                {branchesError}
              </small>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row className="mb-3">
          <Col>
            <ErrorDisplay 
              error={error}
              onRetry={refetchAll}
              showDetails={true}
            />
          </Col>
        </Row>
      )}

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
            <Nav.Item>
              <Nav.Link eventKey="overview">
                <FaChartBar className="me-2" />
                Tổng Quan
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="orders">
                <FaUtensils className="me-2" />
                Thống Kê Đơn Hàng
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="revenue">
                <FaMoneyBillWave className="me-2" />
                Doanh Thu
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="branches">
                <FaStore className="me-2" />
                Hiệu Suất Chi Nhánh
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="menu">
                <FaLayerGroup className="me-2" />
                Phân Tích Menu
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Tab Content */}
      <Tab.Container activeKey={activeTab}>
        <Tab.Content>
          {/* Overview Tab */}
          <Tab.Pane eventKey="overview">
            <Row>
              {/* Key Metrics */}
              <Col lg={3} md={6} className="mb-3">
                <Card className="metric-card h-100">
                  <Card.Body className="text-center">
                    <div className="metric-icon-wrapper text-primary mb-3">
                      <FaUtensils size={32} />
                    </div>
                    <h3 className="metric-value">{formatNumber(safeOrderStats.totalOrders)}</h3>
                    <p className="metric-label">Tổng đơn hàng</p>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        <FaArrowUp size={12} />
                        +12.5%
                      </Badge>
                      <small className="text-muted">vs tuần trước</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={3} md={6} className="mb-3">
                <Card className="metric-card h-100">
                  <Card.Body className="text-center">
                    <div className="metric-icon-wrapper text-success mb-3">
                      <FaMoneyBillWave size={32} />
                    </div>
                    <h3 className="metric-value">{formatCurrency(safeRevenueStats.totalRevenue)}</h3>
                    <p className="metric-label">Tổng doanh thu</p>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        <FaArrowUp size={12} />
                        +8.3%
                      </Badge>
                      <small className="text-muted">vs tuần trước</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={3} md={6} className="mb-3">
                <Card className="metric-card h-100">
                  <Card.Body className="text-center">
                    <div className="metric-icon-wrapper text-warning mb-3">
                      <FaUsers size={32} />
                    </div>
                    <h3 className="metric-value">{formatCurrency(safeOrderStats.averageOrderValue)}</h3>
                    <p className="metric-label">Đơn giá TB</p>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <Badge bg="info" className="d-flex align-items-center gap-1">
                        <FaArrowUp size={12} />
                        +5.2%
                      </Badge>
                      <small className="text-muted">vs tuần trước</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={3} md={6} className="mb-3">
                <Card className="metric-card h-100">
                  <Card.Body className="text-center">
                    <div className="metric-icon-wrapper text-info mb-3">
                      <FaArrowUp size={32} />
                    </div>
                    <h3 className="metric-value">92%</h3>
                    <p className="metric-label">Tỷ lệ tận dụng</p>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        <FaArrowUp size={12} />
                        +3.1%
                      </Badge>
                      <small className="text-muted">vs tuần trước</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Quick Stats Row */}
            <Row className="mb-4">
              <Col lg={4} md={6} className="mb-3">
                <Card className="quick-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Đơn hàng hôm nay</h6>
                        <h4 className="mb-0">{formatNumber(safeOrderStats.todayOrders)}</h4>
                      </div>
                      <div className="quick-stat-icon text-primary">
                        <FaCalendarAlt size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4} md={6} className="mb-3">
                <Card className="quick-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Doanh thu hôm nay</h6>
                        <h4 className="mb-0">{formatCurrency(safeRevenueStats.todayRevenue)}</h4>
                      </div>
                      <div className="quick-stat-icon text-success">
                        <FaMoneyBillWave size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4} md={6} className="mb-3">
                <Card className="quick-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Chi nhánh hoạt động</h6>
                        <h4 className="mb-0">
                          {branchesLoading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            branches.filter(branch => branch.status === 'OPEN').length
                          )}
                        </h4>
                      </div>
                      <div className="quick-stat-icon text-warning">
                        <FaStore size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Charts Row */}
            <Row>
              <Col lg={6} className="mb-3">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaChartLine className="me-2" />
                      Doanh Thu Theo Giờ
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <FaChartLine size={48} className="text-muted mb-3" />
                        <p className="text-center text-muted">Biểu đồ doanh thu theo giờ sẽ được hiển thị ở đây</p>
                        <small className="text-muted">Sử dụng Chart.js để hiển thị dữ liệu trực quan</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6} className="mb-3">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaChartPie className="me-2" />
                      Phân Bố Đơn Hàng Theo Chi Nhánh
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <FaChartPie size={48} className="text-muted mb-3" />
                        <p className="text-center text-muted">Biểu đồ phân bố đơn hàng sẽ được hiển thị ở đây</p>
                        <small className="text-muted">Sử dụng Chart.js để hiển thị dữ liệu trực quan</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Orders Tab */}
          <Tab.Pane eventKey="orders">
            <Row>
              <Col lg={8}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaUtensils className="me-2" />
                      Món Ăn Bán Chạy Nhất
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tên món</th>
                          <th>Số lượng</th>
                          <th>Doanh thu</th>
                          <th>Tỷ lệ</th>
                          <th>Xu hướng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeOrderStats.topSellingItems && safeOrderStats.topSellingItems.length > 0 ? (
                          safeOrderStats.topSellingItems.map((item: any, index: number) => (
                            <tr key={index}>
                              <td>
                                <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'dark'}>
                                  #{index + 1}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="dish-icon me-2">
                                    <FaUtensils />
                                  </div>
                                  {item.name}
                                </div>
                              </td>
                              <td>{formatNumber(item.quantity)}</td>
                              <td>{formatCurrency(item.revenue)}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ProgressBar 
                                    now={item.percentage} 
                                    className="me-2" 
                                    style={{ width: '60px', height: '8px' }}
                                  />
                                  <span>{formatPercentage(item.percentage)}</span>
                                </div>
                              </td>
                              <td>
                                <Badge bg="success" className="d-flex align-items-center gap-1">
                                  <FaArrowUp size={10} />
                                  +5.2%
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                              <FaUtensils size={24} className="mb-2" />
                              <p className="mb-0">Chưa có dữ liệu món ăn bán chạy</p>
                              <small>Dữ liệu sẽ hiển thị khi có đơn hàng</small>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaClock className="me-2" />
                      Thống Kê Đơn Hàng
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="stats-summary">
                      <div className="stats-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Hôm nay:</span>
                          <strong>{formatNumber(safeOrderStats.todayOrders)}</strong>
                        </div>
                        <ProgressBar 
                          now={(safeOrderStats.todayOrders / safeOrderStats.totalOrders) * 100} 
                          className="mt-1"
                        />
                      </div>
                      <div className="stats-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Tuần này:</span>
                          <strong>{formatNumber(safeOrderStats.weeklyOrders)}</strong>
                        </div>
                        <ProgressBar 
                          now={(safeOrderStats.weeklyOrders / safeOrderStats.totalOrders) * 100} 
                          className="mt-1"
                        />
                      </div>
                      <div className="stats-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Tháng này:</span>
                          <strong>{formatNumber(safeOrderStats.monthlyOrders)}</strong>
                        </div>
                        <ProgressBar 
                          now={(safeOrderStats.monthlyOrders / safeOrderStats.totalOrders) * 100} 
                          className="mt-1"
                        />
                      </div>
                      <div className="stats-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Đơn giá TB:</span>
                          <strong>{formatCurrency(safeOrderStats.averageOrderValue)}</strong>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Revenue Tab */}
          <Tab.Pane eventKey="revenue">
            <Row>
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaMoneyBillWave className="me-2" />
                      Doanh Thu Theo Chi Nhánh
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Chi nhánh</th>
                          <th>Doanh thu</th>
                          <th>Đơn hàng</th>
                          <th>Đơn giá TB</th>
                          <th>Hiệu suất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeRevenueStats.revenueByBranch && safeRevenueStats.revenueByBranch.length > 0 ? (
                          safeRevenueStats.revenueByBranch.map((branch: any, index: number) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="branch-icon me-2">
                                    <FaStore />
                                  </div>
                                  {branch.branchName}
                                </div>
                              </td>
                              <td>
                                <strong>{formatCurrency(branch.revenue)}</strong>
                              </td>
                              <td>{formatNumber(branch.orders)}</td>
                              <td>{formatCurrency(branch.averageOrder)}</td>
                              <td>
                                <Badge bg={index === 0 ? 'success' : index === 1 ? 'warning' : 'info'}>
                                  {index === 0 ? 'Cao nhất' : index === 1 ? 'Trung bình' : 'Thấp'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center text-muted py-4">
                              <FaStore size={24} className="mb-2" />
                              <p className="mb-0">Chưa có dữ liệu doanh thu theo chi nhánh</p>
                              <small>Dữ liệu sẽ hiển thị khi có đơn hàng</small>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaCalendarAlt className="me-2" />
                      Doanh Thu Theo Thời Gian
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <FaChartLine size={48} className="text-muted mb-3" />
                        <p className="text-center text-muted">Biểu đồ doanh thu theo thời gian sẽ được hiển thị ở đây</p>
                        <small className="text-muted">Sử dụng Chart.js để hiển thị dữ liệu trực quan</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Branches Tab */}
          <Tab.Pane eventKey="branches">
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaStore className="me-2" />
                      Bảng Xếp Hạng Chi Nhánh
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Xếp hạng</th>
                          <th>Chi nhánh</th>
                          <th>Đơn hàng</th>
                          <th>Doanh thu</th>
                          <th>Đơn giá TB</th>
                          <th>Mật độ</th>
                          <th>Tỷ lệ tận dụng</th>
                          <th>Hiệu suất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeBranchPerformance && safeBranchPerformance.length > 0 ? (
                          safeBranchPerformance.map((branch: any) => (
                            <tr key={branch.branchId}>
                              <td>
                                <Badge bg={branch.ranking === 1 ? 'warning' : branch.ranking === 2 ? 'secondary' : 'dark'}>
                                  #{branch.ranking}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="branch-icon me-2">
                                    <FaStore />
                                  </div>
                                  {branch.branchName}
                                </div>
                              </td>
                              <td>{formatNumber(branch.totalOrders)}</td>
                              <td>
                                <strong>{formatCurrency(branch.totalRevenue)}</strong>
                              </td>
                              <td>{formatCurrency(branch.averageOrderValue)}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ProgressBar 
                                    now={branch.orderDensity} 
                                    className="me-2" 
                                    style={{ width: '60px', height: '8px' }}
                                  />
                                  <span>{formatPercentage(branch.orderDensity)}</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ProgressBar 
                                    now={branch.utilizationRate} 
                                    className="me-2" 
                                    style={{ width: '60px', height: '8px' }}
                                  />
                                  <span>{formatPercentage(branch.utilizationRate)}</span>
                                </div>
                              </td>
                              <td>
                                <Badge bg={getPerformanceColor(branch.performance)}>
                                  {branch.performance === 'high' ? 'Cao' : 
                                   branch.performance === 'medium' ? 'Trung bình' : 'Thấp'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              <FaStore size={24} className="mb-2" />
                              <p className="mb-0">Chưa có dữ liệu hiệu suất chi nhánh</p>
                              <small>Dữ liệu sẽ hiển thị khi có đơn hàng</small>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Menu Analysis Tab */}
          <Tab.Pane eventKey="menu">
            <Row>
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaLayerGroup className="me-2" />
                      Món Ăn Có Lợi Nhuận Cao
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <FaChartBar size={48} className="text-muted mb-3" />
                        <p className="text-center text-muted">Biểu đồ lợi nhuận theo món sẽ được hiển thị ở đây</p>
                        <small className="text-muted">Sử dụng Chart.js để hiển thị dữ liệu trực quan</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaArrowUp className="me-2" />
                      Xu Hướng Món Ăn
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      <div className="chart-placeholder">
                        <FaArrowUp size={48} className="text-muted mb-3" />
                        <p className="text-center text-muted">Biểu đồ xu hướng món ăn sẽ được hiển thị ở đây</p>
                        <small className="text-muted">Sử dụng Chart.js để hiển thị dữ liệu trực quan</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default AnalyticsPage;
