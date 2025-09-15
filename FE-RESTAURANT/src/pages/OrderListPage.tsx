import React, { useEffect, useMemo, useState } from 'react';
import { OrderService } from '../services/OrderService';
import { type OrderResponseDTO } from '../interfaces/OrderResponseDTO';
import { useAuth } from '../hooks/useAuth';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { Badge, Button, Card, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { OrderStatus } from '../interfaces/enums/OrderStatus';
import { getApiErrorMessage } from '../utils/error';

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    OrderService.getAll()
      .then((list: any) => setOrders(list || []))
      .catch((err) => {
        setError(getApiErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const branchId = user?.branchId ? Number(user.branchId) : null;
    return (orders || [])
      .filter(o => (branchId ? o.branchId === branchId : true))
      .filter(o => (status ? o.status === status : true))
      .filter(o => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          String(o.id).includes(q) ||
          (o.tableName || '').toLowerCase().includes(q) ||
          (o.accountName || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, user, query, status]);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
  if (error) return <div className="text-danger p-3">{error}</div>;

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Lịch sử đơn hàng</h2>
      </div>

      <Row className="mb-3 g-2">
        <Col md={6}>
          <InputGroup>
            <Form.Control placeholder="Tìm theo ID, bàn, nhân viên..." value={query} onChange={e => setQuery(e.target.value)} />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.values(OrderStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="text-end">
          <Button variant="outline-secondary" onClick={() => { setQuery(""); setStatus(""); }}>Làm mới</Button>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-3">
        {filtered.map(order => (
          <Col key={order.id}>
            <Card onClick={() => { setSelectedOrderId(order.id); setShowDetail(true); }} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="h5 mb-0">#{order.id}</div>
                  <Badge bg={order.status === 'PAID' || order.status === 'COMPLETED' ? 'success' : 'secondary'}>{order.status}</Badge>
                </div>
                <div className="text-muted small mb-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                <div className="d-flex justify-content-between">
                  <div>
                    <div><strong>Bàn:</strong> {order.tableName || '—'}</div>
                    <div><strong>Nhân viên:</strong> {order.accountName || '—'}</div>
                  </div>
                  <div className="text-end">
                    <div><strong>{order.totalAmount?.toLocaleString('vi-VN')} đ</strong></div>
                    <div className="text-muted small">{order.branchName}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <OrderDetailModal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        orderId={selectedOrderId}
        onOrderUpdate={() => {
          OrderService.getAll().then((list: any) => setOrders(list || []));
        }}
      />
    </div>
  );
};

export default OrderListPage; 