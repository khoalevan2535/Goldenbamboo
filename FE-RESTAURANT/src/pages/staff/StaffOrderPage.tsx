import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
    Cart3, 
    Search, 
    Plus, 
    Dash,
    CurrencyDollar,
    CheckCircle,
    XCircle,
    Eye,
    ArrowRight
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { useCategories } from '../../hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { StaffOrderService } from '../../services/StaffOrderService';
import { formatPrice, formatPercentage, calculateDishPrice, calculateComboPrice } from '../../utils/discountUtils';
import { discountService } from '../../services/DiscountService';
import { TableService } from '../../services/TableService';
import { type OrderRequestDTO } from '../../interfaces/OrderRequestDTO';
import { type OrderItemRequestDTO } from '../../interfaces/OrderItemRequestDTO';
import OrderSuccessModal from '../../components/OrderSuccessModal';
// import VoucherInput from '../../components/VoucherInput';

interface CartItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number; // Giá gốc trước discount
    quantity: number;
    type: 'dish' | 'combo';
    image?: string;
    discountInfo?: {
        originalPrice: number;
        finalPrice: number;
        discountAmount: number;
        discountPercentage: number;
        hasDiscount: boolean;
        isActive: boolean;
    };
}

const StaffOrderPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [activeTab, setActiveTab] = useState<'dishes' | 'combos'>('dishes');
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderData, setSuccessOrderData] = useState<any>(null);
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [tables, setTables] = useState<any[]>([]);
    // const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    
    // Use same hooks as manager
    const { dishPage, loading: dishesLoading, fetchDishesForStaff } = useDishes();
    const { comboPage, loading: combosLoading, fetchCombosForStaff } = useCombos();
    const { categoryPage, loading: categoriesLoading, fetchCategories } = useCategories();
    
    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Load data on component mount
    useEffect(() => {
        // Load categories
        fetchCategories({
            status: 'APPROVED',
            // Backend sẽ tự động filter theo branch của staff
        });

        // Load tables for the branch
        const loadTables = async () => {
            if (user?.branchId) {
                try {
                    const tablesData = await TableService.getTablesByBranch(user.branchId);
                    setTables(tablesData.data || []);
                } catch (error) {
                    console.error('Error loading tables:', error);
                }
            }
        };
        loadTables();
    }, [fetchCategories, user?.branchId]);

    useEffect(() => {
        // Load dishes using Staff API (không bao gồm DISCONTINUED)
        // Trang order cần tất cả món ăn, không phân trang
        fetchDishesForStaff({
            name: debouncedSearchTerm,
            categoryId: selectedCategory || undefined,
            status: 'ACTIVE',
            page: 0,
            size: 1000, // Lấy tất cả món ăn cho trang order
            branchId: user?.branchId, // Filter theo branch của staff
        });
    }, [debouncedSearchTerm, selectedCategory, fetchDishesForStaff, user?.branchId]);

    useEffect(() => {
        // Load combos using Staff API (không bao gồm DISCONTINUED)
        // Trang order cần tất cả combo, không phân trang
        fetchCombosForStaff({
            name: debouncedSearchTerm,
            status: 'ACTIVE',
            page: 0,
            size: 1000, // Lấy tất cả combo cho trang order
            branchId: user?.branchId, // Filter theo branch của staff
        });
    }, [debouncedSearchTerm, fetchCombosForStaff, user?.branchId]);


    // Filter dishes and combos
    const dishes = dishPage?.content || [];
    const combos = comboPage?.content || [];
    const categories = categoryPage?.content || [];


    // Filter dishes by category and search (hiển thị tất cả, không filter theo availabilityStatus)
    const filteredDishes = dishes.filter(dish => {
        const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || dish.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Filter combos by search (hiển thị tất cả, không filter theo availabilityStatus)
    const filteredCombos = combos.filter(combo => {
        const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Cart functions
    const addToCart = (item: any, type: 'dish' | 'combo') => {
        // Lấy thông tin discount từ item
        const discountInfo = getDiscountInfo(item);
        
        const cartItem: CartItem = {
            id: item.id.toString(),
            name: item.name,
            price: discountInfo.newPrice, // Sử dụng giá sau discount
            originalPrice: discountInfo.originalPrice, // Lưu giá gốc
            quantity: 1,
            type,
            image: item.image,
            discountInfo: {
                hasDiscount: discountInfo.hasDiscount,
                finalPrice: discountInfo.newPrice,
                originalPrice: discountInfo.originalPrice,
                discountAmount: discountInfo.discountAmount,
                discountPercentage: 0,
                isActive: discountInfo.hasDiscount
            }
        };

        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => 
                cartItem.id === item.id.toString() && cartItem.type === type
            );

            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id.toString() && cartItem.type === type
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...prevCart, cartItem];
            }
        });
    };

    const removeFromCart = (id: string, type: 'dish' | 'combo') => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => 
                cartItem.id === id && cartItem.type === type
            );

            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(cartItem =>
                    cartItem.id === id && cartItem.type === type
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            } else {
                return prevCart.filter(cartItem => 
                    !(cartItem.id === id && cartItem.type === type)
                );
            }
        });
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalOriginalPrice = () => {
        return cart.reduce((total, item) => total + ((item.originalPrice || item.price) * item.quantity), 0);
    };

    const getTotalSavings = () => {
        return getTotalOriginalPrice() - getTotalPrice();
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const clearCart = () => {
        setCart([]);
        setCustomerPhone('');
        setOrderNotes('');
        setSelectedTable(null);
        // setAppliedVoucher(null);
    };

    // Function để lấy thông tin discount cho item
    const getDiscountInfo = (item: any) => {
        console.log('🔍 getDiscountInfo for item:', item.name, item);
        
        // Logic cũ - kiểm tra discount từ API response
        if (item.discountActive && item.finalPrice && item.finalPrice < item.basePrice) {
            return {
                hasDiscount: true,
                newPrice: item.finalPrice, // Sử dụng finalPrice từ backend
                originalPrice: item.basePrice,
                discountAmount: item.basePrice - item.finalPrice,
                discountCode: `AUTO_DISH_${item.id}`, // Tạm thời tạo code
                discountName: `Giảm giá ${item.name}`
            };
        }
        
        return {
            hasDiscount: false,
            newPrice: item.basePrice,
            originalPrice: item.basePrice,
            discountAmount: 0,
            discountCode: null,
            discountName: null
        };
    };


    const createOrder = async () => {
        if (cart.length === 0) {
            toast.warning(
                <div>
                    <div className="fw-bold mb-1">⚠️ Giỏ hàng trống</div>
                    <div className="small">Vui lòng thêm món ăn vào giỏ hàng trước khi tạo đơn!</div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );
            return;
        }

        setIsCreatingOrder(true);
        setOrderError(null);

        try {
            // Convert cart items to OrderItemRequestDTO
            const orderItems: OrderItemRequestDTO[] = cart.map(item => {
                const orderItem: OrderItemRequestDTO = {
                    quantity: item.quantity,
                    unitPrice: item.price,
                    specialInstructions: `Món: ${item.name}`
                };

                // Set dishId or comboId based on type
                if (item.type === 'dish') {
                    orderItem.dishId = parseInt(item.id);
                } else if (item.type === 'combo') {
                    orderItem.comboId = parseInt(item.id);
                }

                return orderItem;
            });

            // Create order request
            const orderRequest: OrderRequestDTO = {
                tableId: selectedTable, // Có thể null nếu không chọn bàn
                customerName: 'Khách hàng tại quầy',
                customerPhone: customerPhone || undefined, // Có thể undefined
                notes: orderNotes || undefined, // Có thể undefined
                items: orderItems,
                specialInstructions: `Tổng ${cart.length} món, tổng tiền: ${formatPrice(getTotalPrice())}đ${getTotalSavings() > 0 ? ` (tiết kiệm: ${formatPrice(getTotalSavings())}đ)` : ''}`,
                orderType: 'COUNTER', // Phân biệt order tại quầy vs online
                // voucherCode: appliedVoucher?.code || undefined // Thêm mã voucher nếu có
            };

            console.log('Creating order with data:', orderRequest);

            // Call API to create order
            const createdOrder = await StaffOrderService.createOrder(orderRequest);
            
            console.log('Order created successfully:', createdOrder);
            
            // Set success data and show modal
            setSuccessOrderData({
                id: createdOrder.id,
                totalAmount: createdOrder.totalAmount,
                itemCount: cart.length,
                createdAt: new Date().toISOString()
            });
            setShowSuccessModal(true);
            
            // Clear cart and form after successful order creation
            setCart([]);
            setCustomerPhone('');
            setOrderNotes('');
            setSelectedTable(null);
            // setAppliedVoucher(null);
            
        } catch (error: any) {
            console.error('Error creating order:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn hàng';
            setOrderError(errorMessage);
            
            // Show error message with toast notification
            toast.error(
                <div>
                    <div className="fw-bold mb-1">❌ Lỗi tạo đơn hàng</div>
                    <div className="small">{errorMessage}</div>
                    <div className="mt-1 text-muted small">Vui lòng thử lại sau!</div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );
        } finally {
            setIsCreatingOrder(false);
        }
    };

    if (categoriesLoading) {
        return (
            <Container fluid className="mt-4">
                <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <h4 className="mb-0">
                                        <Cart3 className="me-2" />
                                        Tạo đơn hàng - Staff
                                    </h4>
                                    <small className="text-muted">
                                        Chi nhánh: {user?.branchId || 'N/A'}
                                    </small>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setShowCart(!showCart)}
                                        className="me-2"
                                    >
                                        <Cart3 className="me-1" />
                                        Giỏ hàng ({getTotalItems()})
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => window.location.href = '/staff/new/dashboard'}
                                    >
                                        <ArrowRight className="me-1" />
                                        Quay lại
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Left Side - Menu */}
                <Col md={showCart ? 8 : 12}>
                    {/* Search and Filter */}
                    <Card className="mb-4">
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <Search />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm kiếm món ăn, combo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={selectedCategory || ''}
                                        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        {categories
                                            .filter(cat => cat.status === 'ACTIVE')
                                            .map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <div className="btn-group w-100" role="group">
                                        <Button
                                            variant={activeTab === 'dishes' ? 'primary' : 'outline-primary'}
                                            onClick={() => setActiveTab('dishes')}
                                        >
                                            Món ăn ({filteredDishes.length})
                                        </Button>
                                        <Button
                                            variant={activeTab === 'combos' ? 'primary' : 'outline-primary'}
                                            onClick={() => setActiveTab('combos')}
                                        >
                                            Combo ({filteredCombos.length})
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Menu Items */}
                    {activeTab === 'dishes' ? (
                        <div>
                            {dishesLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Đang tải món ăn...</p>
                                </div>
                            ) : filteredDishes.length === 0 ? (
                                <Alert variant="info">
                                    <Eye className="me-2" />
                                    Không tìm thấy món ăn nào
                                </Alert>
                            ) : (
                                <Row>
                                    {filteredDishes.map(dish => (
                                        <Col md={4} lg={3} key={dish.id} className="mb-3">
                                            <Card className={`h-100 ${dish.availabilityStatus !== 'AVAILABLE' ? 'opacity-50' : ''}`}>
                                                <div className="position-relative">
                                                    <Card.Img
                                                        variant="top"
                                                        src={dish.image || '/images/default-dish.svg'}
                                                        style={{ height: '150px', objectFit: 'cover' }}
                                                    />
                                                    <Badge 
                                                        bg={dish.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}
                                                        className="position-absolute top-0 end-0 m-2"
                                                    >
                                                        {dish.availabilityStatus === 'AVAILABLE' ? 'Có sẵn' : 'Hết hàng'}
                                                    </Badge>
                                                </div>
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title className="h6">{dish.name}</Card.Title>
                                                    <Card.Text className="text-muted small flex-grow-1">
                                                        {dish.description}
                                                    </Card.Text>
                                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                                        <div className="d-flex flex-column">
                                                            {(() => {
                                                                const discountInfo = getDiscountInfo(dish);
                                                                if (discountInfo.hasDiscount) {
                                                                    return (
                                                                        <>
                                                                            <span className="fw-bold text-success">
                                                                                <CurrencyDollar className="me-1" />
                                                                                {formatPrice(discountInfo.newPrice)}đ
                                                                            </span>
                                                                            <div className="d-flex align-items-center">
                                                                                <span className="text-muted small text-decoration-line-through me-2">
                                                                                    {formatPrice(discountInfo.originalPrice)}đ
                                                                                </span>
                                                                                <Badge bg="danger" className="small">
                                                                                    -{formatPrice(discountInfo.discountAmount)}đ
                                                                                </Badge>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <span className="fw-bold text-primary">
                                                                            <CurrencyDollar className="me-1" />
                                                                            {formatPrice(dish.basePrice)}đ
                                                                        </span>
                                                                    );
                                                                }
                                                            })()}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant={dish.availabilityStatus === 'AVAILABLE' ? 'outline-primary' : 'outline-secondary'}
                                                            onClick={() => addToCart(dish, 'dish')}
                                                            disabled={dish.availabilityStatus !== 'AVAILABLE'}
                                                            title={dish.availabilityStatus !== 'AVAILABLE' ? 'Món này đã hết hàng' : 'Thêm vào giỏ hàng'}
                                                        >
                                                            <Plus />
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    ) : (
                        <div>
                            {combosLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Đang tải combo...</p>
                                </div>
                            ) : filteredCombos.length === 0 ? (
                                <Alert variant="info">
                                    <Eye className="me-2" />
                                    Không tìm thấy combo nào
                                </Alert>
                            ) : (
                                <Row>
                                    {filteredCombos.map(combo => (
                                        <Col md={4} lg={3} key={combo.id} className="mb-3">
                                            <Card className={`h-100 ${combo.availabilityStatus !== 'AVAILABLE' ? 'opacity-50' : ''}`}>
                                                <div className="position-relative">
                                                    <Card.Img
                                                        variant="top"
                                                        src={combo.image || '/images/default-combo.svg'}
                                                        style={{ height: '150px', objectFit: 'cover' }}
                                                    />
                                                    <Badge 
                                                        bg={combo.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}
                                                        className="position-absolute top-0 end-0 m-2"
                                                    >
                                                        {combo.availabilityStatus === 'AVAILABLE' ? 'Có sẵn' : 'Hết hàng'}
                                                    </Badge>
                                                </div>
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title className="h6">{combo.name}</Card.Title>
                                                    <Card.Text className="text-muted small flex-grow-1">
                                                        {combo.description}
                                                    </Card.Text>
                                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                                        <div className="d-flex flex-column">
                                                            {(() => {
                                                                const discountInfo = getDiscountInfo(combo);
                                                                if (discountInfo.hasDiscount) {
                                                                    return (
                                                                        <>
                                                                            <span className="fw-bold text-success">
                                                                                <CurrencyDollar className="me-1" />
                                                                                {formatPrice(discountInfo.newPrice)}đ
                                                                            </span>
                                                                            <div className="d-flex align-items-center">
                                                                                <span className="text-muted small text-decoration-line-through me-2">
                                                                                    {formatPrice(discountInfo.originalPrice)}đ
                                                                                </span>
                                                                                <Badge bg="danger" className="small">
                                                                                    -{formatPrice(discountInfo.discountAmount)}đ
                                                                                </Badge>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <span className="fw-bold text-primary">
                                                                            <CurrencyDollar className="me-1" />
                                                                            {formatPrice(combo.basePrice)}đ
                                                                        </span>
                                                                    );
                                                                }
                                                            })()}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant={combo.availabilityStatus === 'AVAILABLE' ? 'outline-primary' : 'outline-secondary'}
                                                            onClick={() => addToCart(combo, 'combo')}
                                                            disabled={combo.availabilityStatus !== 'AVAILABLE'}
                                                            title={combo.availabilityStatus !== 'AVAILABLE' ? 'Combo này đã hết hàng' : 'Thêm vào giỏ hàng'}
                                                        >
                                                            <Plus />
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    )}
                </Col>

                {/* Right Side - Cart */}
                {showCart && (
                    <Col md={4}>
                        <Card className="sticky-top" style={{ top: '20px' }}>
                            <Card.Header>
                                <h5 className="mb-0">
                                    <Cart3 className="me-2" />
                                    Giỏ hàng ({getTotalItems()})
                                </h5>
                            </Card.Header>
                            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {cart.length === 0 ? (
                                    <Alert variant="info">
                                        <Eye className="me-2" />
                                        Giỏ hàng trống
                                    </Alert>
                                ) : (
                                    <div>
                                        {cart.map((item, index) => (
                                            <div key={`${item.id}-${item.type}`} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold small">{item.name}</div>
                                                    <div className="text-muted small">
                                                        {item.discountInfo?.hasDiscount ? (
                                                            <div className="d-flex align-items-center">
                                                                <CurrencyDollar className="me-1" />
                                                                <span className="text-success fw-bold me-2">
                                                                    {formatPrice(item.price)}đ
                                                                </span>
                                                                <span className="text-decoration-line-through me-2">
                                                                    {formatPrice(item.originalPrice || item.price)}đ
                                                                </span>
                                                                <Badge bg="danger" className="small">
                                                                    -{formatPercentage(item.discountInfo.discountPercentage)}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <CurrencyDollar className="me-1" />
                                                                {formatPrice(item.price)}đ
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        onClick={() => removeFromCart(item.id, item.type)}
                                                    >
                                                        <Dash />
                                                    </Button>
                                                    <span className="mx-2">{item.quantity}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => addToCart(
                                                            { id: item.id, name: item.name, basePrice: item.price },
                                                            item.type
                                                        )}
                                                    >
                                                        <Plus />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <hr />
                                        
                                        {/* Voucher Input - temporarily hidden */}
                                        {/* <VoucherInput
                                            onVoucherApplied={setAppliedVoucher}
                                            onVoucherRemoved={() => setAppliedVoucher(null)}
                                            appliedVoucher={appliedVoucher}
                                            disabled={isCreatingOrder}
                                        /> */}

                                        {/* Customer Information */}
                                        <div className="mb-3">
                                            <h6 className="mb-2">Thông tin khách hàng</h6>
                                            
                                            {/* Phone Number */}
                                            <div className="mb-2">
                                                <Form.Label className="small">Số điện thoại (tùy chọn)</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    placeholder="Nhập số điện thoại..."
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    size="sm"
                                                />
                                            </div>

                                            {/* Table Selection */}
                                            <div className="mb-2">
                                                <Form.Label className="small">Chọn bàn (tùy chọn)</Form.Label>
                                                <Form.Select
                                                    value={selectedTable || ''}
                                                    onChange={(e) => setSelectedTable(e.target.value ? Number(e.target.value) : null)}
                                                    size="sm"
                                                >
                                                    <option value="">Không chọn bàn</option>
                                                    {tables.map(table => (
                                                        <option key={table.id} value={table.id}>
                                                            Bàn {table.name} - {table.seats} chỗ
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>

                                            {/* Order Notes */}
                                            <div className="mb-3">
                                                <Form.Label className="small">Ghi chú đơn hàng (tùy chọn)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Nhập ghi chú cho đơn hàng..."
                                                    value={orderNotes}
                                                    onChange={(e) => setOrderNotes(e.target.value)}
                                                    size="sm"
                                                />
                                            </div>
                                        </div>
                                        
                                        {getTotalSavings() > 0 && (
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small">Tổng gốc:</span>
                                                <span className="text-muted small text-decoration-line-through">
                                                    {formatPrice(getTotalOriginalPrice())}đ
                                                </span>
                                            </div>
                                        )}
                                        
                                        {getTotalSavings() > 0 && (
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-success small">Tiết kiệm:</span>
                                                <span className="text-success small fw-bold">
                                                    -{formatPrice(getTotalSavings())}đ
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold">Tổng cộng:</span>
                                            <span className="fw-bold text-primary">
                                                <CurrencyDollar className="me-1" />
                                                {formatPrice(getTotalPrice())}đ
                                            </span>
                                        </div>
                                        
                                        {orderError && (
                                            <Alert variant="danger" className="mb-3">
                                                <strong>Lỗi:</strong> {orderError}
                                            </Alert>
                                        )}
                                        
                                        <div className="d-grid gap-2">
                                            <Button 
                                                variant="success" 
                                                onClick={createOrder}
                                                disabled={isCreatingOrder || cart.length === 0}
                                            >
                                                {isCreatingOrder ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Đang tạo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="me-2" />
                                                        Tạo đơn hàng
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline-danger" onClick={clearCart}>
                                                <XCircle className="me-2" />
                                                Xóa giỏ hàng
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Success Modal */}
            {successOrderData && (
                <OrderSuccessModal
                    show={showSuccessModal}
                    onHide={() => {
                        setShowSuccessModal(false);
                        setSuccessOrderData(null);
                    }}
                    orderData={successOrderData}
                />
            )}
        </Container>
    );
};

export default StaffOrderPage;