import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaHistory, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { TableService } from '../../services/TableService';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { type TableResponseDTO } from '../../interfaces/TableResponseDTO';

const TableViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user } = useAuth() as any;
  
  const isAdmin = role === 'ROLE_ADMIN';
  const userBranchId = user?.branchId ?? null;

  const [table, setTable] = useState<TableResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadTable = async () => {
      if (!id) return;
      
      try {
        const tableData = await TableService.getTableById(parseInt(id));
        setTable(tableData);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin bàn');
        toast.error('Không thể tải thông tin bàn');
      } finally {
        setLoading(false);
      }
    };

    loadTable();
  }, [id]);

  const handleDelete = async () => {
    if (!table) return;
    
    setDeleting(true);
    try {
      await TableService.deleteTable(table.id);
      toast.success('Xóa bàn thành công!');
      navigate('/admin/tables');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi xóa bàn');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'AVAILABLE': 'success',
      'OCCUPIED': 'danger',
      'RESERVED': 'warning'
    };
    
    const labels = {
      'AVAILABLE': 'Trống',
      'OCCUPIED': 'Có khách',
      'RESERVED': 'Đã đặt'
    };

    return (
      <Badge bg={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !table) {
    return (
      <Alert variant="danger">
        {error || 'Không tìm thấy thông tin bàn'}
      </Alert>
    );
  }

  return (
    <div className="table-view-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Chi tiết bàn</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/admin/tables')}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" />
            Quay lại
          </Button>
          <Button
            variant="warning"
            onClick={() => navigate(`/admin/tables/${table.id}/edit`)}
            className="d-flex align-items-center"
          >
            <FaEdit className="me-2" />
            Sửa
          </Button>
          <Button
            variant="info"
            onClick={() => navigate(`/admin/tables/${table.id}/history`)}
            className="d-flex align-items-center"
          >
            <FaHistory className="me-2" />
            Lịch sử
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center"
          >
            <FaTrash className="me-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Table Information */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Thông tin cơ bản</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Tên bàn:</strong>
                    <div className="d-flex align-items-center mt-1">
                      <span className="me-2">{table.name}</span>
                      {table.isVip && <Badge bg="warning">VIP</Badge>}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Số ghế:</strong>
                    <div className="mt-1">{table.seats}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Khu vực:</strong>
                    <div className="mt-1">{table.area}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Trạng thái:</strong>
                    <div className="mt-1">{getStatusBadge(table.status)}</div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Loại bàn:</strong>
                    <div className="mt-1">{table.tableType || 'STANDARD'}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Chi nhánh:</strong>
                    <div className="mt-1">{table.branchName}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Trạng thái hoạt động:</strong>
                    <div className="mt-1">
                      <Badge bg={table.operationalStatus === 'ACTIVE' ? 'success' : 'secondary'}>
                        {table.operationalStatus === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                  </div>
                  
                  {table.isVip && table.pricePerHour && (
                    <div className="mb-3">
                      <strong>Giá theo giờ:</strong>
                      <div className="mt-1">{table.pricePerHour.toLocaleString()} VNĐ</div>
                    </div>
                  )}
                </Col>
              </Row>
              
              {table.description && (
                <div className="mb-3">
                  <strong>Mô tả:</strong>
                  <div className="mt-1">{table.description}</div>
                </div>
              )}
              
              {table.notes && (
                <div className="mb-3">
                  <strong>Ghi chú:</strong>
                  <div className="mt-1">{table.notes}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Thông tin hệ thống</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Người tạo:</strong>
                <div className="mt-1">{table.createdBy || 'Hệ thống'}</div>
              </div>
              
              <div className="mb-3">
                <strong>Ngày tạo:</strong>
                <div className="mt-1">
                  {new Date(table.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Cập nhật lần cuối:</strong>
                <div className="mt-1">
                  {new Date(table.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {table.isVip && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Thông tin VIP</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Sức chứa tối thiểu:</strong>
                  <div className="mt-1">{table.capacityMin || 'N/A'}</div>
                </div>
                
                <div className="mb-3">
                  <strong>Sức chứa tối đa:</strong>
                  <div className="mt-1">{table.capacityMax || 'N/A'}</div>
                </div>
                
                <div className="mb-3">
                  <strong>Giá theo giờ:</strong>
                  <div className="mt-1">
                    {table.pricePerHour ? `${table.pricePerHour.toLocaleString()} VNĐ` : 'N/A'}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bàn"
        message={`Bạn có chắc chắn muốn xóa bàn "${table.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default TableViewPage;
