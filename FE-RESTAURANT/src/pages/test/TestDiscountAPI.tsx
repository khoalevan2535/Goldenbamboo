import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaFlask, FaCheck, FaTimes } from 'react-icons/fa';
import { discountService } from '../../services/DiscountService';
import apiClient from '../../utils/apiClient';

const TestDiscountAPI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/health');
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

  const testSimple = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/test-simple');
      setResults({
        test: 'Simple Test',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Simple Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testData = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/test-data');
      setResults({
        test: 'Test Data',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Test Data failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAllDiscounts = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await discountService.getAllDiscounts();
      setResults({
        test: 'Get All Discounts',
        status: 'SUCCESS',
        data: data
      });
    } catch (error: any) {
      setError(`Get All Discounts failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts');
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

  const testStatusUpdate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/test-status-update');
      setResults({
        test: 'Status Update Test',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Status Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSyncDiscountIds = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/test-sync-discount-ids');
      setResults({
        test: 'Sync Discount IDs Test',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Sync Discount IDs failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSyncComboDiscountIds = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/test-sync-combo-discount-ids');
      setResults({
        test: 'Sync Combo Discount IDs Test',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Sync Combo Discount IDs failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAutoApplyActiveDiscounts = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/discounts/test-auto-apply-active-discounts');
      setResults({
        test: 'Auto Apply Active Discounts Test',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Auto Apply Active Discounts failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateDiscountWithTargets = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Test tạo discount cho dish ID 1
      const response = await apiClient.post('/discounts/test-create-with-targets', null, {
        params: {
          dishId: 1,
          name: 'Test Discount for Dish 1',
          newPrice: 15000
        }
      });
      setResults({
        test: 'Create Discount with Targets',
        status: 'SUCCESS',
        data: response.data
      });
    } catch (error: any) {
      setError(`Create Discount with Targets failed: ${error.message}`);
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
                Test Discount API
              </h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <Button
                    variant="primary"
                    onClick={testHealthCheck}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Health Check
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="secondary"
                    onClick={testSimple}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Simple Test
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="info"
                    onClick={testData}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Test Data
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="success"
                    onClick={testGetAllDiscounts}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Get All Discounts
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="warning"
                    onClick={testDirectAPI}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Direct API
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="danger"
                    onClick={testStatusUpdate}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Status Update
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="secondary"
                    onClick={testSyncDiscountIds}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Sync Discount IDs
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="dark"
                    onClick={testSyncComboDiscountIds}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Sync Combo Discount IDs
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="success"
                    onClick={testAutoApplyActiveDiscounts}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Auto Apply Active Discounts
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    variant="primary"
                    onClick={testCreateDiscountWithTargets}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    {loading ? <Spinner size="sm" /> : <FaCheck />} Create Discount with Targets
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

export default TestDiscountAPI;
