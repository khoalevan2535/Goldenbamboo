import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';

const StaffSimpleApiTestPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testDishesApi = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('Testing dishes API...');
            const response = await apiClient.get('/dishes/staff', {
                params: { page: 0, size: 10 }
            });
            console.log('Dishes API response:', response);
            setResult(response);
        } catch (err: any) {
            console.error('Dishes API error:', err);
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const testCombosApi = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('Testing combos API...');
            const response = await apiClient.get('/combos/staff', {
                params: { page: 0, size: 10 }
            });
            console.log('Combos API response:', response);
            setResult(response);
        } catch (err: any) {
            console.error('Combos API error:', err);
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const testAuth = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('Testing auth...');
            const token = localStorage.getItem('authToken');
            console.log('Token:', token);
            
            const response = await apiClient.get('/auth/me');
            console.log('Auth response:', response);
            setResult(response);
        } catch (err: any) {
            console.error('Auth error:', err);
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
                            <h4>Simple API Test</h4>
                            <p className="mb-0 text-muted">Test API calls trực tiếp</p>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>User Info:</strong>
                                <pre>{JSON.stringify(user, null, 2)}</pre>
                            </div>
                            
                            <div className="mb-3">
                                <strong>Token:</strong>
                                <pre>{localStorage.getItem('authToken') || 'No token'}</pre>
                            </div>
                            
                            <div className="d-flex gap-2 mb-3">
                                <Button 
                                    variant="primary" 
                                    onClick={testAuth}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Testing...
                                        </>
                                    ) : (
                                        'Test Auth'
                                    )}
                                </Button>
                                
                                <Button 
                                    variant="success" 
                                    onClick={testDishesApi}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Testing...
                                        </>
                                    ) : (
                                        'Test Dishes API'
                                    )}
                                </Button>
                                
                                <Button 
                                    variant="warning" 
                                    onClick={testCombosApi}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Testing...
                                        </>
                                    ) : (
                                        'Test Combos API'
                                    )}
                                </Button>
                            </div>

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

export default StaffSimpleApiTestPage;










