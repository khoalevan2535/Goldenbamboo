import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { MenuDisplay } from '../../components/user/MenuDisplay';
import { MenuService } from '../../services/MenuService';
import CommentSection from '../../components/CommentSection';
import type { MenuResponseDTO } from '../../interfaces';
import '../../components/user/MenuDisplay.css';

const MenuViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      if (!id) {
        setError('ID menu không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const menuData = await MenuService.getById(id);
        setMenu(menuData);
      } catch (err: any) {
        setError(err.message || 'Không thể tải menu');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [id]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3">
            <h5>Đang tải menu...</h5>
            <p className="text-muted">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-center">
            <Button variant="outline-danger" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!menu) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Không tìm thấy menu!</Alert.Heading>
          <p>Menu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <hr />
          <div className="d-flex justify-content-center">
            <Button variant="outline-warning" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="menu-display">
      {/* Back Button */}
      <Container className="py-3">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="mb-3"
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </Container>

      {/* Menu Display */}
      <MenuDisplay menu={menu} />
      
      {/* Comment Section */}
      <CommentSection 
        productId={menu.id} 
        onCommentAdded={(comment) => {
          console.log('New comment added:', comment);
        }}
      />
    </div>
  );
};

export default MenuViewPage;
