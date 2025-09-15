import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
    Cart3, 
    Eye, 
    CheckCircle, 
    XCircle, 
    Clock,
    Search,
    Filter,
    Receipt,
    CreditCard,
    ChevronDown,
    Bolt,
    Hdd,
    ArrowRepeat,
    Check2,
    X,
    Plus,
    Edit,
    Trash,
    CurrencyDollar,
    Person,
    GraphUp,
    CheckCircle as CheckCircle2,
    ArrowRight,
    InfoCircle,
    ExternalLink,
    Home,
    ShoppingCart,
    List
} from 'react-bootstrap-icons';

const StaffIconTest: React.FC = () => {
    const icons = [
        { name: 'Cart3', icon: <Cart3 size={24} /> },
        { name: 'Eye', icon: <Eye size={24} /> },
        { name: 'CheckCircle', icon: <CheckCircle size={24} /> },
        { name: 'XCircle', icon: <XCircle size={24} /> },
        { name: 'Clock', icon: <Clock size={24} /> },
        { name: 'Search', icon: <Search size={24} /> },
        { name: 'Filter', icon: <Filter size={24} /> },
        { name: 'Receipt', icon: <Receipt size={24} /> },
        { name: 'CreditCard', icon: <CreditCard size={24} /> },
        { name: 'ChevronDown', icon: <ChevronDown size={24} /> },
        { name: 'Bolt', icon: <Bolt size={24} /> },
        { name: 'Hdd', icon: <Hdd size={24} /> },
        { name: 'ArrowRepeat', icon: <ArrowRepeat size={24} /> },
        { name: 'Check2', icon: <Check2 size={24} /> },
        { name: 'X', icon: <X size={24} /> },
        { name: 'Plus', icon: <Plus size={24} /> },
        { name: 'Edit', icon: <Edit size={24} /> },
        { name: 'Trash', icon: <Trash size={24} /> },
        { name: 'CurrencyDollar', icon: <CurrencyDollar size={24} /> },
        { name: 'Person', icon: <Person size={24} /> },
        { name: 'GraphUp', icon: <GraphUp size={24} /> },
        { name: 'ArrowRight', icon: <ArrowRight size={24} /> },
        { name: 'InfoCircle', icon: <InfoCircle size={24} /> },
        { name: 'ExternalLink', icon: <ExternalLink size={24} /> },
        { name: 'Home', icon: <Home size={24} /> },
        { name: 'ShoppingCart', icon: <ShoppingCart size={24} /> },
        { name: 'List', icon: <List size={24} /> },
    ];

    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <h4 className="mb-0">Icon Test - Staff Interface</h4>
                            <small className="text-muted">Kiểm tra tất cả icon được sử dụng</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Icons được sử dụng trong Staff Interface</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {icons.map((item, index) => (
                                    <Col key={index} md={3} className="mb-3">
                                        <div className="d-flex align-items-center p-2 border rounded">
                                            <div className="me-3">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <strong>{item.name}</strong>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StaffIconTest;
