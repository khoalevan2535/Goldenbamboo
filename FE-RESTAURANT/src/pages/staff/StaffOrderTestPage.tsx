import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { StaffOrderService } from '../../services/StaffOrderService';

const StaffOrderTestPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testGetOrders = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('Testing getOrders API...');
            const response = await StaffOrderService.getOrders({
                page: 0,
                size: 10
            });
            console.log('API Response:', response);
            setResult(response);
        } catch (err: any) {
            console.error('API Error:', err);
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h4>Test Staff Orders API</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>User Info:</strong>
                                <pre>{JSON.stringify(user, null, 2)}</pre>
                            </div>
                            
                            <Button 
                                variant="primary" 
                                onClick={testGetOrders}
                                disabled={loading}
                                className="mb-3"
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Testing API...
                                    </>
                                ) : (
                                    'Test getOrders API'
                                )}
                            </Button>

                            {error && (
                                <Alert variant="danger">
                                    <strong>Error:</strong> {error}
                                </Alert>
                            )}

                            {result && (
                                <Card>
                                    <Card.Header>
                                        <strong>API Response</strong>
                                    </Card.Header>
                                    <Card.Body>
                                        <pre style={{ fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffOrderTestPage;