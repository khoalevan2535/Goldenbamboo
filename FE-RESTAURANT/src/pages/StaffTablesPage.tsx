import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Table,
  Dropdown
} from 'react-bootstrap';
import {
  Table as TableIcon,
  Plus,
  Pencil,
  Trash,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  People
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import apiClient from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';

interface TableEntity {
  id: number;
  name: string;
  description?: string;
  seats: number;
  area: string;
  tableType: string;
  capacityMin: number;
  capacityMax: number;
  isVip: boolean;
  pricePerHour: number;
  status: string;
  operationalStatus: string;
  createdAt: string;
  updatedAt: string;
}

const StaffTablesPage: React.FC = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || 1; // Default to branch 1 if not available
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableEntity | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Load tables
  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/staff/tables`, {
        params: { branchId }
      });
      setTables(response.data);
    } catch (error) {
      console.error('Error loading tables:', error);
      setError('Không thể tải danh sách bàn');
      toast.error('Lỗi khi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, [branchId]);

  // Update table status
  const updateTableStatus = async () => {
    if (!selectedTable || !newStatus) return;

    try {
      setStatusLoading(true);
      await apiClient.put(`/staff/tables/${selectedTable.id}/status`, {
        status: newStatus
      });

      toast.success(`Đã cập nhật trạng thái bàn ${selectedTable.name}`);
      setShowStatusModal(false);
      setSelectedTable(null);
      setNewStatus('');
      loadTables(); // Refresh data
    } catch (error) {
      console.error('Error updating table status:', error);
      toast.error('Lỗi khi cập nhật trạng thái bàn');
    } finally {
      setStatusLoading(false);
    }
  };

  // Open status modal
  const openStatusModal = (table: TableEntity) => {
    setSelectedTable(table);
    setNewStatus(table.status);
    setShowStatusModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
         const statusConfig = {
       'AVAILABLE': { variant: 'success', text: 'Trống', icon: <CheckCircle /> },
       'OCCUPIED': { variant: 'warning', text: 'Đang sử dụng', icon: <People /> },
       'RESERVED': { variant: 'info', text: 'Đã đặt', icon: <Clock /> },
       'MAINTENANCE': { variant: 'danger', text: 'Bảo trì', icon: <XCircle /> },
       'CLEANING': { variant: 'secondary', text: 'Đang dọn', icon: <XCircle /> }
     };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
      icon: <TableIcon />
    };

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  // Get operational status badge
  const getOperationalBadge = (status: string) => {
    return status === 'ACTIVE' ?
      <Badge bg="success">Hoạt động</Badge> :
      <Badge bg="danger">Ngừng hoạt động</Badge>;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

      if (loading && (!tables || tables.length === 0)) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải danh sách bàn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý bàn</h2>
          <p className="text-muted mb-0">
            Quản lý trạng thái và thông tin các bàn trong nhà hàng
          </p>
        </div>
        <Button
          variant="outline-primary"
          onClick={loadTables}
          disabled={loading}
        >
          <TableIcon />
          <span className="ms-2">Làm mới</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{tables?.filter(t => t.status === 'AVAILABLE').length || 0}</h3>
              <p className="text-muted mb-0">Bàn trống</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{tables?.filter(t => t.status === 'OCCUPIED').length || 0}</h3>
              <p className="text-muted mb-0">Đang sử dụng</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{tables?.filter(t => t.status === 'RESERVED').length || 0}</h3>
              <p className="text-muted mb-0">Đã đặt</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">
                {tables?.filter(t => t.status === 'MAINTENANCE' || t.status === 'CLEANING').length || 0}
              </h3>
              <p className="text-muted mb-0">Bảo trì/Dọn dẹp</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Grid */}
      <Row>
        {tables?.map((table) => (
          <Col key={table.id} md={4} lg={3} className="mb-4">
            <Card className={`h-100 ${table.status === 'OCCUPIED' ? 'border-warning' :
                              table.status === 'AVAILABLE' ? 'border-success' : 'border-secondary'}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <TableIcon className="me-2" />
                  {table.name}
                </h6>
                {table.isVip && <Badge bg="warning">VIP</Badge>}
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Trạng thái:</span>
                    {getStatusBadge(table.status)}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Hoạt động:</span>
                    {getOperationalBadge(table.operationalStatus)}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Sức chứa:</span>
                    <span>{table.seats} người</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Khu vực:</span>
                    <span>{table.area}</span>
                  </div>
                  {table.pricePerHour > 0 && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Giá/giờ:</span>
                      <span>{formatCurrency(table.pricePerHour)}</span>
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2">
                                     <Button
                     variant="outline-primary"
                     size="sm"
                     onClick={() => openStatusModal(table)}
                   >
                     <Pencil className="me-1" />
                     Thay đổi trạng thái
                   </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi trạng thái bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTable && (
            <div>
              <p><strong>Bàn:</strong> {selectedTable.name}</p>
              <p><strong>Trạng thái hiện tại:</strong> {getStatusBadge(selectedTable.status)}</p>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái mới</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Trống</option>
                  <option value="OCCUPIED">Đang sử dụng</option>
                  <option value="RESERVED">Đã đặt</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="CLEANING">Đang dọn</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={updateTableStatus}
            disabled={statusLoading || !newStatus}
          >
            {statusLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Empty State */}
      {!loading && (!tables || tables.length === 0) && (
        <div className="text-center py-5">
          <TableIcon size={64} className="text-muted mb-3" />
          <h5>Chưa có bàn nào</h5>
          <p className="text-muted">Không tìm thấy bàn nào trong chi nhánh này.</p>
        </div>
      )}
    </div>
  );
};

export default StaffTablesPage;

