import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { DeliveryAddress, DeliveryAddressForm } from './DeliveryAddressForm';
import { ghtkService } from '../../services/GHTKService';
import { branchService } from '../../services/BranchService';

const DeliveryAddressTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testGHTKService = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test provinces
      addTestResult('Testing GHTK Provinces...');
      const provinces = await ghtkService.getProvinces();
      addTestResult(`✅ Loaded ${provinces.length} provinces`);
      
      // Test districts
      if (provinces.length > 0) {
        addTestResult('Testing GHTK Districts...');
        const districts = await ghtkService.getDistricts(provinces[0].id);
        addTestResult(`✅ Loaded ${districts.length} districts for ${provinces[0].name}`);
        
        // Test wards
        if (districts.length > 0) {
          addTestResult('Testing GHTK Wards...');
          const wards = await ghtkService.getWards(districts[0].id);
          addTestResult(`✅ Loaded ${wards.length} wards for ${districts[0].name}`);
        }
      }
      
      // Test delivery fee calculation
      addTestResult('Testing delivery fee calculation...');
      const fee = await ghtkService.calculateDeliveryFee('3', '20', '100', '1', '1', '1', 1000);
      addTestResult(`✅ Delivery fee: ${fee.total_fee.toLocaleString()} VND`);
      
    } catch (error) {
      addTestResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testBranchService = async () => {
    setLoading(true);
    
    try {
      addTestResult('Testing Branch Service...');
      const branches = await branchService.getBranchesForDelivery();
      addTestResult(`✅ Loaded ${branches.length} branches for delivery`);
      
      if (branches.length > 0) {
        addTestResult(`First branch: ${branches[0].name} - ${branches[0].address}`);
      }
    } catch (error) {
      addTestResult(`❌ Branch Service Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testLocalStorage = () => {
    try {
      addTestResult('Testing localStorage...');
      
      // Test save
      const testAddress: DeliveryAddress = {
        id: 'test-123',
        recipientName: 'Test User',
        phone: '0123456789',
        address: 'Test Address',
        province: '3',
        district: '20',
        ward: '100',
        note: 'Test note',
        isDefault: true
      };
      
      localStorage.setItem('deliveryAddresses', JSON.stringify([testAddress]));
      addTestResult('✅ Saved test address to localStorage');
      
      // Test load
      const saved = localStorage.getItem('deliveryAddresses');
      if (saved) {
        const addresses = JSON.parse(saved);
        addTestResult(`✅ Loaded ${addresses.length} addresses from localStorage`);
      }
      
    } catch (error) {
      addTestResult(`❌ localStorage Error: ${error}`);
    }
  };

  const handleFormSubmit = (data: DeliveryAddress) => {
    addTestResult(`✅ Form submitted with data: ${JSON.stringify(data, null, 2)}`);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    addTestResult('❌ Form cancelled');
    setShowForm(false);
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <i className="fas fa-vial me-2"></i>
                Delivery Address Feature Test
              </h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={4}>
                  <Button
                    variant="primary"
                    onClick={testGHTKService}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    <i className="fas fa-truck me-2"></i>
                    Test GHTK Service
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="info"
                    onClick={testBranchService}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    <i className="fas fa-store me-2"></i>
                    Test Branch Service
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="success"
                    onClick={testLocalStorage}
                    disabled={loading}
                    className="w-100 mb-2"
                  >
                    <i className="fas fa-database me-2"></i>
                    Test localStorage
                  </Button>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <Button
                    variant="warning"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                    className="w-100"
                  >
                    <i className="fas fa-form me-2"></i>
                    Test Address Form
                  </Button>
                </Col>
              </Row>

              {loading && (
                <Alert variant="info" className="text-center">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Running tests...
                </Alert>
              )}

              {testResults.length > 0 && (
                <Card className="mt-4">
                  <Card.Header>
                    <h6 className="mb-0">Test Results</h6>
                  </Card.Header>
                  <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {testResults.map((result, index) => (
                      <div key={index} className="mb-1 font-monospace small">
                        {result}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showForm && (
        <Row className="mt-4">
          <Col>
            <DeliveryAddressForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DeliveryAddressTest;
