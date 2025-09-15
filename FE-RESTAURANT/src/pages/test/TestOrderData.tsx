import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Table } from 'react-bootstrap';
import { StaffOrderService } from '../../services/StaffOrderService';

const TestOrderData: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const todayOrders = await StaffOrderService.getTodayUnpaidOrders(1); // branchId = 1
            console.log('Orders data:', todayOrders);
            setOrders(todayOrders);
        } catch (err: any) {
            console.error('Error loading orders:', err);
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetails = async (orderId: number) => {
        try {
            setLoading(true);
            setError(null);
            const order = await StaffOrderService.getOrderById(orderId);
            console.log('Order details:', order);
            setSelectedOrder(order);
        } catch (err: any) {
            console.error('Error loading order details:', err);
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <Container fluid className="mt-4">
            <Card>
                <Card.Header>
                    <h4>Test Order Data</h4>
                    <Button onClick={loadOrders} disabled={loading}>
                        {loading ? 'Loading...' : 'Reload Orders'}
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger">
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}

                    <h5>Orders List ({orders.length} orders)</h5>
                    <Table responsive size="sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Voucher Code</th>
                                <th>Total</th>
                                <th>Items Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.customerName || 'N/A'}</td>
                                    <td>{order.voucherCode || 'N/A'}</td>
                                    <td>{order.totalAmount}</td>
                                    <td>{order.items?.length || 0}</td>
                                    <td>
                                        <Button 
                                            size="sm" 
                                            variant="outline-primary"
                                            onClick={() => loadOrderDetails(order.id)}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {selectedOrder && (
                        <div className="mt-4">
                            <h5>Order Details - #{selectedOrder.id}</h5>
                            <Card>
                                <Card.Body>
                                    <div className="mb-3">
                                        <strong>Customer:</strong> {selectedOrder.customerName || 'N/A'}<br/>
                                        <strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}<br/>
                                        <strong>Voucher Code:</strong> {selectedOrder.voucherCode || 'N/A'}<br/>
                                        <strong>Total Amount:</strong> {selectedOrder.totalAmount}<br/>
                                        <strong>Items Count:</strong> {selectedOrder.items?.length || 0}
                                    </div>

                                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                                        <div>
                                            <h6>Order Items:</h6>
                                            <Table responsive size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Dish Name</th>
                                                        <th>Quantity</th>
                                                        <th>Unit Price</th>
                                                        <th>Original Price</th>
                                                        <th>Final Price</th>
                                                        <th>Total Price</th>
                                                        <th>Discount Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOrder.items.map((item: any) => (
                                                        <tr key={item.id}>
                                                            <td>{item.id}</td>
                                                            <td>{item.dishName || 'N/A'}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>{item.unitPrice}</td>
                                                            <td>{item.originalPrice || 'N/A'}</td>
                                                            <td>{item.finalPrice || 'N/A'}</td>
                                                            <td>{item.totalPrice}</td>
                                                            <td>{item.discountName || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}

                                    <pre className="mt-3" style={{fontSize: '12px', maxHeight: '300px', overflow: 'auto'}}>
                                        {JSON.stringify(selectedOrder, null, 2)}
                                    </pre>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TestOrderData;
