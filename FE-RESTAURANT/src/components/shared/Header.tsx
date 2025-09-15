import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from './NotificationCenter';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/admin" className="fw-bold text-primary d-flex align-items-center">
                     <img 
             src="/logoGoldenBamboo.png" 
             alt="Golden Bamboo Logo" 
             style={{ 
               width: '30px', 
               height: '30px',
               marginRight: '10px',
               filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
             }} 
           />
          Golden Bamboo Restaurant
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            <div className="me-3">
              <NotificationCenter />
            </div>
            
            <Nav.Link as={Link} to="/profile" className="d-flex align-items-center me-2">
              <FaUser className="me-1" />
              <span className="d-none d-md-inline">
                {user?.name || user?.username || 'User'}
              </span>
            </Nav.Link>
            
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center"
            >
              <FaSignOutAlt className="me-1" />
              <span className="d-none d-md-inline">Đăng xuất</span>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

