import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button, Form, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaTag } from 'react-icons/fa';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { createDiscount, applyDiscount } from '../../services/DiscountService';
import { toast } from 'react-toastify';
import { formatDateTimeLocal, getStartTime, getDiscountEndTime, convertToBackendFormat } from '../../utils/dateUtils';

interface ItemWithDiscount {
  id: string;
  name: string;
  basePrice: number;
  categoryName?: string;
  type: 'dish' | 'combo';
}

export default function CreateDiscountPage() {
  console.log('🚀 CreateDiscountPage component loaded!');
  console.log('🚀 Current URL:', window.location.href);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId, itemType } = useParams<{ itemId: string; itemType: string }>();
  console.log('🚀 CreateDiscountPage - itemId:', itemId, 'itemType:', itemType);
  const { dishPage, loading: dishesLoading, fetchDishes } = useDishes();
  const { comboPage, loading: combosLoading, fetchCombos } = useCombos();
  const [item, setItem] = useState<ItemWithDiscount | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tổng hợp loading state
  const isLoading = loading || dishesLoading || combosLoading;
  const [submitting, setSubmitting] = useState(false);
  
  const [discountForm, setDiscountForm] = useState({
    name: '',
    code: '',
    newPrice: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  // Memoize calculations để tránh re-render
  const savings = useMemo(() => {
    if (!item || !discountForm.newPrice) return 0;
    return item.basePrice - parseFloat(discountForm.newPrice || '0');
  }, [item, discountForm.newPrice]);

  // Update browser title với tên món ăn từ item data
  useEffect(() => {
    if (item) {
      const pageType = location.pathname.includes('/vouchers/') ? 'Voucher' : 'Giảm giá';
      document.title = `${pageType} ${item.name} - Golden Bamboo Restaurant`;
    }
  }, [item, location.pathname]);

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
    const fetchData = async () => {
      if (loading) return; // Tránh multiple calls
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
  }, [itemId, itemType, fetchDishes, fetchCombos]); // Chạy lại khi URL params thay đổi

  // Tìm item và setup form khi data đã load
  useEffect(() => {
    
    // Chỉ tìm item khi không còn loading và có data
    if (itemId && itemType && !dishesLoading && !combosLoading && (dishPage?.content || comboPage?.content)) {
      let foundItem: ItemWithDiscount | null = null;
      
      if (itemType === 'dish' && dishPage?.content) {
        const dish = dishPage.content.find(d => d.id.toString() === itemId);
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
        const combo = comboPage.content.find(c => c.id.toString() === itemId);
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
        const endDate = getDiscountEndTime(); // 30 ngày sau
        
        setDiscountForm({
          name: `Giảm giá ${foundItem.name}`,
          code: '', // Không cần code cho giảm giá món ăn của chi nhánh
          newPrice: foundItem.basePrice.toString(),
          startDate: formatDateTimeLocal(startDate),
          endDate: formatDateTimeLocal(endDate),
          description: `Giảm giá tự động cho ${foundItem.type === 'dish' ? 'món ăn' : 'combo'} ${foundItem.name} của chi nhánh`
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

  const handleSubmitDiscount = useCallback(async () => {
    if (!item || submitting) return; // Tránh multiple submissions

    // Validation: startDate phải ở tương lai
    const startDate = new Date(discountForm.startDate);
    const now = new Date();
    if (startDate <= now) {
      toast.error('Ngày bắt đầu phải ở trong tương lai');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tạo discount
      const startDateBackend = convertToBackendFormat(discountForm.startDate);
      const endDateBackend = convertToBackendFormat(discountForm.endDate);
      
      
      const discountData = {
        name: discountForm.name,
        code: null, // Luôn null cho discount chi nhánh
        newPrice: parseFloat(discountForm.newPrice),
        startDate: startDateBackend,
        endDate: endDateBackend,
        description: discountForm.description,
        status: 'ACTIVE' as const,
        type: 'BRANCH_DISCOUNT' as const, // Đây là discount chi nhánh
        // Thêm dishId/comboId để backend biết áp dụng cho item nào
        ...(item.type === 'dish' 
          ? { dishId: parseInt(item.id) }
          : { comboId: parseInt(item.id) }
        )
      };

      // Debug logs
      console.log('🔍 handleSubmitDiscount called, item:', item);
      console.log('🔍 Creating discount with data:', discountData);
      console.log('🔍 Item info:', { type: item.type, id: item.id, name: item.name });
      console.log('🔍 Parsed dishId:', item.type === 'dish' ? parseInt(item.id) : 'N/A');
      console.log('🔍 Parsed comboId:', item.type === 'combo' ? parseInt(item.id) : 'N/A');
      console.log('🔍 Item type check:', item.type === 'dish');
      console.log('🔍 Item id:', item.id);
      console.log('🔍 Parsed item id:', parseInt(item.id));

      const createdDiscount = await createDiscount(discountData);
      
      // Kiểm tra xem discount có được tạo thành công không
      if (!createdDiscount) {
        throw new Error('Không thể tạo discount. Response không hợp lệ.');
      }

      // Lấy ID từ response
      const discountId = createdDiscount.id;
      if (!discountId) {
        // Vẫn hiển thị success vì discount đã được tạo trong DB
        toast.success(`Đã tạo giảm giá chi nhánh cho ${item.type === 'dish' ? 'món ăn' : 'combo'} "${item.name}" thành công!`);
        navigate(location.pathname.includes('/vouchers/') ? `${getBasePath()}/vouchers` : `${getBasePath()}/discounts`);
        return;
      }

      // 2. Áp dụng discount cho item (tạm thời bỏ qua để test)
      // const applyData = {
      //   discountId: createdDiscount.id,
      //   ...(item.type === 'dish' 
      //     ? { dishId: parseInt(item.id) }
      //     : { comboId: parseInt(item.id) }
      //   )
      // };

      // console.log('Applying discount with data:', applyData);
      // const applyResult = await applyDiscount(applyData);
      // console.log('Apply result:', applyResult);

      toast.success(`Đã tạo giảm giá chi nhánh cho ${item.type === 'dish' ? 'món ăn' : 'combo'} "${item.name}" thành công!`);
      
      // Chuyển về trang quản lý
      navigate(location.pathname.includes('/vouchers/') ? `${getBasePath()}/vouchers` : `${getBasePath()}/discounts`);
    } catch (error: any) {
      console.error('❌ Error creating discount:', error?.response?.data?.message || error?.message);
      toast.error('Lỗi khi tạo giảm giá: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setSubmitting(false);
    }
  }, [item, submitting, discountForm, navigate, getBasePath]);

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
            <Button variant="secondary" onClick={() => navigate(location.pathname.includes('/vouchers/') ? `${getBasePath()}/vouchers` : `${getBasePath()}/discounts`)}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" key={`discount-${itemType}-${itemId}`}>
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(location.pathname.includes('/vouchers/') ? `${getBasePath()}/vouchers` : `${getBasePath()}/discounts`)}
          className="me-3"
        >
          <FaArrowLeft />
        </Button>
        <h2 className="mb-0">
          {location.pathname.includes('/vouchers/') ? 'Tạo voucher khách hàng' : 'Tạo giảm giá chi nhánh'}
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
              <h5 className="mb-0">
                <FaTag className="me-2" />
                Thông tin giảm giá cho {item.type === 'dish' ? 'món ăn' : 'combo'} "{item.name}"
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên giảm giá *</Form.Label>
                      <Form.Control
                        type="text"
                        value={discountForm.name}
                        onChange={(e) => setDiscountForm({...discountForm, name: e.target.value})}
                        placeholder="Nhập tên giảm giá"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mã giảm giá</Form.Label>
                      <Form.Control
                        type="text"
                        value={discountForm.code}
                        onChange={(e) => setDiscountForm({...discountForm, code: e.target.value})}
                        placeholder="Để trống cho giảm giá tự động của chi nhánh"
                        disabled={true}
                      />
                      <Form.Text className="text-muted">
                        <strong>Giảm giá chi nhánh không cần code</strong> - sẽ tự động áp dụng khi staff tạo order
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá mới (₫) *</Form.Label>
                      <Form.Control
                        type="number"
                        value={discountForm.newPrice}
                        onChange={(e) => setDiscountForm({...discountForm, newPrice: e.target.value})}
                        placeholder="Nhập giá mới"
                        min="0"
                        step="1000"
                      />
                      {discountForm.newPrice && (
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
                        rows={2}
                        value={discountForm.description}
                        onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                        placeholder="Nhập mô tả giảm giá"
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
                        value={discountForm.startDate}
                        onChange={(e) => setDiscountForm({...discountForm, startDate: e.target.value})}
                      />
                      <Form.Text className="text-muted">
                        Thời gian hiện tại: {new Date().toLocaleString('vi-VN')}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày kết thúc *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={discountForm.endDate}
                        onChange={(e) => setDiscountForm({...discountForm, endDate: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    onClick={handleSubmitDiscount}
                    disabled={submitting || !discountForm.name || !discountForm.newPrice || !discountForm.startDate || !discountForm.endDate}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <FaTag className="me-2" />
                        Tạo giảm giá
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`${getBasePath()}/discounts`)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Thông tin {item.type === 'dish' ? 'món ăn' : 'combo'}</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Tên:</strong> {item.name}
              </div>
              <div className="mb-3">
                <strong>Loại:</strong> 
                <span className={`badge ms-2 ${item.type === 'dish' ? 'bg-primary' : 'bg-info'}`}>
                  {item.type === 'dish' ? 'Món ăn' : 'Combo'}
                </span>
              </div>
              {item.categoryName && (
                <div className="mb-3">
                  <strong>Danh mục:</strong> {item.categoryName}
                </div>
              )}
              <div className="mb-3">
                <strong>Giá gốc:</strong> 
                <span className="text-primary fw-bold ms-2">{formatPrice(item.basePrice)}</span>
              </div>
            </Card.Body>
          </Card>

          <Alert variant="info" className="mt-3">
            <FaTag className="me-2" />
            <strong>Giảm giá chi nhánh:</strong> Tạo giảm giá tự động cho món ăn/combo của chi nhánh. 
            Giảm giá sẽ tự động áp dụng khi staff tạo order, không cần khách nhập code.
          </Alert>
        </Col>
      </Row>
    </div>
  );
}
