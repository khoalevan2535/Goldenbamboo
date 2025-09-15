import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button, Table, Badge, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus, FaTag, FaClock, FaEye } from 'react-icons/fa';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { DishService } from '../../services/DishService';
import { ComboService } from '../../services/ComboService';
import { toast } from 'react-toastify';

// CSS cho animation
const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  .pulse-animation {
    animation: pulse 2s infinite;
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

interface ItemWithDiscount {
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

export default function DiscountListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { dishPage, loading: dishesLoading, fetchDishes } = useDishes();
  const { comboPage, loading: combosLoading, fetchCombos } = useCombos();
  const [items, setItems] = useState<ItemWithDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Debug logs khi component load
  console.log('🚀 DiscountListPage component loaded!');
  console.log('🚀 Current URL:', window.location.href);
  console.log('🚀 Location pathname:', location.pathname);
  

  // Tự động detect base path từ current location
  const getBasePath = useCallback(() => {
    if (location.pathname.startsWith('/manager/')) {
      return '/manager';
    } else if (location.pathname.startsWith('/admin/')) {
      return '/admin';
    }
    return '/admin'; // default
  }, [location.pathname]);

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Function tính thời gian còn lại
  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days} ngày ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

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
    const combinedItems: ItemWithDiscount[] = [];
    
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
    
    // Debug logs khi items được set
    console.log('🔍 DiscountListPage - Items set:', combinedItems.length);
    console.log('🔍 Sample items:', combinedItems.slice(0, 3).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      hasDiscount: !!item.discount
    })));
  }, [dishPage, comboPage]);

  const handleAddDiscount = (item: ItemWithDiscount) => {
    // Chuyển đến trang tạo giảm giá
    const basePath = getBasePath();
    const url = `${basePath}/discounts/create/${item.type}/${item.id}`;
    
    // Debug logs
    console.log('🚀 DiscountListPage - handleAddDiscount called!');
    console.log('🔍 Item info:', { 
      type: item.type, 
      id: item.id, 
      name: item.name,
      hasDiscount: !!item.discount 
    });
    console.log('🔍 Parsed item.id as number:', parseInt(item.id));
    console.log('🔍 Base path:', basePath);
    console.log('🔍 Full URL:', url);
    console.log('🔍 Current URL before navigate:', window.location.href);
    
    // Force navigation with replace to ensure URL updates
    navigate(url, { replace: true });
    
    console.log('🔍 URL after navigate should be:', url);
  };

  const handleRemoveDiscount = async (item: ItemWithDiscount) => {
    try {
      if (item.type === 'dish') {
        await DishService.removeDiscount(parseInt(item.id));
      } else {
        await ComboService.removeDiscount(parseInt(item.id));
      }
      toast.success('Đã xóa giảm giá thành công!');
      // Refresh data
      await Promise.all([fetchDishes(), fetchCombos()]);
    } catch (error: any) {
      toast.error('Lỗi khi xóa giảm giá: ' + (error?.response?.data?.message || error?.message));
    }
  };


  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const getDiscountBadge = (item: ItemWithDiscount) => {
    if (!item.discount) {
      return <Badge bg="secondary">Không giảm giá</Badge>;
    }

    const now = currentTime;
    const startDate = new Date(item.discount.startDate);
    const endDate = new Date(item.discount.endDate);

    // Xử lý status REPLACED
    if (item.discount.status === 'REPLACED') {
      return (
        <div>
          <Badge bg="secondary">Đã thay thế</Badge>
          <div className="small text-muted mt-1">
            <FaTag className="me-1" />
            Bị thay thế bởi discount mới
          </div>
        </div>
      );
    }

    // Xử lý status SCHEDULED
    if (item.discount.status === 'SCHEDULED' || now < startDate) {
      const timeToStart = getTimeRemaining(item.discount.startDate);
      return (
        <div>
          <Badge bg="info">Sắp bắt đầu</Badge>
          <div className="small text-info mt-1">
            <FaClock className="me-1" />
            Bắt đầu sau: {timeToStart}
          </div>
          <div className="small text-muted">
            Giá: {formatPrice(item.discount.newPrice)}
          </div>
        </div>
      );
    }

    // Xử lý status EXPIRING
    if (item.discount.status === 'EXPIRING') {
      const timeRemaining = getTimeRemaining(item.discount.endDate);
      return (
        <div>
          <Badge bg="warning" className="pulse-animation">Sắp hết hạn</Badge>
          <div className="small text-warning mt-1">
            <FaClock className="me-1" />
            Còn lại: {timeRemaining}
          </div>
          <div className="small text-success">
            Giảm: {formatPrice(item.basePrice - item.discount.newPrice)}
          </div>
        </div>
      );
    }

    // Xử lý status EXPIRED
    if (item.discount.status === 'EXPIRED' || now > endDate) {
      return (
        <div>
          <Badge bg="danger">Đã hết hạn</Badge>
          <div className="small text-muted mt-1">
            <FaClock className="me-1" />
            Hết hạn: {endDate.toLocaleDateString('vi-VN')}
          </div>
        </div>
      );
    }

    // Xử lý status ACTIVE
    if (item.discount.status === 'ACTIVE') {
      const timeRemaining = getTimeRemaining(item.discount.endDate);
      return (
        <div>
          <Badge bg="success">Đang áp dụng</Badge>
          <div className="small text-success mt-1">
            <FaClock className="me-1" />
            Còn lại: {timeRemaining}
          </div>
          <div className="small text-success">
            Giảm: {formatPrice(item.basePrice - item.discount.newPrice)}
          </div>
        </div>
      );
    }

    return <Badge bg="warning">Tạm dừng</Badge>;
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
        <h2>Quản lý giảm giá chi nhánh</h2>
        <div>
          <Button 
            variant="info" 
            onClick={() => navigate(`${getBasePath()}/discounts/history`)}
            className="me-2"
          >
            <FaEye className="me-2" />
            Xem tất cả giảm giá
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate(`${getBasePath()}/discounts/history`)}
            className="me-2"
          >
            <FaTag className="me-2" />
            Lịch sử giảm giá
          </Button>
          {/* Voucher button - temporarily hidden */}
          {/* <Button 
            variant="success" 
            onClick={() => navigate(`${getBasePath()}/vouchers`)}
          >
            <FaPlus className="me-2" />
            Tạo voucher khách hàng
          </Button> */}
        </div>
      </div>

      <Alert variant="info" className="mb-4">
        <FaTag className="me-2" />
        <strong>Giảm giá chi nhánh:</strong> Tạo giảm giá tự động cho món ăn/combo của chi nhánh. 
        Giảm giá sẽ tự động áp dụng khi staff tạo order, không cần khách nhập code.
      </Alert>

      {/* Thống kê tổng quan */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{items.length}</h5>
              <p className="mb-0">Tổng món ăn/combo</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">
                {items.filter(item => item.discount && item.discount.status === 'ACTIVE').length}
              </h5>
              <p className="mb-0">Đang giảm giá</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-info">
                {items.filter(item => item.discount && item.discount.status === 'SCHEDULED').length}
              </h5>
              <p className="mb-0">Sắp bắt đầu</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h5 className="text-warning">
                {items.filter(item => item.discount && item.discount.status === 'EXPIRING').length}
              </h5>
              <p className="mb-0">Sắp hết hạn</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Loại</th>
                <th>Tên món ăn/combo</th>
                <th>Giá gốc</th>
                <th>Giá sau giảm</th>
                <th>Trạng thái</th>
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
                        <div className="text-muted small mt-1">
                          <div className="fw-bold text-primary">
                            <FaTag className="me-1" />
                            {item.discount.name}
                          </div>
                          <div>Mã: <code>{item.discount.code}</code></div>
                          <div className="text-muted">
                            {new Date(item.discount.startDate).toLocaleDateString('vi-VN')} - {new Date(item.discount.endDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>{formatPrice(item.basePrice)}</td>
                    <td>
                      <div>
                        <strong className={item.finalPrice && item.finalPrice < item.basePrice ? 'text-success' : ''}>
                          {formatPrice(item.finalPrice || item.basePrice)}
                        </strong>
                        {item.discount && item.finalPrice && item.finalPrice < item.basePrice && (
                          <div className="text-success small mt-1">
                            <FaTag className="me-1" />
                            Tiết kiệm: {formatPrice(item.basePrice - item.finalPrice)}
                          </div>
                        )}
                        {item.discount && item.discount.status === 'SCHEDULED' && (
                          <div className="text-info small mt-1">
                            <FaClock className="me-1" />
                            Sẽ áp dụng: {formatPrice(item.discount.newPrice)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{getDiscountBadge(item)}</td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          size="sm"
                          variant={item.discount ? "warning" : "success"}
                          onClick={() => handleAddDiscount(item)}
                          title={item.discount ? "Chỉnh sửa giảm giá" : "Thêm giảm giá"}
                        >
                          <FaTag className="me-1" />
                          {item.discount ? "Sửa" : "Tạo"}
                        </Button>
                        {item.discount && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRemoveDiscount(item)}
                            title="Xóa giảm giá"
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

    </div>
  );
}