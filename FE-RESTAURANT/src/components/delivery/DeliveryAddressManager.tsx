import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Badge, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import DeliveryAddressForm, { DeliveryAddress } from './DeliveryAddressForm';
import { ghtkService } from '../../services/GHTKService';

interface DeliveryAddressManagerProps {
  onAddressSelect?: (address: DeliveryAddress) => void;
  showSelectionMode?: boolean;
}

const DeliveryAddressManager: React.FC<DeliveryAddressManagerProps> = ({
  onAddressSelect,
  showSelectionMode = false
}) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | undefined>();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | undefined>();

  // Load addresses from localStorage
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    try {
      const savedAddresses = localStorage.getItem('deliveryAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddresses = (newAddresses: DeliveryAddress[]) => {
    try {
      localStorage.setItem('deliveryAddresses', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    } catch (error) {
      console.error('Error saving addresses:', error);
      toast.error('Lỗi khi lưu địa chỉ');
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setShowForm(true);
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = (address: DeliveryAddress) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const confirmDeleteAddress = () => {
    if (addressToDelete) {
      const newAddresses = addresses.filter(addr => addr.id !== addressToDelete.id);
      saveAddresses(newAddresses);
      toast.success('Đã xóa địa chỉ thành công');
      setShowDeleteModal(false);
      setAddressToDelete(undefined);
    }
  };

  const handleFormSubmit = async (formData: DeliveryAddress) => {
    setLoading(true);
    try {
      let newAddresses: DeliveryAddress[];
      
      if (editingAddress) {
        // Update existing address
        newAddresses = addresses.map(addr => 
          addr.id === editingAddress.id 
            ? { ...formData, id: editingAddress.id }
            : addr
        );
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        // Add new address
        const newAddress: DeliveryAddress = {
          ...formData,
          id: Date.now().toString()
        };
        
        // If this is set as default, unset other defaults
        if (newAddress.isDefault) {
          newAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
          newAddresses.push(newAddress);
        } else {
          newAddresses = [...addresses, newAddress];
        }
        
        toast.success('Thêm địa chỉ thành công');
      }
      
      saveAddresses(newAddresses);
      setShowForm(false);
      setEditingAddress(undefined);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Lỗi khi lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddress(undefined);
  };

  const handleSelectAddress = (address: DeliveryAddress) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const getProvinceName = (provinceId: string) => {
    // This would normally come from the GHTK service
    const provinceMap: { [key: string]: string } = {
      '1': 'Thành phố Hà Nội',
      '2': 'Thành phố Hồ Chí Minh',
      '3': 'Thành phố Cần Thơ'
    };
    return provinceMap[provinceId] || provinceId;
  };

  const getDistrictName = (districtId: string) => {
    // This would normally come from the GHTK service
    const districtMap: { [key: string]: string } = {
      '20': 'Quận Ninh Kiều',
      '21': 'Quận Ô Môn',
      '22': 'Quận Bình Thủy'
    };
    return districtMap[districtId] || districtId;
  };

  const getWardName = (wardId: string) => {
    // This would normally come from the GHTK service
    const wardMap: { [key: string]: string } = {
      '100': 'Phường Cái Khế',
      '101': 'Phường An Hòa',
      '102': 'Phường Thới Bình'
    };
    return wardMap[wardId] || wardId;
  };

  if (showForm) {
    return (
      <DeliveryAddressForm
        initialData={editingAddress}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">
                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                Quản lý địa chỉ giao hàng
              </h4>
              <p className="text-muted mb-0">
                Quản lý các địa chỉ giao hàng của bạn
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddAddress}
              className="d-flex align-items-center"
            >
              <i className="fas fa-plus me-2"></i>
              Thêm địa chỉ mới
            </Button>
          </div>

          {addresses.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <i className="fas fa-map-marker-alt text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 text-muted">Chưa có địa chỉ giao hàng</h5>
                <p className="text-muted mb-4">
                  Thêm địa chỉ giao hàng đầu tiên để bắt đầu sử dụng dịch vụ
                </p>
                <Button variant="primary" onClick={handleAddAddress}>
                  <i className="fas fa-plus me-2"></i>
                  Thêm địa chỉ đầu tiên
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {addresses.map((address) => (
                <Col md={6} lg={4} key={address.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="mb-1 fw-bold">{address.recipientName}</h6>
                          <small className="text-muted">{address.phone}</small>
                        </div>
                        <div className="d-flex gap-1">
                          {address.isDefault && (
                            <Badge bg="success" className="mb-1">
                              <i className="fas fa-star me-1"></i>
                              Mặc định
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="mb-1 text-muted small">
                          <i className="fas fa-home me-1"></i>
                          {address.address}
                        </p>
                        <p className="mb-0 text-muted small">
                          <i className="fas fa-map me-1"></i>
                          {getWardName(address.ward)}, {getDistrictName(address.district)}, {getProvinceName(address.province)}
                        </p>
                        {address.note && (
                          <p className="mb-0 text-muted small mt-1">
                            <i className="fas fa-sticky-note me-1"></i>
                            {address.note}
                          </p>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        {showSelectionMode && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleSelectAddress(address)}
                            className="flex-fill"
                          >
                            <i className="fas fa-check me-1"></i>
                            Chọn
                          </Button>
                        )}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteAddress(address)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
            Xác nhận xóa địa chỉ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa địa chỉ giao hàng này không?</p>
          {addressToDelete && (
            <div className="bg-light p-3 rounded">
              <strong>{addressToDelete.recipientName}</strong><br />
              <small className="text-muted">{addressToDelete.address}</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeleteAddress}>
            <i className="fas fa-trash me-2"></i>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeliveryAddressManager;
