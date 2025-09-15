import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const DishCreatePageSimple: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/manager/dishes');
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tạo Món Ăn Mới (Test)</h1>
        <Button variant="outline-secondary" onClick={handleBack}>
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      <Card>
        <Card.Body>
          <h5>Trang tạo món ăn đơn giản</h5>
          <p>Nếu bạn thấy trang này, có nghĩa là navigation hoạt động đúng.</p>
          <p>Vấn đề có thể là do DishForm component phức tạp.</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DishCreatePageSimple;


