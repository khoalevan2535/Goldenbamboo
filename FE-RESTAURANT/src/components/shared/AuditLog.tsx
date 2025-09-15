import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col, Button, Modal, Alert } from 'react-bootstrap';
import { FaEye, FaFilter, FaDownload, FaHistory, FaUser, FaClock, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

interface AuditLogEntry {
  id: number;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const AuditLog: React.FC = () => {
  const { role, user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
    username: ''
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockLogs: AuditLogEntry[] = [
        {
          id: 1,
          userId: 'admin@example.com',
          username: 'Admin User',
          action: 'CREATE',
          entityType: 'MENU',
          entityId: '123',
          entityName: 'Menu Tối Đặc Biệt',
          details: 'Tạo menu mới với 5 món ăn',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2024-01-16T10:30:00Z',
          severity: 'MEDIUM'
        },
        {
          id: 2,
          userId: 'manager@example.com',
          username: 'Manager User',
          action: 'UPDATE',
          entityType: 'DISH',
          entityId: '456',
          entityName: 'Phở Bò',
          details: 'Cập nhật giá từ 45,000 VNĐ lên 50,000 VNĐ',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          createdAt: '2024-01-16T09:15:00Z',
          severity: 'LOW'
        },
        {
          id: 3,
          userId: 'admin@example.com',
          username: 'Admin User',
          action: 'DELETE',
          entityType: 'ACCOUNT',
          entityId: '789',
          entityName: 'user@example.com',
          details: 'Xóa tài khoản người dùng do vi phạm chính sách',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2024-01-16T08:45:00Z',
          severity: 'HIGH'
        },
        {
          id: 4,
          userId: 'staff@example.com',
          username: 'Staff User',
          action: 'LOGIN',
          entityType: 'AUTH',
          entityId: 'N/A',
          entityName: 'Đăng nhập hệ thống',
          details: 'Đăng nhập thành công từ IP 192.168.1.102',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          createdAt: '2024-01-16T08:30:00Z',
          severity: 'LOW'
        },
        {
          id: 5,
          userId: 'admin@example.com',
          username: 'Admin User',
          action: 'APPROVE',
          entityType: 'APPROVAL',
          entityId: '999',
          entityName: 'Yêu cầu tạo combo',
          details: 'Phê duyệt yêu cầu tạo combo "Combo Gia Đình" từ Manager',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: '2024-01-16T07:20:00Z',
          severity: 'MEDIUM'
        }
      ];
      
      // Apply filters
      let filteredLogs = mockLogs;
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      
      if (filters.entityType) {
        filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType);
      }
      
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      if (filters.username) {
        filteredLogs = filteredLogs.filter(log => 
          log.username.toLowerCase().includes(filters.username.toLowerCase())
        );
      }
      
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt) <= new Date(filters.dateTo)
        );
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      toast.error('Lỗi khi tải nhật ký kiểm toán');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge bg="danger">Quan trọng</Badge>;
      case 'HIGH':
        return <Badge bg="warning" text="dark">Cao</Badge>;
      case 'MEDIUM':
        return <Badge bg="info">Trung bình</Badge>;
      case 'LOW':
        return <Badge bg="secondary">Thấp</Badge>;
      default:
        return <Badge bg="secondary">-</Badge>;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Tạo mới';
      case 'UPDATE':
        return 'Cập nhật';
      case 'DELETE':
        return 'Xóa';
      case 'LOGIN':
        return 'Đăng nhập';
      case 'LOGOUT':
        return 'Đăng xuất';
      case 'APPROVE':
        return 'Phê duyệt';
      case 'REJECT':
        return 'Từ chối';
      default:
        return action;
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'MENU':
        return 'Menu';
      case 'DISH':
        return 'Món ăn';
      case 'COMBO':
        return 'Combo';
      case 'ACCOUNT':
        return 'Tài khoản';
      case 'BRANCH':
        return 'Chi nhánh';
      case 'ORDER':
        return 'Đơn hàng';
      case 'AUTH':
        return 'Xác thực';
      case 'APPROVAL':
        return 'Phê duyệt';
      default:
        return entityType;
    }
  };

  const showDetail = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const exportLogs = () => {
    // TODO: Implement export functionality
    toast.info('Tính năng xuất dữ liệu đang được phát triển');
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      severity: '',
      dateFrom: '',
      dateTo: '',
      username: ''
    });
  };

  return (
    <div className="p-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FaHistory className="me-2" />
            Nhật ký kiểm toán (Audit Log)
          </h4>
          <Button variant="outline-primary" size="sm" onClick={exportLogs}>
            <FaDownload className="me-1" />
            Xuất dữ liệu
          </Button>
        </Card.Header>
        
        <Card.Body>
          {/* Filters */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FaFilter className="me-2" />
                Bộ lọc
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Hành động</Form.Label>
                    <Form.Select
                      value={filters.action}
                      onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                    >
                      <option value="">Tất cả</option>
                      <option value="CREATE">Tạo mới</option>
                      <option value="UPDATE">Cập nhật</option>
                      <option value="DELETE">Xóa</option>
                      <option value="LOGIN">Đăng nhập</option>
                      <option value="LOGOUT">Đăng xuất</option>
                      <option value="APPROVE">Phê duyệt</option>
                      <option value="REJECT">Từ chối</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Loại đối tượng</Form.Label>
                    <Form.Select
                      value={filters.entityType}
                      onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                    >
                      <option value="">Tất cả</option>
                      <option value="MENU">Menu</option>
                      <option value="DISH">Món ăn</option>
                      <option value="COMBO">Combo</option>
                      <option value="ACCOUNT">Tài khoản</option>
                      <option value="BRANCH">Chi nhánh</option>
                      <option value="ORDER">Đơn hàng</option>
                      <option value="AUTH">Xác thực</option>
                      <option value="APPROVAL">Phê duyệt</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Mức độ</Form.Label>
                    <Form.Select
                      value={filters.severity}
                      onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    >
                      <option value="">Tất cả</option>
                      <option value="CRITICAL">Quan trọng</option>
                      <option value="HIGH">Cao</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="LOW">Thấp</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Từ ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Đến ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                    Xóa bộ lọc
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Audit Log Table */}
          <Table responsive striped bordered hover>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Mức độ</th>
                <th>IP Address</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Không có dữ liệu nhật ký
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>
                    <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <div>
                        <strong>{log.username}</strong>
                        <br />
                        <small className="text-muted">{log.userId}</small>
                      </div>
                    </td>
                    <td>{getActionLabel(log.action)}</td>
                    <td>
                      <div>
                        <strong>{getEntityTypeLabel(log.entityType)}</strong>
                        <br />
                        <small className="text-muted">{log.entityName}</small>
                      </div>
                    </td>
                    <td>{getSeverityBadge(log.severity)}</td>
                    <td>
                      <code>{log.ipAddress}</code>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => showDetail(log)}
                      >
                        <FaEye className="me-1" />
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết nhật ký kiểm toán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Thông tin cơ bản</h6>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>ID:</strong></td>
                        <td>{selectedLog.id}</td>
                      </tr>
                      <tr>
                        <td><strong>Người dùng:</strong></td>
                        <td>{selectedLog.username} ({selectedLog.userId})</td>
                      </tr>
                      <tr>
                        <td><strong>Hành động:</strong></td>
                        <td>{getActionLabel(selectedLog.action)}</td>
                      </tr>
                      <tr>
                        <td><strong>Đối tượng:</strong></td>
                        <td>{getEntityTypeLabel(selectedLog.entityType)} - {selectedLog.entityName}</td>
                      </tr>
                      <tr>
                        <td><strong>Mức độ:</strong></td>
                        <td>{getSeverityBadge(selectedLog.severity)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Thông tin kỹ thuật</h6>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Thời gian:</strong></td>
                        <td>{new Date(selectedLog.createdAt).toLocaleString('vi-VN')}</td>
                      </tr>
                      <tr>
                        <td><strong>IP Address:</strong></td>
                        <td><code>{selectedLog.ipAddress}</code></td>
                      </tr>
                      <tr>
                        <td><strong>User Agent:</strong></td>
                        <td>
                          <small className="text-muted">
                            {selectedLog.userAgent.length > 50 
                              ? selectedLog.userAgent.substring(0, 50) + '...' 
                              : selectedLog.userAgent
                            }
                          </small>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <div className="mt-3">
                <h6>Chi tiết hành động</h6>
                <Alert variant="info">
                  {selectedLog.details}
                </Alert>
              </div>

              <div className="mt-3">
                <h6>User Agent đầy đủ</h6>
                <pre className="bg-light p-3 rounded" style={{ fontSize: '0.75rem' }}>
                  {selectedLog.userAgent}
                </pre>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

