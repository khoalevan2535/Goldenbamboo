import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Alert, Spinner, Pagination } from 'react-bootstrap';
import { FaHistory, FaSearch, FaFilter, FaDownload, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllVoucherUsageHistory, type VoucherUsageHistory, type VoucherUsageHistoryFilters } from '../../services/VoucherUsageHistoryService';

// CSS cho print
const printStyles = `
  @media print {
    .no-print { display: none !important; }
    .sidebar { display: none !important; }
    .navbar { display: none !important; }
    .btn { display: none !important; }
    .pagination { display: none !important; }
    .card-header { background: #f8f9fa !important; }
    table { font-size: 12px !important; }
    .container-fluid { padding: 0 !important; }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}

// Interface đã được import từ service

const VoucherUsageHistoryPage: React.FC = () => {
  const [histories, setHistories] = useState<VoucherUsageHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<VoucherUsageHistoryFilters>({
    voucherCode: '',
    customerPhone: '',
    startDate: '',
    endDate: ''
  });

  // Load voucher usage history
  const loadVoucherUsageHistory = async (page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllVoucherUsageHistory(page, pageSize, filters);
      
      console.log('API Response:', data); // Debug log
      
      // Xử lý response an toàn
      if (data && typeof data === 'object') {
        // Nếu có cấu trúc pagination
        if (data.content && Array.isArray(data.content)) {
          setHistories(data.content);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
          setCurrentPage(data.number || 0);
        }
        // Nếu là array trực tiếp
        else if (Array.isArray(data)) {
          setHistories(data);
          setTotalPages(1);
          setTotalElements(data.length);
          setCurrentPage(0);
        }
        // Nếu response không đúng format
        else {
          console.warn('Unexpected API response format:', data);
          setHistories([]);
          setTotalPages(1);
          setTotalElements(0);
          setCurrentPage(0);
        }
      } else {
        console.warn('API response is null or undefined');
        setHistories([]);
        setTotalPages(1);
        setTotalElements(0);
        setCurrentPage(0);
      }
    } catch (error: any) {
      console.error('Error loading voucher usage history:', error);
      setError(error.message);
      toast.error('Lỗi khi tải lịch sử sử dụng voucher: ' + error.message);
      
      // Set empty data on error
      setHistories([]);
      setTotalPages(1);
      setTotalElements(0);
      setCurrentPage(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoucherUsageHistory();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadVoucherUsageHistory(0);
  };

  const handleClearFilters = () => {
    setFilters({
      voucherCode: '',
      customerPhone: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(0);
    loadVoucherUsageHistory(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadVoucherUsageHistory(page);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const getSavingsPercentage = (original: number, final: number) => {
    if (original === 0) return 0;
    return Math.round(((original - final) / original) * 100);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <FaHistory className="me-2" />
                Lịch sử sử dụng voucher
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Card className="mb-4 no-print">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaFilter className="me-2" />
                    Bộ lọc
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mã voucher</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập mã voucher..."
                          value={filters.voucherCode}
                          onChange={(e) => handleFilterChange('voucherCode', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập số điện thoại..."
                          value={filters.customerPhone}
                          onChange={(e) => handleFilterChange('customerPhone', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Từ ngày</Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Đến ngày</Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <div className="d-grid gap-2 w-100">
                        <Button variant="primary" onClick={handleSearch}>
                          <FaSearch className="me-1" />
                          Tìm kiếm
                        </Button>
                        <Button variant="outline-secondary" onClick={handleClearFilters}>
                          Xóa bộ lọc
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Statistics Cards */}
              {histories.length > 0 && (
                <Row className="mb-4">
                  <Col md={3}>
                    <Card className="text-center border-primary">
                      <Card.Body>
                        <h5 className="text-primary">{totalElements}</h5>
                        <p className="mb-0">Tổng lượt sử dụng</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center border-success">
                      <Card.Body>
                        <h5 className="text-success">
                          {formatPrice(histories.reduce((sum, h) => sum + h.discountAmount, 0))}
                        </h5>
                        <p className="mb-0">Tổng tiết kiệm</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center border-info">
                      <Card.Body>
                        <h5 className="text-info">
                          {formatPrice(histories.reduce((sum, h) => sum + h.finalAmount, 0))}
                        </h5>
                        <p className="mb-0">Tổng doanh thu</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center border-warning">
                      <Card.Body>
                        <h5 className="text-warning">
                          {Math.round(histories.reduce((sum, h) => sum + getSavingsPercentage(h.originalAmount, h.finalAmount), 0) / histories.length)}%
                        </h5>
                        <p className="mb-0">Tiết kiệm trung bình</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Results */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <strong>Lỗi:</strong> {error}
                </Alert>
              ) : (
                <>
                  {/* Summary */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-0">
                        Tổng cộng: {totalElements} lượt sử dụng voucher
                      </h6>
                      {histories.length > 0 && (
                        <div className="text-muted small">
                          Tổng tiết kiệm: {formatPrice(histories.reduce((sum, h) => sum + h.discountAmount, 0))}
                        </div>
                      )}
                    </div>
                    <div className="no-print">
                      <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                        <FaDownload className="me-1" />
                        In báo cáo
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã voucher</th>
                        <th>Tên voucher</th>
                        <th>Đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Giá gốc</th>
                        <th>Giảm giá</th>
                        <th>Thành tiền</th>
                        <th>Tiết kiệm</th>
                        <th>Thời gian sử dụng</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center py-4">
                            <p className="text-muted mb-0">Không có dữ liệu</p>
                          </td>
                        </tr>
                      ) : (
                        histories.map((history, index) => (
                          <tr key={history.id}>
                            <td>{currentPage * pageSize + index + 1}</td>
                            <td>
                              <Badge bg="primary">{history.voucherCode}</Badge>
                            </td>
                            <td>
                              <strong>{history.voucherName}</strong>
                            </td>
                            <td>
                              <span className="text-primary">#{history.orderId}</span>
                            </td>
                            <td>
                              <div>
                                {history.customerName && (
                                  <div className="fw-bold">{history.customerName}</div>
                                )}
                                {history.customerPhone && (
                                  <div className="text-muted small">{history.customerPhone}</div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="text-muted">
                                {formatPrice(history.originalAmount)}
                              </span>
                            </td>
                            <td>
                              <span className="text-danger">
                                -{formatPrice(history.discountAmount)}
                              </span>
                            </td>
                            <td>
                              <strong className="text-success">
                                {formatPrice(history.finalAmount)}
                              </strong>
                            </td>
                            <td>
                              <Badge bg="success">
                                {getSavingsPercentage(history.originalAmount, history.finalAmount)}%
                              </Badge>
                            </td>
                            <td>
                              <div className="small">
                                {formatDateTime(history.usedAt)}
                              </div>
                            </td>
                            <td className="no-print">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Xem chi tiết đơn hàng"
                                onClick={() => {
                                  // TODO: Navigate to order detail page
                                  toast.info(`Xem chi tiết đơn hàng #${history.orderId}`);
                                }}
                              >
                                <FaEye />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4 no-print">
                      <Pagination>
                        <Pagination.First
                          onClick={() => handlePageChange(0)}
                          disabled={currentPage === 0}
                        />
                        <Pagination.Prev
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                        />
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page + 1}
                            </Pagination.Item>
                          );
                        })}
                        
                        <Pagination.Next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                        />
                        <Pagination.Last
                          onClick={() => handlePageChange(totalPages - 1)}
                          disabled={currentPage === totalPages - 1}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VoucherUsageHistoryPage;
