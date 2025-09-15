import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { DeliveryAddressSelector } from './DeliveryAddressSelector';
import { DeliveryAddressResponseDTO } from '../../interfaces/DeliveryAddressDTO';
import { deliveryAddressService } from '../../services/DeliveryAddressService';
import { ghtkService } from '../../services/GHTKService';

const DeliveryTestComponent: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddressResponseDTO | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const handleAddressSelect = (address: DeliveryAddressResponseDTO, fee?: number) => {
    setSelectedAddress(address);
    if (fee !== undefined) {
      setShippingFee(fee);
    }
  };

  const testGHTKConnection = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const isConnected = await ghtkService.testConnection();
      setTestResult(isConnected ? '✅ Kết nối GHTK thành công!' : '❌ Kết nối GHTK thất bại!');
    } catch (error) {
      setTestResult(`❌ Lỗi kết nối: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateOrder = async () => {
    if (!selectedAddress) {
      setTestResult('❌ Vui lòng chọn địa chỉ giao hàng trước!');
      return;
    }

    setLoading(true);
    setTestResult('');

    try {
      const orderData = {
        products: [
          {
            name: 'Bún bò Huế',
            weight: 0.5,
            quantity: 1,
            price: 55000,
            product_code: 'BUN_BO_HUE_001'
          }
        ],
        order: {
          id: `TEST_${Date.now()}`,
          booking_id: `BOOK_${Date.now()}`,
          pick_name: 'Golden Bamboo Restaurant',
          pick_address: '123 Đường ABC, Phường XYZ',
          pick_province: 'Thành phố Cần Thơ',
          pick_district: 'Quận Ninh Kiều',
          pick_ward: 'Phường Cái Khế',
          pick_tel: '0865031912',
          name: selectedAddress.recipientName,
          address: selectedAddress.address,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          hamlet: '',
          tel: selectedAddress.phoneNumber,
          note: 'Đơn hàng test từ Golden Bamboo',
          value: 55000,
          transport: 'road',
          pick_option: 'cod',
          deliver_option: 'cod',
          is_freeship: '0',
          pick_money: 0,
          pick_date: new Date().toISOString().split('T')[0]
        }
      };

      const result = await ghtkService.createOrder(orderData);
      setTestResult(`✅ Tạo đơn hàng thành công! ${JSON.stringify(result)}`);
    } catch (error) {
      setTestResult(`❌ Lỗi tạo đơn hàng: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-test-component">
      <Card className="mb-4">
        <Card.Header>
          <h5>🧪 Test Giao Hàng Tiết Kiệm</h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <Button 
              variant="primary" 
              onClick={testGHTKConnection}
              disabled={loading}
              className="me-2"
            >
              {loading ? <Spinner size="sm" /> : '🔗'} Test Kết Nối GHTK
            </Button>
            
            <Button 
              variant="success" 
              onClick={testCreateOrder}
              disabled={loading || !selectedAddress}
            >
              {loading ? <Spinner size="sm" /> : '📦'} Test Tạo Đơn Hàng
            </Button>
          </div>

          {testResult && (
            <Alert variant={testResult.includes('✅') ? 'success' : 'danger'}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {testResult}
              </pre>
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5>📍 Chọn Địa Chỉ Giao Hàng</h5>
        </Card.Header>
        <Card.Body>
          <DeliveryAddressSelector
            onAddressSelect={handleAddressSelect}
            selectedAddressId={selectedAddress?.id}
            showShippingFee={true}
          />
          
          {selectedAddress && (
            <Alert variant="info" className="mt-3">
              <strong>Địa chỉ đã chọn:</strong><br />
              {selectedAddress.recipientName} - {selectedAddress.phoneNumber}<br />
              {selectedAddress.fullAddress}<br />
              <strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString('vi-VN')} VNĐ
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DeliveryTestComponent;


