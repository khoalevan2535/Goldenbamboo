import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaFlask, FaCheck, FaTimes } from 'react-icons/fa';
import { getAllVoucherUsageHistory } from '../../services/VoucherUsageHistoryService';
import apiClient from '../../utils/apiClient';

const TestVoucherUsageHistoryAPI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/voucher-usage-history/health');
      setResults({
        test: 'Health Check',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Health Check failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTestEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/voucher-usage-history/test');
      setResults({
        test: 'Test Endpoint',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Test Endpoint failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAllHistory = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await getAllVoucherUsageHistory(0, 5);
      setResults({
        test: 'Get All Voucher Usage History',
        status: 'SUCCESS',
        data: data
      });
    } catch (error: any) {
      setError(`Get All History failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/voucher-usage-history?page=0&size=5');
      setResults({
        test: 'Direct API Call',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Direct API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <FaFlask className="me-2" />
                Test Voucher Usage History API
              </h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Button
                    variant="primary"
                    onClick={testHealthCheck}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Health Check
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="secondary"
                    onClick={testTestEndpoint}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Test Endpoint
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="success"
                    onClick={testGetAllHistory}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Get All History
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="info"
                    onClick={testDirectAPI}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Direct API
                  </Button>
                </Col>
              </Row>

              {loading && (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Testing API...</p>
                </div>
              )}

              {error && (
                <Alert variant="danger" className="mt-3">
                  <FaTimes className="me-2" />
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {results && (
                <Alert variant="success" className="mt-3">
                  <FaCheck className="me-2" />
                  <strong>Test: {results.test}</strong>
                  <div className="mt-2">
                    <strong>Status:</strong> {results.status}
                  </div>
                  <div className="mt-2">
                    <strong>Response:</strong>
                    <pre className="mt-2 p-2 bg-light rounded">
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TestVoucherUsageHistoryAPI;
