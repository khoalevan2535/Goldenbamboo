import React, { useState } from 'react';
import { Button, Card, Alert, ListGroup } from 'react-bootstrap';
import { ComboService } from '../../services/ComboService';

const TestComboAPI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGetAllCombos = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Testing getAllCombos...');
      const response = await ComboService.getAll();
      console.log('getAllCombos response:', response);
      setResult({ method: 'getAllCombos', data: response });
    } catch (e: any) {
      console.error('getAllCombos error:', e);
      setError(`getAllCombos error: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetComboById = async (id: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`Testing getComboById with id: ${id}...`);
      const response = await ComboService.getById(id);
      console.log('getComboById response:', response);
      setResult({ method: 'getComboById', id, data: response });
    } catch (e: any) {
      console.error('getComboById error:', e);
      setError(`getComboById error: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Test Combo API</h1>
      
      <Card className="mb-4">
        <Card.Header>API Tests</Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 mb-3">
            <Button 
              onClick={testGetAllCombos} 
              disabled={loading}
              variant="primary"
            >
              Test getAllCombos
            </Button>
            <Button 
              onClick={() => testGetComboById('1')} 
              disabled={loading}
              variant="secondary"
            >
              Test getComboById(1)
            </Button>
            <Button 
              onClick={() => testGetComboById('2')} 
              disabled={loading}
              variant="secondary"
            >
              Test getComboById(2)
            </Button>
          </div>
          
          {loading && <Alert variant="info">Đang test API...</Alert>}
          
          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          )}
          
          {result && (
            <Alert variant="success">
              <strong>Success:</strong> {result.method}
              {result.id && ` (ID: ${result.id})`}
              <pre className="mt-2" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TestComboAPI;


