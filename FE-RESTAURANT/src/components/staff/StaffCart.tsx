import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Cart3, Plus, Dash, Trash, Receipt } from 'react-bootstrap-icons';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    type: 'DISH' | 'COMBO';
    notes?: string;
}

interface StaffCartProps {
    cart: CartItem[];
    onUpdateQuantity: (itemId: number, newQuantity: number) => void;
    onRemoveItem: (itemId: number) => void;
    onClearCart: () => void;
    onCreateOrder: () => void;
}

const StaffCart: React.FC<StaffCartProps> = ({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onCreateOrder
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getCartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const getCartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <Card className="modern-card h-100">
            <Card.Header className="bg-gradient text-white">
                <h5 className="mb-0">
                    <Cart3 className="me-2" />
                    Giỏ hàng
                    {cart.length > 0 && (
                        <Badge bg="light" text="dark" className="ms-2">
                            {cart.length}
                        </Badge>
                    )}
                </h5>
            </Card.Header>
            
            <Card.Body className="p-0">
                {cart.length === 0 ? (
                    <div className="text-center py-5">
                        <Cart3 className="text-muted mb-3" size={48} />
                        <h6 className="text-muted">Giỏ hàng trống</h6>
                        <p className="text-muted small">Chọn món ăn từ menu để thêm vào giỏ hàng</p>
                    </div>
                ) : (
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item p-3 border-bottom">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-bold">{item.name}</h6>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-success fw-bold">{formatCurrency(item.price)}</span>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="me-2"
                                                    style={{ width: '28px', height: '28px', padding: 0 }}
                                                >
                                                    <Dash size={12} />
                                                </Button>
                                                <span className="fw-bold mx-2">{item.quantity}</span>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="ms-2"
                                                    style={{ width: '28px', height: '28px', padding: 0 }}
                                                >
                                                    <Plus size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => onRemoveItem(item.id)}
                                        className="ms-2"
                                    >
                                        <Trash size={12} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card.Body>
            
            {cart.length > 0 && (
                <Card.Footer>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold">Tổng cộng:</span>
                        <span className="fw-bold fs-5 text-success">{formatCurrency(getCartTotal)}</span>
                    </div>
                    <div className="d-grid gap-2">
                        <Button 
                            variant="success" 
                            size="lg"
                            onClick={onCreateOrder}
                            className="mb-2"
                            style={{
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                            }}
                        >
                            <Receipt className="me-2" />
                            Tạo đơn hàng
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            onClick={onClearCart}
                            size="sm"
                            style={{ borderRadius: '8px' }}
                        >
                            <Trash className="me-2" />
                            Xóa giỏ hàng
                        </Button>
                    </div>
                </Card.Footer>
            )}
        </Card>
    );
};

export default StaffCart;




