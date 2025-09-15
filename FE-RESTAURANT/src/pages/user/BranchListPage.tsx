import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaStar, FaSearch, FaFilter } from 'react-icons/fa';
import { BranchService } from '../../services/BranchService';
import type { BranchResponseDTO } from '../../interfaces';

const BranchListPage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<BranchResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        const response = await BranchService.getAll();
        const branchesData = response?.content || response || [];
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách nhà hàng');
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

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

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || branch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3">
            <h5>Đang tải danh sách nhà hàng...</h5>
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
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">Danh Sách Nhà Hàng</h1>
        <p className="lead text-muted">Khám phá các chi nhánh của chúng tôi</p>
      </div>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm nhà hàng theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-5"
            />
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          </div>
        </Col>
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="OPEN">Đang mở cửa</option>
            <option value="CLOSED">Đã đóng cửa</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="INACTIVE">Không hoạt động</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-muted">
          Tìm thấy <strong>{filteredBranches.length}</strong> nhà hàng
          {searchTerm && ` cho "${searchTerm}"`}
          {statusFilter && ` với trạng thái "${statusFilter}"`}
        </p>
      </div>

      {/* Branches Grid */}
      {filteredBranches.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>Không tìm thấy nhà hàng nào</Alert.Heading>
          <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
        </Alert>
      ) : (
        <Row>
          {filteredBranches.map((branch) => (
            <Col key={branch.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 branch-card shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{branch.name}</h5>
                    {getStatusBadge(branch.status)}
                  </div>

                  {branch.description && (
                    <p className="text-muted small mb-3">{branch.description}</p>
                  )}

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <span className="small">{branch.address}</span>
                    </div>
                    {branch.phone && (
                      <div className="d-flex align-items-center">
                        <FaPhone className="text-primary me-2" />
                        <span className="small">{branch.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary"
                      onClick={() => navigate(`/branch/${branch.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                    {branch.status === 'OPEN' && (
                      <Button 
                        variant="outline-success"
                        onClick={() => navigate(`/menu/${branch.id}`)}
                      >
                        Xem thực đơn
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BranchListPage;
