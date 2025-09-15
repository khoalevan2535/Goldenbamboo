import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Table, Badge, Spinner, Alert, Card, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus, FaTag, FaGift } from 'react-icons/fa';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { createDiscount, applyDiscount } from '../../services/DiscountService';
import { toast } from 'react-toastify';

interface VoucherItem {
  id: string;
  name: string;
  basePrice: number;
  finalPrice?: number;
  categoryName?: string;
  type: 'dish' | 'combo';
  discount?: {
    id: number;
    code: string;
    name: string;
    newPrice: number;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export default function VoucherManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dishPage, loading: dishesLoading, fetchDishes } = useDishes();
  const { comboPage, loading: combosLoading, fetchCombos } = useCombos();
  const [items, setItems] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VoucherItem | null>(null);
  const [voucherForm, setVoucherForm] = useState({
    name: '',
    code: '',
    newPrice: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Tự động detect base path từ current location
  const getBasePath = useCallback(() => {
    if (location.pathname.startsWith('/manager/')) {
      return '/manager';
    } else if (location.pathname.startsWith('/admin/')) {
      return '/admin';
    }
    return '/admin'; // default
  }, [location.pathname]);

  // Fetch và combine dishes và combos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchDishes(), fetchCombos()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchDishes, fetchCombos]);

  // Combine dishes và combos thành items
  useEffect(() => {
    const combinedItems: VoucherItem[] = [];
    
    // Add dishes
    if (dishPage?.content) {
      dishPage.content.forEach(dish => {
        combinedItems.push({
          id: dish.id,
          name: dish.name,
          basePrice: dish.basePrice,
          finalPrice: dish.discount ? dish.discount.newPrice : dish.basePrice,
          categoryName: dish.categoryName,
          type: 'dish',
          discount: dish.discount
        });
      });
    }
    
    // Add combos
    if (comboPage?.content) {
      comboPage.content.forEach(combo => {
        combinedItems.push({
          id: combo.id,
          name: combo.name,
          basePrice: combo.basePrice,
          finalPrice: combo.discount ? combo.discount.newPrice : combo.basePrice,
          type: 'combo',
          discount: combo.discount
        });
      });
    }
    
    setItems(combinedItems);
  }, [dishPage, comboPage]);

  const handleCreateVoucher = (item: VoucherItem) => {
    // Navigate to create voucher page
    const basePath = getBasePath();
    const url = `${basePath}/vouchers/create/${item.type}/${item.id}`;
    console.log('Navigating to voucher creation:', url, 'for item:', item);
    console.log('Current URL before navigate:', window.location.href);
    
    // Force navigation with replace to ensure URL updates
    navigate(url, { replace: true });
    
    console.log('URL after navigate should be:', url);
  };

  const handleCloseModal = () => {
    setShowVoucherModal(false);
    setSelectedItem(null);
    setVoucherForm({
      name: '',
      code: '',
      newPrice: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const handleSubmitVoucher = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      // 1. Tạo voucher discount
      const voucherData = {
        name: voucherForm.name,
        code: voucherForm.code, // Voucher bắt buộc phải có code
        newPrice: parseFloat(voucherForm.newPrice),
        startDate: new Date(voucherForm.startDate).toISOString(),
        endDate: new Date(voucherForm.endDate).toISOString(),
        description: voucherForm.description,
        status: 'ACTIVE' as const
      };

      const createdVoucher = await createDiscount(voucherData);

      // 2. Áp dụng voucher cho item
      const applyData = {
        discountId: createdVoucher.id,
        ...(selectedItem.type === 'dish' 
          ? { dishId: parseInt(selectedItem.id) }
          : { comboId: parseInt(selectedItem.id) }
        )
      };

      await applyDiscount(applyData);

      toast.success(`Đã tạo voucher "${voucherForm.code}" cho ${selectedItem.type === 'dish' ? 'món ăn' : 'combo'} "${selectedItem.name}" thành công!`);
      
      // Refresh data
      await Promise.all([fetchDishes(), fetchCombos()]);
      handleCloseModal();
    } catch (error: any) {
      toast.error('Lỗi khi tạo voucher: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const getVoucherBadge = (item: VoucherItem) => {
    if (!item.discount) {
      return <Badge bg="secondary">Chưa có voucher</Badge>;
    }

    const now = new Date();
    const startDate = new Date(item.discount.startDate);
    const endDate = new Date(item.discount.endDate);

    if (now < startDate) {
      return <Badge bg="info">Voucher sắp bắt đầu</Badge>;
    }

    if (now > endDate) {
      return <Badge bg="danger">Voucher đã hết hạn</Badge>;
    }

    if (item.discount.status === 'ACTIVE') {
      return <Badge bg="success">Voucher đang hoạt động</Badge>;
    }

    return <Badge bg="warning">Voucher tạm dừng</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý voucher khách hàng</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate(`${getBasePath()}/discounts`)}
        >
          <FaPlus className="me-2" />
          Quản lý giảm giá chi nhánh
        </Button>
      </div>

      <Alert variant="info" className="mb-4">
        <FaGift className="me-2" />
        <strong>Voucher khách hàng:</strong> Tạo mã giảm giá đặc biệt cho khách hàng sử dụng khi order. 
        Khách hàng cần nhập mã voucher để được giảm giá.
      </Alert>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Loại</th>
                <th>Tên món ăn/combo</th>
                <th>Danh mục</th>
                <th>Giá gốc</th>
                <th>Giá voucher</th>
                <th>Trạng thái voucher</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <p className="text-muted mb-0">Chưa có món ăn hoặc combo nào</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>
                      <Badge bg={item.type === 'dish' ? 'primary' : 'info'}>
                        {item.type === 'dish' ? 'Món ăn' : 'Combo'}
                      </Badge>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      {item.discount && (
                        <div className="text-muted small">
                          <div>Voucher: {item.discount.name}</div>
                          <div>Mã: <strong className="text-primary">{item.discount.code}</strong></div>
                        </div>
                      )}
                    </td>
                    <td>{item.categoryName || '-'}</td>
                    <td>{formatPrice(item.basePrice)}</td>
                    <td>
                      <strong className={item.finalPrice && item.finalPrice < item.basePrice ? 'text-success' : ''}>
                        {formatPrice(item.finalPrice || item.basePrice)}
                      </strong>
                      {item.discount && item.finalPrice && item.finalPrice < item.basePrice && (
                        <div className="text-success small">
                          Tiết kiệm: {formatPrice(item.basePrice - item.finalPrice)}
                        </div>
                      )}
                    </td>
                    <td>{getVoucherBadge(item)}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant={item.discount ? "warning" : "success"}
                        onClick={() => handleCreateVoucher(item)}
                        className="me-1"
                        title={item.discount ? "Chỉnh sửa voucher" : "Tạo voucher"}
                      >
                        <FaGift className="me-1" />
                        {item.discount ? "Sửa" : "Tạo"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal tạo voucher */}
      <Modal show={showVoucherModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Tạo voucher cho {selectedItem?.type === 'dish' ? 'món ăn' : 'combo'} "{selectedItem?.name}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="mb-4 p-3 bg-light rounded">
              <h6>Thông tin {selectedItem.type === 'dish' ? 'món ăn' : 'combo'}:</h6>
              <Row>
                <Col md={6}>
                  <strong>Tên:</strong> {selectedItem.name}
                </Col>
                <Col md={6}>
                  <strong>Giá gốc:</strong> {formatPrice(selectedItem.basePrice)}
                </Col>
              </Row>
            </div>
          )}

          <Alert variant="warning" className="mb-3">
            <FaGift className="me-2" />
            <strong>Lưu ý:</strong> Voucher cần có mã code để khách hàng nhập khi order. 
            Mã code sẽ được hiển thị cho khách hàng sử dụng.
          </Alert>

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên voucher *</Form.Label>
                  <Form.Control
                    type="text"
                    value={voucherForm.name}
                    onChange={(e) => setVoucherForm({...voucherForm, name: e.target.value})}
                    placeholder="Nhập tên voucher"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã voucher *</Form.Label>
                  <Form.Control
                    type="text"
                    value={voucherForm.code}
                    onChange={(e) => setVoucherForm({...voucherForm, code: e.target.value})}
                    placeholder="Nhập mã voucher"
                  />
                  <Form.Text className="text-muted">
                    Mã này khách hàng sẽ nhập khi order để được giảm giá
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá voucher (₫) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={voucherForm.newPrice}
                    onChange={(e) => setVoucherForm({...voucherForm, newPrice: e.target.value})}
                    placeholder="Nhập giá voucher"
                    min="0"
                    step="1000"
                  />
                  {selectedItem && voucherForm.newPrice && (
                    <Form.Text className="text-muted">
                      Giá gốc: {formatPrice(selectedItem.basePrice)} | 
                      Tiết kiệm: {formatPrice(selectedItem.basePrice - parseFloat(voucherForm.newPrice || '0'))}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={voucherForm.description}
                    onChange={(e) => setVoucherForm({...voucherForm, description: e.target.value})}
                    placeholder="Nhập mô tả voucher"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={voucherForm.startDate}
                    onChange={(e) => setVoucherForm({...voucherForm, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={voucherForm.endDate}
                    onChange={(e) => setVoucherForm({...voucherForm, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmitVoucher}
            disabled={submitting || !voucherForm.name || !voucherForm.code || !voucherForm.newPrice || !voucherForm.startDate || !voucherForm.endDate}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang tạo...
              </>
            ) : (
              <>
                <FaGift className="me-2" />
                Tạo voucher
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
