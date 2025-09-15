import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';

export default function StaffApiDebugPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [testResult, setTestResult] = useState<any>(null);

    const testGetOrders = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/staff/orders?branchId=${user?.branchId}&page=0&size=10`);
            console.log('Orders response:', response);
            setOrders(response.data?.orders || []);
            setTestResult({ success: true, data: response.data });
        } catch (error: any) {
            console.error('Error:', error);
            setTestResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const testUpdateStatus = async (orderId: number, newStatus: string) => {
        setLoading(true);
        try {
            const response = await apiClient.put(`/api/staff/orders/${orderId}/status`, { status: newStatus });
            console.log('Update status response:', response);
            setTestResult({ success: true, data: response.data });
            // Refresh orders
            testGetOrders();
        } catch (error: any) {
            console.error('Error:', error);
            setTestResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h4>🔧 Staff API Debug Page</h4>
                            <p className="mb-0">Test các API endpoints của staff</p>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <Button onClick={testGetOrders} disabled={loading}>
                                    {loading ? <Spinner size="sm" className="me-2" /> : null}
                                    Test GET /api/staff/orders
                                </Button>
                            </div>

                            {user && (
                                <Alert variant="info">
                                    <strong>User Info:</strong> {user.username} (Role: {user.role}) - Branch: {user.branchId}
                                </Alert>
                            )}

                            {testResult && (
                                <Alert variant={testResult.success ? 'success' : 'danger'}>
                                    <strong>Test Result:</strong>
                                    <pre className="mt-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                                        {JSON.stringify(testResult, null, 2)}
                                    </pre>
                                </Alert>
                            )}

                            {orders.length > 0 && (
                                <div>
                                    <h5>Orders ({orders.length})</h5>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Status</th>
                                                <th>Table</th>
                                                <th>Total</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>
                                                        <span className={`badge bg-${order.status === 'PENDING' ? 'warning' : 'success'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>{order.tableName || 'N/A'}</td>
                                                    <td>{order.totalAmount?.toLocaleString()}đ</td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            {order.status === 'PENDING' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-warning"
                                                                    onClick={() => testUpdateStatus(order.id, 'PREPARING')}
                                                                    disabled={loading}
                                                                >
                                                                    → PREPARING
                                                                </Button>
                                                            )}
                                                            {order.status === 'PREPARING' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-success"
                                                                    onClick={() => testUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                                                                    disabled={loading}
                                                                >
                                                                    → READY
                                                                </Button>
                                                            )}
                                                            {order.status === 'READY_FOR_PICKUP' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-primary"
                                                                    onClick={() => testUpdateStatus(order.id, 'COMPLETED')}
                                                                    disabled={loading}
                                                                >
                                                                    → COMPLETED
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

