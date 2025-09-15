import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button, Form, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaGift } from 'react-icons/fa';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { createDiscount, applyDiscount } from '../../services/DiscountService';
import { toast } from 'react-toastify';
import { formatDateTimeLocal, getStartTime, getVoucherEndTime, convertToBackendFormat } from '../../utils/dateUtils';

interface ItemWithDiscount {
  id: string;
  name: string;
  basePrice: number;
  categoryName?: string;
  type: 'dish' | 'combo';
}

export default function CreateVoucherPage() {
  console.log('🚀 CreateVoucherPage component loaded!');
  console.log('🚀 Current URL:', window.location.href);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId, itemType } = useParams<{ itemId: string; itemType: string }>();
  console.log('🚀 CreateVoucherPage - itemId:', itemId, 'itemType:', itemType);
  const { dishPage, loading: dishesLoading, fetchDishes } = useDishes();
  const { comboPage, loading: combosLoading, fetchCombos } = useCombos();
  const [item, setItem] = useState<ItemWithDiscount | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tổng hợp loading state
  const isLoading = loading || dishesLoading || combosLoading;
  const [submitting, setSubmitting] = useState(false);
  
  const [voucherForm, setVoucherForm] = useState({
    name: '',
    code: '',
    newPrice: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  // Memoize calculations để tránh re-render
  const savings = useMemo(() => {
    if (!item || !voucherForm.newPrice) return 0;
    return item.basePrice - parseFloat(voucherForm.newPrice || '0');
  }, [item, voucherForm.newPrice]);

  // Update browser title với tên món ăn từ item data
  useEffect(() => {
    if (item) {
      document.title = `Voucher ${item.name} - Golden Bamboo Restaurant`;
    }
  }, [item]);

  // Tự động detect base path từ current location
  const getBasePath = useCallback(() => {
    if (location.pathname.startsWith('/manager/')) {
      return '/manager';
    } else if (location.pathname.startsWith('/admin/')) {
      return '/admin';
    }
    return '/admin'; // default
  }, [location.pathname]);

  // Fetch data khi URL params thay đổi
  useEffect(() => {
    console.log('🔍 CreateVoucherPage - itemType:', itemType, 'itemId:', itemId);
    console.log('🔍 URL params:', { itemType, itemId });
    const fetchData = async () => {
      if (loading) return; // Tránh multiple calls
      setLoading(true);
      try {
        console.log('Fetching dishes and combos...');
        await Promise.all([fetchDishes(), fetchCombos()]);
        console.log('Data fetched successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId, itemType, fetchDishes, fetchCombos]); // Chạy lại khi URL params thay đổi

  // Tìm item và setup form khi data đã load
  useEffect(() => {
    console.log('Searching for item:', { 
      itemId, 
      itemType, 
      dishPage: dishPage?.content?.length, 
      comboPage: comboPage?.content?.length,
      dishesLoading,
      combosLoading
    });
    
    // Chỉ tìm item khi không còn loading và có data
    if (itemId && itemType && !dishesLoading && !combosLoading && (dishPage?.content || comboPage?.content)) {
      let foundItem: ItemWithDiscount | null = null;
      
      if (itemType === 'dish' && dishPage?.content) {
        console.log('Searching in dishes:', dishPage.content.map(d => ({ id: d.id, name: d.name })));
        const dish = dishPage.content.find(d => d.id.toString() === itemId);
        console.log('Found dish:', dish);
        if (dish) {
          foundItem = {
            id: dish.id.toString(),
            name: dish.name,
            basePrice: dish.basePrice,
            categoryName: dish.categoryName,
            type: 'dish'
          };
        }
      } else if (itemType === 'combo' && comboPage?.content) {
        console.log('Searching in combos:', comboPage.content.map(c => ({ id: c.id, name: c.name })));
        const combo = comboPage.content.find(c => c.id.toString() === itemId);
        console.log('Found combo:', combo);
        if (combo) {
          foundItem = {
            id: combo.id.toString(),
            name: combo.name,
            basePrice: combo.basePrice,
            type: 'combo'
          };
        }
      }
      
      if (foundItem) {
        console.log('✅ Found item:', foundItem);
        console.log('✅ Item type:', foundItem.type, 'Item id:', foundItem.id);
        console.log('✅ Item id as number:', parseInt(foundItem.id));
        setItem(foundItem);
        // Pre-fill form
        const startDate = getStartTime(); // 5 phút sau (để đảm bảo startDate ở tương lai)
        const endDate = getVoucherEndTime(); // 7 ngày sau (voucher thường có thời hạn ngắn)
        
        setVoucherForm({
          name: `Voucher ${foundItem.name}`,
          code: `VOUCHER_${foundItem.type.toUpperCase()}_${foundItem.id}_${Date.now()}`, // Tự động tạo code voucher
          newPrice: foundItem.basePrice.toString(),
          startDate: formatDateTimeLocal(startDate),
          endDate: formatDateTimeLocal(endDate),
          description: `Voucher giảm giá cho ${foundItem.type === 'dish' ? 'món ăn' : 'combo'} ${foundItem.name} dành cho khách hàng`
        });
      } else {
        console.error('Item not found:', { itemType, itemId, dishPage: dishPage?.content?.length, comboPage: comboPage?.content?.length });
        // Chỉ hiển thị lỗi nếu không còn loading
        if (!isLoading) {
          toast.error('Không tìm thấy món ăn/combo');
        }
      }
    }
  }, [itemId, itemType, dishPage, comboPage, dishesLoading, combosLoading]); // Chỉ phụ thuộc vào data và loading state

  const handleSubmitVoucher = useCallback(async () => {
    console.log('🔍 handleSubmitVoucher called, item:', item);
    if (!item || submitting) return; // Tránh multiple submissions

    // Validation: startDate phải ở tương lai
    const startDate = new Date(voucherForm.startDate);
    const now = new Date();
    if (startDate <= now) {
      toast.error('Ngày bắt đầu phải ở trong tương lai');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tạo voucher
      const voucherData = {
        name: voucherForm.name,
        code: voucherForm.code, // Bắt buộc cho voucher khách hàng
        newPrice: parseFloat(voucherForm.newPrice),
        startDate: convertToBackendFormat(voucherForm.startDate),
        endDate: convertToBackendFormat(voucherForm.endDate),
        description: voucherForm.description,
        status: 'ACTIVE' as const,
        type: 'CUSTOMER_VOUCHER' as const, // Đây là voucher khách hàng
        // Voucher khách hàng không cần dishId/comboId cụ thể
        dishId: null,
        comboId: null
      };

      // Debug log
      console.log('🔍 Creating voucher with data:', voucherData);
      console.log('🔍 Item info:', { type: item.type, id: item.id, name: item.name });
      console.log('🔍 Parsed dishId:', item.type === 'dish' ? parseInt(item.id) : 'N/A');
      console.log('🔍 Parsed comboId:', item.type === 'combo' ? parseInt(item.id) : 'N/A');
      console.log('🔍 Item type check:', item.type === 'dish');
      console.log('🔍 Item id:', item.id);
      console.log('🔍 Parsed item id:', parseInt(item.id));

      const createdVoucher = await createDiscount(voucherData);

      // Voucher khách hàng không cần tự động áp dụng - khách sẽ nhập code khi đặt hàng
      toast.success(`Đã tạo voucher khách hàng "${voucherForm.name}" thành công! Khách có thể sử dụng code: ${voucherForm.code}`);
      
      // Chuyển về trang quản lý
      navigate(`${getBasePath()}/vouchers`);
    } catch (error: any) {
      toast.error('Lỗi khi tạo voucher: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setSubmitting(false);
    }
  }, [item, submitting, voucherForm, navigate, getBasePath]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  if (isLoading || !item) {
    return (
      <div className="p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Đang tải thông tin món ăn/combo...</p>
            <Button variant="secondary" onClick={() => navigate(`${getBasePath()}/vouchers`)}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" key={`voucher-${itemType}-${itemId}`}>
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(`${getBasePath()}/vouchers`)}
          className="me-3"
        >
          <FaArrowLeft />
        </Button>
        <h2 className="mb-0">
          Tạo voucher khách hàng
          {item && (
            <span className="text-muted ms-2">
              - {item.name}
            </span>
          )}
        </h2>
      </div>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5>Thông tin voucher cho {item.type === 'dish' ? 'món ăn' : 'combo'} "{item.name}"</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên voucher <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={voucherForm.name}
                        onChange={(e) => setVoucherForm({...voucherForm, name: e.target.value})}
                        placeholder="Nhập tên voucher"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mã voucher <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={voucherForm.code}
                        onChange={(e) => setVoucherForm({...voucherForm, code: e.target.value})}
                        placeholder="Nhập mã voucher"
                        required
                      />
                      <Form.Text className="text-muted">
                        Mã voucher để khách hàng nhập khi sử dụng
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá mới (₫) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        value={voucherForm.newPrice}
                        onChange={(e) => setVoucherForm({...voucherForm, newPrice: e.target.value})}
                        placeholder="Nhập giá mới"
                        min="0"
                        step="1000"
                        required
                      />
                      {voucherForm.newPrice && (
                        <Form.Text className="text-muted">
                          Giá gốc: {formatPrice(item.basePrice)} | 
                          Tiết kiệm: {formatPrice(savings)}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mô tả</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
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
                      <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={voucherForm.startDate}
                        onChange={(e) => setVoucherForm({...voucherForm, startDate: e.target.value})}
                        required
                      />
                      <Form.Text className="text-muted">
                        Thời gian hiện tại: {new Date().toLocaleString('vi-VN')}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày kết thúc <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={voucherForm.endDate}
                        onChange={(e) => setVoucherForm({...voucherForm, endDate: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
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
                  <Button variant="secondary" onClick={() => navigate(`${getBasePath()}/vouchers`)}>
                    Hủy
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header>
              <h6>Thông tin {item.type === 'dish' ? 'món ăn' : 'combo'}</h6>
            </Card.Header>
            <Card.Body>
              <p><strong>Tên:</strong> {item.name}</p>
              <p><strong>Loại:</strong> 
                <span className={`badge bg-${item.type === 'dish' ? 'warning' : 'info'} ms-2`}>
                  {item.type === 'dish' ? 'Món ăn' : 'Combo'}
                </span>
              </p>
              {item.categoryName && <p><strong>Danh mục:</strong> {item.categoryName}</p>}
              <p><strong>Giá gốc:</strong> <span className="text-primary">{formatPrice(item.basePrice)}</span></p>
            </Card.Body>
          </Card>
          
          <Alert variant="info">
            <FaGift className="me-2" />
            <strong>Voucher khách hàng:</strong> Tạo mã giảm giá đặc biệt cho khách hàng sử dụng khi order. 
            Voucher cần có mã code và thường có thời hạn sử dụng ngắn hơn.
          </Alert>
        </Col>
      </Row>
    </div>
  );
}
