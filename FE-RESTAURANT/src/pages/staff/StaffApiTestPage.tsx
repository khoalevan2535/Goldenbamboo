import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';

const StaffApiTestPage: React.FC = () => {
    const { user } = useAuth();
    const { dishes, loading: dishesLoading, error: dishesError, fetchDishesForStaff } = useDishes();
    const { combos, loading: combosLoading, error: combosError, fetchCombosForStaff } = useCombos();
    const [testResults, setTestResults] = useState<any>(null);

    const testApiCalls = async () => {
        setTestResults(null);
        
        try {
            console.log('Testing API calls...');
            
            // Test dishes API
            console.log('Fetching dishes...');
            const dishesResult = await fetchDishesForStaff({ page: 0, size: 10 });
            console.log('Dishes result:', dishesResult);
            
            // Test combos API
            console.log('Fetching combos...');
            const combosResult = await fetchCombosForStaff({ page: 0, size: 10 });
            console.log('Combos result:', combosResult);
            
            setTestResults({
                dishes: dishesResult,
                combos: combosResult,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('API test error:', error);
            setTestResults({ error: error.toString() });
        }
    };

    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h4>API Test Page</h4>
                            <p className="mb-0 text-muted">Test API calls để kiểm tra data loading</p>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-4">
                                <h5>User Info:</h5>
                                <pre>{JSON.stringify(user, null, 2)}</pre>
                            </div>

                            <div className="mb-4">
                                <h5>Dishes Hook Status:</h5>
                                <div className="mb-2">
                                    <strong>Loading:</strong> {dishesLoading ? 'Yes' : 'No'}
                                </div>
                                <div className="mb-2">
                                    <strong>Error:</strong> {dishesError || 'None'}
                                </div>
                                <div className="mb-2">
                                    <strong>Count:</strong> {(dishes || []).length}
                                </div>
                                <div className="mb-2">
                                    <strong>Data:</strong>
                                    <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                                        {JSON.stringify(dishes, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5>Combos Hook Status:</h5>
                                <div className="mb-2">
                                    <strong>Loading:</strong> {combosLoading ? 'Yes' : 'No'}
                                </div>
                                <div className="mb-2">
                                    <strong>Error:</strong> {combosError || 'None'}
                                </div>
                                <div className="mb-2">
                                    <strong>Count:</strong> {(combos || []).length}
                                </div>
                                <div className="mb-2">
                                    <strong>Data:</strong>
                                    <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                                        {JSON.stringify(combos, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Button 
                                    variant="primary" 
                                    onClick={testApiCalls}
                                    disabled={dishesLoading || combosLoading}
                                >
                                    {dishesLoading || combosLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Testing...
                                        </>
                                    ) : (
                                        'Test API Calls'
                                    )}
                                </Button>
                            </div>

                            {testResults && (
                                <div className="mb-4">
                                    <h5>Test Results:</h5>
                                    <pre style={{ fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
                                        {JSON.stringify(testResults, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffApiTestPage;