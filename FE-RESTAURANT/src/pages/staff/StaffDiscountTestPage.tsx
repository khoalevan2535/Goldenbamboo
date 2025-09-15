import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { FaTag, FaInfoCircle, FaRedo } from 'react-icons/fa';
import { discountService } from '../../services/DiscountService';
import { toast } from 'react-toastify';

export default function StaffDiscountTestPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await discountService.testConnection();
      setTestResult(result);
      toast.success('Kết nối thành công!');
    } catch (error) {
      console.error('Test connection error:', error);
      toast.error('Kết nối thất bại!');
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const data = await discountService.getAllDiscounts();
      setDiscounts(data);
      toast.success(`Đã tải ${data.length} discount!`);
    } catch (error) {
      console.error('Error loading discounts:', error);
      toast.error('Không thể tải danh sách discount!');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge bg="success">Đang hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge bg="secondary">Không hoạt động</Badge>;
      case 'EXPIRED':
        return <Badge bg="danger">Đã hết hạn</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaTag className="me-2" />Test Discount System</h2>
        <div>
          <Button 
            variant="primary" 
            className="me-2"
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <FaRedo className="me-2" />}
            Test Connection
          </Button>
          <Button 
            variant="success" 
            onClick={loadDiscounts}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <FaRedo className="me-2" />}
            Load Discounts
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Test Connection Result</h5>
          </Card.Header>
          <Card.Body>
            <pre>{JSON.stringify(testResult, null, 2)}</pre>
          </Card.Body>
        </Card>
      )}

      {/* Discounts List */}
      <Card>
        <Card.Header>
          <h5>Danh sách Discounts</h5>
        </Card.Header>
        <Card.Body>
          {discounts.length === 0 ? (
            <Alert variant="info">
              <FaInfoCircle className="me-2" />
              Chưa có discount nào. Hãy tạo discount từ trang manager.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã</th>
                    <th>Tên</th>
                    <th>Giá mới</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td>{discount.id}</td>
                      <td>
                        <Badge bg="info">{discount.code}</Badge>
                      </td>
                      <td>
                        <strong>{discount.name}</strong>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          {formatPrice(discount.newPrice)}đ
                        </span>
                      </td>
                      <td>{formatDate(discount.startDate)}</td>
                      <td>{formatDate(discount.endDate)}</td>
                      <td>{getStatusBadge(discount.status)}</td>
                      <td>
                        <small className="text-muted">
                          {discount.description || 'Không có mô tả'}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* API Endpoints Info */}
      <Card className="mt-4">
        <Card.Header>
          <h5>API Endpoints</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <h6>Discount Management:</h6>
              <ul>
                <li><code>GET /api/discounts</code> - Lấy tất cả discounts</li>
                <li><code>POST /api/discounts</code> - Tạo discount mới</li>
                <li><code>PUT /api/discounts/{id}</code> - Cập nhật discount</li>
                <li><code>DELETE /api/discounts/{id}</code> - Xóa discount</li>
                <li><code>GET /api/discounts/active</code> - Lấy discounts đang hoạt động</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Test Endpoints:</h6>
              <ul>
                <li><code>GET /api/discounts/health</code> - Health check</li>
                <li><code>GET /api/discounts/test</code> - Test connection</li>
                <li><code>GET /api/discounts/test-simple</code> - Simple test</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}