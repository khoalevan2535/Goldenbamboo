import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaShoppingCart, FaMapMarkerAlt, FaFilter, FaSearch, FaPlus, FaDollarSign, FaMinus, FaTimes } from 'react-icons/fa';
import { calculateDishPrice, calculateComboPrice, formatPrice } from '../../utils/discountUtils';
import { useAuth } from '../../hooks/useAuth';
import { ClientMenuService } from '../../services/ClientMenuService';
import { getImageUrl } from '../../utils/imageUtils';
import { toast } from 'react-toastify';
import VNPayOrderButton from '../../components/payment/VNPayOrderButton';
import GHTKAddressSelector from '../../components/delivery/GHTKAddressSelector';
import { GHTKAddress } from '../../services/GHTKService';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  final_price?: number;
  image?: string;
  type: 'dish' | 'combo';
  discountPercentage?: number;
  discountAmount?: number;
  discountActive?: boolean;
  status: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
}

const ClientOrderPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  
  // State
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<GHTKAddress | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  
  // Customer info state - tự động điền từ user đã đăng nhập
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  // Cập nhật customer info khi user thay đổi
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await ClientMenuService.getBranches();
        setBranches(response);
        
        // Auto-select first branch if none selected
        if (!selectedBranch && response.length > 0) {
          setSelectedBranch(response[0].id);
        }
      } catch (error) {
        console.error('Error loading branches:', error);
      }
    };
    loadBranches();
  }, [selectedBranch]);

  // Load menu items when branch changes
  useEffect(() => {
    if (selectedBranch) {
      loadMenuItems();
    }
  }, [selectedBranch, searchTerm, selectedCategory]);

  const loadMenuItems = async () => {
    if (!selectedBranch) return;
    
    setLoading(true);
    try {
      const response = await ClientMenuService.getOrderItems(selectedBranch);
      let items = [...(response.dishes || []), ...(response.combos || [])];

      // Filter by search term
      if (searchTerm) {
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filter by category
      if (selectedCategory) {
        items = items.filter(item => item.categoryId === selectedCategory);
      }
      
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = useCallback((item: MenuItem) => {
    // Kiểm tra đăng nhập trước
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thêm món vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (!selectedBranch) {
      toast.error('Vui lòng chọn chi nhánh trước');
      return;
    }

    const cartItem = {
      uid: `${item.id}_${item.type}_${Date.now()}`,
      item_id: item.id,
      item_type: item.type,
      name: item.name,
      unit_price: item.price,
      final_price: item.final_price || item.price,
      qty: 1
    };

    setCartItems(prev => [...prev, cartItem]);
    toast.success(`Đã thêm "${item.name}" vào giỏ hàng`);
  }, [selectedBranch, isAuthenticated, user, navigate]);

  const handleRemoveFromCart = useCallback((uid: string) => {
    setCartItems(prev => prev.filter(item => item.uid !== uid));
    toast.success('Đã xóa món khỏi giỏ hàng');
  }, []);

  const handleUpdateQuantity = useCallback((uid: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(uid);
    } else {
      setCartItems(prev => prev.map(item => 
        item.uid === uid ? { ...item, qty } : item
      ));
    }
  }, [handleRemoveFromCart]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.final_price * item.qty), 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.qty, 0);
  }, [cartItems]);

  const getTotalWithShipping = useCallback(() => {
    return getCartTotal() + shippingFee;
  }, [getCartTotal, shippingFee]);

  const handleDeliveryAddressSelect = useCallback((address: GHTKAddress, fee?: number) => {
    setSelectedDeliveryAddress(address);
    setShippingFee(fee || 0);
  }, []);

  const isGHTKAddressValid = useCallback(() => {
    return selectedDeliveryAddress && 
           selectedDeliveryAddress.province && 
           selectedDeliveryAddress.district && 
           selectedDeliveryAddress.ward && 
           selectedDeliveryAddress.address;
  }, [selectedDeliveryAddress]);


  // Redirect đến trang đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Lưu URL hiện tại để redirect lại sau khi đăng nhập
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isAuthenticated, user, navigate]);

  // Hiển thị loading nếu đang redirect
  if (!isAuthenticated || !user) {
    return (
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang chuyển hướng...</span>
            </Spinner>
            <p className="mt-3">Đang chuyển hướng đến trang đăng nhập...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Branch Selection */}
        <Col md={12} className="mb-4">
          <Card>
        <Card.Header>
              <h5 className="mb-0">Chọn chi nhánh</h5>
        </Card.Header>
        <Card.Body>
            <Row>
                {branches.map(branch => (
                  <Col md={4} key={branch.id} className="mb-3">
                  <Card 
                      className={`h-100 cursor-pointer ${selectedBranch === branch.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedBranch(branch.id)}
                  >
                    <Card.Body>
                      <h6>{branch.name}</h6>
                        <p className="text-muted small mb-1">{branch.address}</p>
                        <p className="text-muted small">{branch.phone}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
        </Card.Body>
      </Card>
        </Col>

        {/* Search and Filter */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tìm kiếm món ăn</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaSearch /></InputGroup.Text>
                      <Form.Control
                      type="text"
                        placeholder="Nhập tên món ăn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Danh mục</Form.Label>
                    <Form.Select
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Tất cả danh mục</option>
                      {/* Add category options here */}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

              {/* Menu Items */}
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Danh sách món ăn</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p className="mt-2">Đang tải...</p>
                </div>
              ) : (
                <Row>
                  {menuItems.map(item => (
                    <Col md={6} lg={4} key={`${item.id}_${item.type}`} className="mb-3">
                      <Card className="h-100">
                        <div className="position-relative">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="card-img-top"
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                          {item.discountActive && (
                            <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
                              -{item.discountPercentage}%
                            </Badge>
                          )}
                        </div>
                        <Card.Body>
                          <Card.Title className="h6">{item.name}</Card.Title>
                          <Card.Text className="text-muted small">
                            {item.description}
                          </Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              {item.discountActive ? (
                                <div>
                                  <div className="text-decoration-line-through text-muted small">
                                    {formatPrice(item.price)}
                                  </div>
                                  <div className="text-danger fw-bold">
                                    {formatPrice(item.final_price || item.price)}
                                  </div>
                                </div>
                              ) : (
                                <div className="fw-bold">
                                  {formatPrice(item.price)}
                                      </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAddToCart(item)}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
            </Col>

        {/* Cart and Delivery */}
        <Col md={4}>
          {/* Cart */}
          <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaShoppingCart className="me-2" />
                      Giỏ hàng ({getCartItemCount()})
                    </h5>
                  </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {cartItems.length === 0 ? (
                      <Alert variant="info" className="text-center">
                        <FaShoppingCart className="me-2" />
                        Giỏ hàng trống
                      </Alert>
                    ) : (
                      <div>
                  {cartItems.map((item) => (
                          <div key={item.uid} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                            <div className="flex-grow-1">
                              <div className="fw-bold small">{item.name}</div>
                        <div className="text-muted small">{formatPrice(item.final_price)}</div>
                            </div>
                            <div className="d-flex align-items-center">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => handleUpdateQuantity(item.uid, item.qty - 1)}
                              >
                                <FaMinus />
                              </Button>
                        <span className="mx-2">{item.qty}</span>
                              <Button
                                size="sm"
                          variant="outline-secondary"
                                onClick={() => handleUpdateQuantity(item.uid, item.qty + 1)}
                              >
                                <FaPlus />
                              </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="ms-2"
                          onClick={() => handleRemoveFromCart(item.uid)}
                        >
                          <FaTimes />
                        </Button>
                            </div>
                          </div>
                        ))}
                        
                  <div className="border-top pt-2 mt-2">
                    <div className="d-flex justify-content-between">
                      <strong>Tổng cộng:</strong>
                      <strong>{formatPrice(getCartTotal())}</strong>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Delivery Address */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaMapMarkerAlt className="me-2" />
                Địa chỉ giao hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <GHTKAddressSelector
                onAddressSelect={handleDeliveryAddressSelect}
                selectedAddress={selectedDeliveryAddress}
                defaultRecipientName={customerInfo.name}
                defaultPhoneNumber={customerInfo.phone}
              />
            </Card.Body>
          </Card>
                        
                        {/* Order Summary */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Tổng kết đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Phí giao hàng:</span>
                <span>{formatPrice(shippingFee)}</span>
                          </div>
              <div className="d-flex justify-content-between border-top pt-2">
                <strong>Tổng cộng:</strong>
                <strong>{formatPrice(getTotalWithShipping())}</strong>
                        </div>
                        
                        <div className="d-grid gap-2 mt-3">
                <VNPayOrderButton
                  cartItems={cartItems}
                  selectedDeliveryAddress={selectedDeliveryAddress}
                  shippingFee={shippingFee}
                  totalAmount={getTotalWithShipping()}
                  onSuccess={() => {
                    setCartItems([]);
                    toast.success('Đơn hàng đã được tạo thành công!');
                            }}
                            onError={(error) => {
                    toast.error('Không thể tạo đơn hàng!');
                    console.error('Order creation error:', error);
                            }}
                  disabled={!isGHTKAddressValid() || cartItems.length === 0}
                          />
                        </div>
                  </Card.Body>
                </Card>
              </Col>
          </Row>
    </Container>
  );
};

export default ClientOrderPage;
