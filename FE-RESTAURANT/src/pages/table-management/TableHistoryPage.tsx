import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { TableService } from '../../services/TableService';
import { type TableHistoryDTO } from '../../interfaces/TableHistoryDTO';

const TableHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [history, setHistory] = useState<TableHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!id) return;
      
      try {
        const historyData = await TableService.getTableHistory(parseInt(id));
        setHistory(historyData);
      } catch (err: any) {
        setError(err.message || 'Không thể tải lịch sử bàn');
        toast.error('Không thể tải lịch sử bàn');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [id]);

  const getActionBadge = (action: string) => {
    const variants = {
      'CREATED': 'success',
      'OCCUPIED': 'danger',
      'RELEASED': 'info',
      'RESERVED': 'warning',
      'CANCELLED': 'secondary',
      'UPDATED': 'primary'
    };
    
    const labels = {
      'CREATED': 'Tạo mới',
      'OCCUPIED': 'Có khách',
      'RELEASED': 'Giải phóng',
      'RESERVED': 'Đặt bàn',
      'CANCELLED': 'Hủy',
      'UPDATED': 'Cập nhật'
    };

    return (
      <Badge bg={variants[action as keyof typeof variants] || 'secondary'}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <div className="table-history-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Lịch sử bàn</h2>
        <Button
          variant="outline-secondary"
          onClick={() => navigate(`/admin/tables/${id}/view`)}
          className="d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      {/* History Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Lịch sử hoạt động</h5>
        </Card.Header>
        <Card.Body>
          {history.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">Chưa có lịch sử hoạt động</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                  <th>Người thực hiện</th>
                  <th>Đơn hàng</th>
                  <th>Đặt bàn</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{getActionBadge(item.action)}</td>
                    <td>{item.userName || 'Hệ thống'}</td>
                    <td>
                      {item.orderId ? (
                        <Badge bg="info" className="cursor-pointer">
                          #{item.orderId}
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {item.reservationId ? (
                        <Badge bg="warning" className="cursor-pointer">
                          #{item.reservationId}
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {item.notes ? (
                        <span title={item.notes} className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                          {item.notes}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Summary */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Tóm tắt</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-primary">{history.length}</h4>
                <p className="text-muted mb-0">Tổng số hoạt động</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-success">
                  {history.filter(h => h.action === 'CREATED').length}
                </h4>
                <p className="text-muted mb-0">Lần tạo</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-danger">
                  {history.filter(h => h.action === 'OCCUPIED').length}
                </h4>
                <p className="text-muted mb-0">Lần sử dụng</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-warning">
                  {history.filter(h => h.action === 'RESERVED').length}
                </h4>
                <p className="text-muted mb-0">Lần đặt</p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TableHistoryPage;
