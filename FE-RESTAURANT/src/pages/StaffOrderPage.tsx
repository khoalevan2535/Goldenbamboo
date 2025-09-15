import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { Cart3, Plus, Dash, Trash, Search, Filter, Eye } from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';
import '../style/staff-modern.css';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    type: 'DISH' | 'COMBO';
    image?: string;
    categoryName?: string;
    status?: 'AVAILABLE' | 'OUT_OF_STOCK';
    description?: string;
    discountPercentage?: number;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    type: 'DISH' | 'COMBO';
    notes?: string;
    discountPercentage?: number;
}

interface Table {
    id: number;
    name: string;
    status: string;
    capacity: number;
}

const StaffOrderPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'DISH' | 'COMBO'>('DISH');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        notes: ''
    });
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [orderSuccessMessage, setOrderSuccessMessage] = useState<string>('');
    const [orderErrorMessage, setOrderErrorMessage] = useState<string>('');

    const branchId = user?.branchId;

    // Load data on component mount
    useEffect(() => {
        if (branchId) {
            loadData();
        }
    }, [branchId]);

    // Keyboard shortcuts for quick navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Ctrl/Cmd + O to go to order management
            if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
                event.preventDefault();
                window.location.href = '/staff/order-management';
            }
            // Ctrl/Cmd + Shift + O to open in new tab
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'O') {
                event.preventDefault();
                window.open('/staff/order-management', '_blank');
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            if (!branchId) {
                toast.error('Không tìm thấy thông tin chi nhánh');
                return;
            }

            console.log('🔄 Loading data for branch:', branchId);

            // Load real data from database
            const [menuResponse, tablesResponse] = await Promise.all([
                apiClient.get(`/staff/menu/${branchId}`),
                apiClient.get('/tables')
            ]);

            // Process menu data - data is directly in response
            if (menuResponse) {
                const menuData = menuResponse as any;
                console.log('Raw menu response:', menuResponse);
                console.log('Menu data structure:', menuData);
                
                // Process dishes and combos separately
                const dishes = (menuData.dishes || []).map((dish: any) => ({
                    id: dish.id,
                    name: dish.name || dish.dishName || 'Unknown Dish',
                    price: dish.price || 0,
                    type: 'DISH' as const,
                    categoryName: dish.categoryName || dish.category?.name || 'Other',
                    status: dish.status || 'AVAILABLE',
                    description: dish.description || '',
                    image: dish.image || dish.imageUrl || dish.photo || ''
                }));

                const combos = (menuData.combos || []).map((combo: any) => ({
                    id: combo.id,
                    name: combo.name || combo.comboName || 'Unknown Combo',
                    price: combo.price || 0,
                    type: 'COMBO' as const,
                    categoryName: combo.categoryName || combo.category?.name || 'Combo',
                    status: combo.status || 'AVAILABLE',
                    description: combo.description || '',
                    image: combo.image || combo.imageUrl || combo.photo || ''
                }));

                const allMenuItems = [...dishes, ...combos];
                
                // Add sample images for testing if no images from API
                const sampleImages = {
                    'DISH': '/images/bunbo.jpg',
                    'COMBO': '/images/default-combo.svg'
                };
                
                // If no images from API, add sample images for testing
                allMenuItems.forEach(item => {
                    if (!item.image || item.image.trim() === '') {
                        item.image = sampleImages[item.type] || '/images/default-dish.svg';
                        console.log(`🖼️ Added sample image for ${item.name}: ${item.image}`);
                    }
                });
                
                console.log('Processed dishes:', dishes);
                console.log('Processed combos:', combos);
                console.log('All menu items after transform:', allMenuItems);
                console.log('🔍 Checking images in menu items:');
                allMenuItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.name}: image = "${item.image}"`);
                    if (item.image && item.image.trim() !== '') {
                        console.log(`    ✅ Has image: ${item.image}`);
                    } else {
                        console.log(`    ❌ No image or empty`);
                    }
                });
                setMenuItems(allMenuItems);
                
                const uniqueCategories = [...new Set(allMenuItems.map((item: any) => item.categoryName || item.category?.name).filter((cat: any): cat is string => Boolean(cat)))] as string[];
                console.log('Categories:', uniqueCategories);
                setCategories(uniqueCategories);
            }

            // Process tables data - data is directly in response
            if (tablesResponse && Array.isArray(tablesResponse)) {
                // Transform table data to match our interface
                const transformedTables = tablesResponse.map((table: any) => ({
                    id: table.id,
                    name: table.name,
                    status: table.status,
                    capacity: table.seats || table.capacity || 4
                }));
                setTables(transformedTables);
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Filter menu items
    const filteredMenuItems = menuItems.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.categoryName === selectedCategory;
        const matchesType = item.type === activeTab;
        return matchesSearch && matchesCategory && matchesType;
    });

    // Debug state - chỉ giữ lại khi cần thiết
    // console.log('Current menuItems state:', menuItems);
    // console.log('Current tables state:', tables);
    // console.log('Filtered menu items:', filteredMenuItems);

    // Cart operations
    const addToCart = (item: MenuItem) => {
        console.log('🛒 Adding item to cart:', {
            id: item.id,
            name: item.name,
            price: item.price,
            type: item.type,
            categoryName: item.categoryName,
            status: item.status,
            description: item.description
        });
        
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...prevCart, {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    type: item.type,
                    discountPercentage: item.discountPercentage || 0
                }];
            }
        });
        // Không hiển thị thông báo khi thêm món vào giỏ hàng
    };

    const removeFromCart = (itemId: number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        toast.info('Đã xóa món khỏi giỏ hàng');
    };

    const updateCartItemQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        
        setCart(prevCart => prevCart.map(item =>
            item.id === itemId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        toast.info('Đã xóa giỏ hàng');
    };

    const cartTotal = cart.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        const discountAmount = item.discountPercentage ? (itemTotal * item.discountPercentage) / 100 : 0;
        return total + (itemTotal - discountAmount);
    }, 0);

    const createOrder = async () => {
        console.log('createOrder called');
        console.log('selectedTable:', selectedTable);
        console.log('=== CREATE ORDER DEBUG ===');
        console.log('cart:', cart);
        console.log('customerInfo:', customerInfo);
        console.log('selectedTable:', selectedTable);
        
        if (cart.length === 0) {
            toast.error('Giỏ hàng trống');
            return;
        }

        console.log('=== VALIDATION DEBUG ===');
        console.log('selectedTable value:', selectedTable);
        console.log('selectedTable type:', typeof selectedTable);
        console.log('selectedTable === null:', selectedTable === null);
        console.log('selectedTable === undefined:', selectedTable === undefined);
        console.log('selectedTable === 0:', selectedTable === 0);
        console.log('!selectedTable:', !selectedTable);
        
        // Bỏ validation bắt buộc chọn bàn - cho phép tạo order không có bàn
        console.log('✅ Validation passed: Table selection is optional');
        
        console.log('✅ Validation passed: Table selected');

        setIsCreatingOrder(true);
        try {
            const orderData = {
                tableId: selectedTable === 0 ? null : selectedTable, // Gửi null nếu không chọn bàn
                customerName: 'Khách lẻ',
                customerPhone: customerInfo.phone,
                notes: customerInfo.notes,
                totalAmount: cartTotal, // Thêm tổng tiền vào request
                items: cart.map(item => {
                    const itemTotal = item.price * item.quantity;
                    const discountAmount = item.discountPercentage ? (itemTotal * item.discountPercentage) / 100 : 0;
                    const finalPrice = itemTotal - discountAmount;
                    
                    const itemData = {
                        menuItemId: item.id,
                        menuDishId: item.type === 'DISH' ? item.id : null,
                        comboId: item.type === 'COMBO' ? item.id : null,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: finalPrice, // Giá sau discount
                        discountPercentage: item.discountPercentage || 0,
                        notes: item.notes
                    };
                    console.log(`🔍 Item ${item.name} (${item.type}):`, itemData);
                    return itemData;
                })
            };
            
            console.log('Order data being sent:', orderData);
            console.log('📊 Cart total calculation:', {
                cartTotal,
                itemCount: cart.length,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    price: item.price,
                    quantity: item.quantity,
                    discountPercentage: item.discountPercentage,
                    itemTotal: item.price * item.quantity,
                    discountAmount: item.discountPercentage ? (item.price * item.quantity * item.discountPercentage) / 100 : 0,
                    finalPrice: item.price * item.quantity - (item.discountPercentage ? (item.price * item.quantity * item.discountPercentage) / 100 : 0)
                }))
            });

                    console.log('Creating order:', orderData);

        // Call API to create order
        console.log('🚀 Sending request to /orders with data:', orderData);
        const response = await apiClient.post('/orders', orderData);
            console.log('📥 API Response received:');
            console.log('  - Full response:', response);
            console.log('  - Status:', response.status);
            console.log('  - StatusText:', response.statusText);
            console.log('  - Data:', response.data);
            console.log('  - Data type:', typeof response.data);
            console.log('  - Response keys:', Object.keys(response));
            console.log('  - Data keys:', response.data ? Object.keys(response.data) : 'null');
            
                            // Kiểm tra cả response.data và response trực tiếp
                const responseOrderData = response.data || response;
                console.log('🔍 Checking order data:', responseOrderData);
                
                if (responseOrderData && (responseOrderData.id || responseOrderData.orderId)) {
                    console.log('✅ Order created successfully!');
                    const orderNumber = responseOrderData.id || responseOrderData.orderId;
                    const tableName = selectedTable === 0 ? 'Khách lẻ' : (tables.find(t => t.id === selectedTable)?.name || 'Bàn ' + selectedTable);
                    
                    console.log('Order number:', orderNumber);
                    console.log('Table name:', tableName);
                    
                            // Hiển thị thông báo thành công với tổng tiền từ backend
                    const backendTotalAmount = responseOrderData.totalAmount || responseOrderData.totalPrice || cartTotal;
                    const totalAmount = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(backendTotalAmount);
                    
                    const successMessage = `✅ Đơn hàng #${orderNumber} đã được tạo thành công cho ${tableName}! Tổng tiền: ${totalAmount}`;
                    console.log('🎉 Success message:', successMessage);
                    
                    // Thử toast trước
                    try {
                        toast.success(successMessage);
                        console.log('✅ Toast success called');
                    } catch (toastError) {
                        console.error('❌ Toast error:', toastError);
                    }
                    
                    // Fallback: sử dụng state để hiển thị alert
                    setOrderSuccessMessage(successMessage);
                    setTimeout(() => setOrderSuccessMessage(''), 5000); // Tự động ẩn sau 5 giây
                    
                    // Chuyển đến trang lịch sử đơn hàng thay vì payment modal
                    clearCart();
                    setCustomerInfo({ name: '', phone: '', notes: '' });
                    setSelectedTable(0);
                    
                    // Refresh data
                    loadData();
                    
                                       // Chỉ hiển thị thông báo thành công, không chuyển trang
                    toast.info('✅ Đơn hàng đã được tạo thành công!');
                } else {
                    console.log('❌ No valid order data found in response');
                    console.log('Response.data:', response.data);
                    console.log('Response:', response);
                    const errorMessage = '❌ Không nhận được dữ liệu đơn hàng từ server';
                    
                    try {
                        toast.error(errorMessage);
                    } catch (toastError) {
                        console.error('❌ Toast error:', toastError);
                    }
                    
                    setOrderErrorMessage(errorMessage);
                    setTimeout(() => setOrderErrorMessage(''), 5000);
                }
            
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    // Function này không cần thiết nữa vì đã chuyển sang trang quản lý đơn hàng
    // const handlePaymentSuccess = () => {
    //     // Handle payment success
    //     toast.success('Thanh toán thành công!');
    //     setShowPaymentModal(false);
    //     setCurrentOrder(null);
    // };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="staff-order-page">
            {/* Modern Fixed Navigation Bar */}
            <div className="position-fixed top-0 start-0 w-100 bg-gradient-to-r from-primary to-info text-white shadow-lg" style={{ zIndex: 1000 }}>
                <Container fluid>
                    <Row className="py-2 align-items-center">
                        <Col>
                            
                   
                        </Col>
                       
                    </Row>
                </Container>
            </div>

            {/* Success Alert */}
            {orderSuccessMessage && (
                <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1050, width: '90%', maxWidth: '600px' }}>
                    <Alert variant="success" dismissible onClose={() => setOrderSuccessMessage('')}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>{orderSuccessMessage}</span>
                            <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => window.location.href = '/staff/listorder'}
                            >
                                Chuyển ngay
                            </Button>
                        </div>
                    </Alert>
                </div>
            )}
            
            {/* Error Alert */}
            {orderErrorMessage && (
                <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1050, width: '90%', maxWidth: '600px' }}>
                    <Alert variant="danger" dismissible onClose={() => setOrderErrorMessage('')}>
                        {orderErrorMessage}
                    </Alert>
                </div>
            )}
            
            {/* Main Content with proper spacing for fixed nav */}
            <div style={{ marginTop: '100px', paddingBottom: '100px' }}>
                {/* Page Title */}
                <Row className="mb-4">
                    <Col>
                        <div className='d-flex justify-content-between align-items-center'>
                        <div className="bg-white rounded-3 shadow-sm p-4">
                            <h2 className="mb-0 fw-bold text-primary">
                                <Cart3 className="me-2" />
                                Tạo đơn hàng mới
                            </h2>
                        </div>
                             <Col xs="auto">
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="light" 
                                    size="sm"
                                    className="d-flex align-items-center fw-bold px-2 py-1"
                                    onClick={() => window.location.href = '/staff/listorder'}
                                >
                                    <Eye className="me-1" />
                                    Lịch sử đơn hàng
                                </Button>
                                <Button 
                                    variant="warning" 
                                    size="sm"
                                    className="d-flex align-items-center fw-bold px-2 py-1"
                                    onClick={() => window.open('/staff/order-history', '_blank')}
                                >
                                    <Eye className="me-1" />
                                    Mở Tab Mới
                                </Button>
                            </div>
                        </Col></div>
                        
                    </Col>
                </Row>

            <Row>
                {/* Menu Section */}
                <Col lg={8}>
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Header className="bg-gradient-to-r from-primary to-info text-white">
                            <h5 className="mb-0 fw-bold">
                                <Search className="me-2" />
                                Menu
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {/* Search and Filter */}
                            <Row className="mb-4">
                                <Col md={8}>
                                    <div className="position-relative">
                                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                        <Form.Control
                                            type="text"
                                            placeholder="🔍 Tìm kiếm món ăn..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="ps-5"
                                        />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">📂 Tất cả danh mục</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                            
                            {/* Tab Navigation */}
                            <div className="mb-4">
                                <div className="btn-group w-100" role="group">
                                    <Button
                                        variant={activeTab === 'DISH' ? 'primary' : 'outline-primary'}
                                        className="flex-fill"
                                        onClick={() => setActiveTab('DISH')}
                                    >
                                        🍽️ Món ăn
                                    </Button>
                                    <Button
                                        variant={activeTab === 'COMBO' ? 'primary' : 'outline-primary'}
                                        className="flex-fill"
                                        onClick={() => setActiveTab('COMBO')}
                                    >
                                        🍱 Combo
                                    </Button>
                                </div>
                            </div>

                            <Row className="g-3">
                                {filteredMenuItems.map(item => {
                                    const isInCart = cart.some(cartItem => cartItem.id === item.id);
                                    return (
                                        <Col key={item.id} xs={12} sm={6} md={4}>
                                            <Card 
                                                className={`h-100 shadow-sm hover-shadow transition-all ${
                                                    isInCart ? 'border-success border-2' : 'border-0'
                                                }`}
                                                style={{
                                                    borderColor: isInCart ? '#198754' : undefined,
                                                    boxShadow: isInCart ? '0 0 0 1px #198754, 0 4px 12px rgba(0,0,0,0.1)' : undefined
                                                }}
                                            >
                                                <Card.Body className="p-3">
                                                    {/* Item Image */}
                                                    <div className="text-center mb-3">
                                                        <div 
                                                            className="bg-light rounded-3 d-flex align-items-center justify-content-center overflow-hidden"
                                                            style={{ 
                                                                height: '120px',
                                                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                                                            }}
                                                        >
                                                            {item.image && item.image.trim() !== '' ? (
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.name}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px'
                                                                    }}
                                                                    onError={(e) => {
                                                                        // Fallback to emoji if image fails to load
                                                                        e.currentTarget.style.display = 'none';
                                                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div 
                                                                className="d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    display: item.image && item.image.trim() !== '' ? 'none' : 'flex'
                                                                }}
                                                            >
                                                                {item.type === 'DISH' ? '🍽️' : '🍱'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                                                        <Badge 
                                                            bg={item.status === 'AVAILABLE' ? 'success' : 'danger'}
                                                            className="fs-6"
                                                        >
                                                            {item.status === 'AVAILABLE' ? '✅' : '❌'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted small mb-3">{item.description}</p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="fw-bold text-primary fs-5">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND'
                                                            }).format(item.price)}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            className="rounded-pill px-3"
                                                            onClick={() => addToCart(item)}
                                                            disabled={item.status !== 'AVAILABLE'}
                                                        >
                                                            <Plus size={16} className="me-1" />
                                                            Thêm
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Cart Section */}
                <Col lg={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Header className="bg-gradient-to-r from-success to-info text-white">
                            <h5 className="mb-0 fw-bold">
                                <Cart3 className="me-2" />
                                Giỏ hàng ({cart.length} món)
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-5">
                                    <Cart3 size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Cart is empty</p>
                                    <small className="text-muted">Add items from the menu on the left</small>
                                </div>
                            ) : (
                                <>
                                    {cart.map(item => (
                                        <div key={item.id} className="card mb-3 border-0 shadow-sm">
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 fw-bold text-dark">{item.name}</h6>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND'
                                                                }).format(item.price)} x {item.quantity}
                                                            </small>
                                                            <span className="fw-bold text-primary">
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND'
                                                                }).format(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                                            className="rounded-start"
                                                        >
                                                            <Dash size={12} />
                                                        </Button>
                                                        <span className="px-3 py-1 bg-light border-top border-bottom">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                                            className="rounded-end"
                                                        >
                                                            <Plus size={12} />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="ms-2"
                                                    >
                                                        <Trash size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <hr />

                                    <div className="mb-3">
                                        <h6>Chọn bàn</h6>
                                        <Form.Select
                                            value={selectedTable || ''}
                                            onChange={(e) => setSelectedTable(Number(e.target.value) || 0)}
                                        >
                                            <option value="">Chọn bàn</option>
                                            {tables.filter(table => table.status === 'AVAILABLE').map(table => (
                                                <option key={table.id} value={table.id}>
                                                    {table.name} ({table.capacity} người)
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    <div className="mb-3">
                                        <h6>Thông tin bổ sung</h6>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="tel"
                                                placeholder="Số điện thoại (tùy chọn)"
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                placeholder="Ghi chú (tùy chọn)"
                                                value={customerInfo.notes}
                                                onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                                            />
                                        </Form.Group>
                                    </div>

                                    <div className="mb-3 p-3 bg-light rounded-3 border">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0 text-dark">Tổng cộng:</h5>
                                            <h4 className="mb-0 fw-bold text-primary">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(cartTotal)}
                                            </h4>
                                        </div>
                                        
                                        {/* Chi tiết tính toán */}
                                        <div className="small text-muted">
                                            <div className="d-flex justify-content-between">
                                                <span>Tổng tiền hàng:</span>
                                                <span>
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(cart.reduce((total, item) => total + (item.price * item.quantity), 0))}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Giảm giá:</span>
                                                <span className="text-success">
                                                    -{new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(cart.reduce((total, item) => {
                                                        const itemTotal = item.price * item.quantity;
                                                        const discountAmount = item.discountPercentage ? (itemTotal * item.discountPercentage) / 100 : 0;
                                                        return total + discountAmount;
                                                    }, 0))}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <small className="text-muted">
                                            {cart.length} món • {cart.reduce((total, item) => total + item.quantity, 0)} phần
                                        </small>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="success"
                                            size="lg"
                                            onClick={createOrder}
                                            disabled={cart.length === 0 || isCreatingOrder}
                                            className="fw-bold py-3"
                                        >
                                            {isCreatingOrder ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Đang tạo đơn hàng...
                                                </>
                                            ) : cart.length === 0 ? (
                                                <>
                                                    <Cart3 className="me-2" />
                                                    Giỏ hàng trống
                                                </>
                                            ) : (
                                                <>
                                                    <Cart3 className="me-2" />
                                                    Tạo đơn hàng
                                                </>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            onClick={clearCart}
                                            disabled={cart.length === 0}
                                        >
                                            <Trash className="me-2" />
                                            Xóa giỏ hàng
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            </div>

            {/* Floating Action Button for Quick Navigation */}
            <div 
                className="position-fixed" 
                style={{ 
                    zIndex: 1000, 
                    bottom: '30px', 
                    right: '30px',
                    pointerEvents: 'auto'
                }}
            >
                <Button
                    variant="primary"
                    size="lg"
                    className="rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                    style={{ 
                        width: '60px', 
                        height: '60px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onClick={() => window.location.href = '/staff/listorder'}
                    title="Chuyển đến trang quản lý đơn hàng"
                >
                    <Eye size={24} />
                </Button>
            </div>

            {/* Payment Modal - Không cần thiết nữa vì chuyển đến trang quản lý đơn hàng */}
            {/* <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                order={currentOrder}
                onPaymentSuccess={handlePaymentSuccess}
            /> */}
        </Container>
    );
};

export default StaffOrderPage; 
