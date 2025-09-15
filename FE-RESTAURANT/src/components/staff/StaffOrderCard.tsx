import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Plus, Star, Fire } from 'react-bootstrap-icons';
import { SafeImage } from '../shared/SafeImage';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    type: 'DISH' | 'COMBO';
    image?: string;
    categoryName?: string;
    status?: 'AVAILABLE' | 'OUT_OF_STOCK';
    description?: string;
}

interface StaffOrderCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
}

const StaffOrderCard: React.FC<StaffOrderCardProps> = ({ item, onAddToCart }) => {
    // In thông tin item ra console khi component render
    console.log('🍽️ StaffOrderCard - Rendering item:', {
        id: item.id,
        name: item.name,
        price: item.price,
        type: item.type,
        image: item.image,
        categoryName: item.categoryName,
        status: item.status,
        description: item.description
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <Card className="menu-item-card h-100 border-0 shadow-sm">
            <div className="position-relative">
                <img
                    src={item.image && item.image.startsWith('https://res.cloudinary.com/') 
                        ? `/api/staff/menu/proxy/image?url=${encodeURIComponent(item.image)}`
                        : (item.image || '/images/default-dish.svg')
                    }
                    alt={item.name}
                    className="menu-item-image"
                    style={{
                        height: '160px',
                        width: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0'
                    }}
                    onError={(e) => {
                        console.log('🖼️ Direct img error:', item.name, item.image);
                        e.currentTarget.src = '/images/default-dish.svg';
                    }}
                    onLoad={() => console.log('✅ Direct img loaded:', item.name)}
                />
                {item.status === 'OUT_OF_STOCK' && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center rounded-top">
                        <Badge bg="danger">Hết hàng</Badge>
                    </div>
                )}
            </div>
            <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-0 fw-bold text-truncate">{item.name}</h6>
                    <Badge 
                        bg={item.type === 'DISH' ? 'success' : 'info'} 
                        className="ms-2 flex-shrink-0"
                    >
                        {item.type === 'DISH' ? (
                            <>
                                <Star size={12} className="me-1" />
                                Món
                            </>
                        ) : (
                            <>
                                <Fire size={12} className="me-1" />
                                Combo
                            </>
                        )}
                    </Badge>
                </div>
                {item.description && (
                    <p className="text-muted small mb-2">{item.description}</p>
                )}
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-success">{formatCurrency(item.price)}</span>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAddToCart(item)}
                        disabled={item.status === 'OUT_OF_STOCK'}
                        className="px-3"
                        style={{
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                    >
                        <Plus size={14} />
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default StaffOrderCard;




