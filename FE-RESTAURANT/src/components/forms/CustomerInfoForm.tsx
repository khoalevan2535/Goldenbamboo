import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Person, Phone, Envelope, GeoAlt } from 'react-bootstrap-icons';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInfoChange: (info: CustomerInfo) => void;
  errors?: Partial<CustomerInfo>;
  disabled?: boolean;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onInfoChange,
  errors = {},
  disabled = false
}) => {
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onInfoChange({
      ...customerInfo,
      [field]: value
    });
  };

  return (
    <div className="customer-info-form">
      <h6 className="mb-3 d-flex align-items-center">
        <Person className="me-2 text-primary" />
        Thông tin khách hàng
      </h6>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">
              <Person className="me-1" />
              Họ và tên *
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập họ và tên..."
              value={customerInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              isInvalid={!!errors.name}
              disabled={disabled}
              size="sm"
            />
            {errors.name && (
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">
              <Phone className="me-1" />
              Số điện thoại *
            </Form.Label>
            <Form.Control
              type="tel"
              placeholder="Nhập số điện thoại..."
              value={customerInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              isInvalid={!!errors.phone}
              disabled={disabled}
              size="sm"
            />
            {errors.phone && (
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">
              <Envelope className="me-1" />
              Email
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập email..."
              value={customerInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              isInvalid={!!errors.email}
              disabled={disabled}
              size="sm"
            />
            {errors.email && (
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">
              <GeoAlt className="me-1" />
              Địa chỉ giao hàng *
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập địa chỉ giao hàng..."
              value={customerInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              isInvalid={!!errors.address}
              disabled={disabled}
              size="sm"
            />
            {errors.address && (
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerInfoForm;






