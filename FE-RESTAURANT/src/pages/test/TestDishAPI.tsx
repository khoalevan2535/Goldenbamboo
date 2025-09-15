import React, { useState } from 'react';
import { Button, Alert, Spinner, Card, ListGroup, Form } from 'react-bootstrap';
import { DishService } from '../../services/DishService';
import { type DishResponseDTO } from '../../interfaces';

const TestDishAPI: React.FC = () => {
  const [allDishes, setAllDishes] = useState<DishResponseDTO[] | null>(null);
  const [approvedDishes, setApprovedDishes] = useState<DishResponseDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAllDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DishService.getAll();
      setAllDishes(response);
      setApprovedDishes(null);
    } catch (err: any) {
      console.error('Error fetching all dishes:', err);
      setError(err.message || 'Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleGetApprovedDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DishService.getApprovedActive();
      setApprovedDishes(response);
      setAllDishes(null);
    } catch (err: any) {
      console.error('Error fetching approved dishes:', err);
      setError(err.message || 'Không thể tải danh sách món ăn đã duyệt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Test Dish API</h1>
      <p>Sử dụng trang này để kiểm tra các API của DishService.</p>

      <Card className="mb-4">
        <Card.Header>Thao tác API</Card.Header>
        <Card.Body>
          <Button onClick={handleGetAllDishes} className="me-2" disabled={loading}>
            {loading && !approvedDishes ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Test getAllDishes()
          </Button>
          <Button onClick={handleGetApprovedDishes} disabled={loading}>
            {loading && !allDishes ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Test getApprovedActive()
          </Button>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && <div className="text-center"><Spinner animation="border" /> Đang tải...</div>}

      {allDishes && (
        <Card className="mt-4">
          <Card.Header>Tất cả Món ăn ({allDishes.length})</Card.Header>
          <ListGroup variant="flush">
            {allDishes.map(dish => (
              <ListGroup.Item key={dish.id}>
                <strong>ID:</strong> {dish.id}, <strong>Name:</strong> {dish.name}, 
                <strong>Price:</strong> {dish.basePrice?.toLocaleString('vi-VN')} VND,
                <strong>Status:</strong> {dish.status}, <strong>Active:</strong> {dish.active ? 'Yes' : 'No'}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      {approvedDishes && (
        <Card className="mt-4">
          <Card.Header>Món ăn đã duyệt và hoạt động ({approvedDishes.length})</Card.Header>
          <ListGroup variant="flush">
            {approvedDishes.map(dish => (
              <ListGroup.Item key={dish.id}>
                <strong>ID:</strong> {dish.id}, <strong>Name:</strong> {dish.name}, 
                <strong>Price:</strong> {dish.basePrice?.toLocaleString('vi-VN')} VND,
                <strong>Status:</strong> {dish.status}, <strong>Active:</strong> {dish.active ? 'Yes' : 'No'}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </div>
  );
};

export default TestDishAPI;


