import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaDatabase, FaRedo, FaInfoCircle } from 'react-icons/fa';
import { useDishes } from '../../hooks/useDishes';
import { DishService } from '../../services/DishService';
import { toast } from 'react-toastify';

export default function StaffDatabaseCheckPage() {
  const { dishPage, loading, fetchDishes } = useDishes();
  const [rawDishData, setRawDishData] = useState<any[]>([]);
  const [loadingRaw, setLoadingRaw] = useState(false);

  const dishes = dishPage?.content || [];

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const fetchRawDishData = async () => {
    setLoadingRaw(true);
    try {
      // Gọi API để lấy raw data từ database
      const response = await DishService.getAll({ page: 0, size: 1000 });
      setRawDishData(response.content || []);
      toast.success('Đã tải dữ liệu raw từ database!');
    } catch (error) {
      console.error('Error fetching raw data:', error);
      toast.error('Không thể tải dữ liệu raw từ database');
    } finally {
      setLoadingRaw(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaDatabase className="me-2" />Kiểm tra Database</h2>
        <Button 
          variant="primary" 
          onClick={fetchRawDishData}
          disabled={loadingRaw}
        >
          {loadingRaw ? <Spinner size="sm" className="me-2" /> : <FaRedo className="me-2" />}
          Tải dữ liệu raw từ DB
        </Button>
      </div>

      <Alert variant="info">
        <FaInfoCircle className="me-2" />
        <strong>Hướng dẫn:</strong> Click "Tải dữ liệu raw từ DB" để xem dữ liệu trực tiếp từ database. 
        So sánh với dữ liệu hiển thị để kiểm tra xem discount có được lưu đúng không.
      </Alert>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Dữ liệu từ API (đã xử lý)</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên món</th>
                      <th>Giá gốc</th>
                      <th>Discount %</th>
                      <th>Discount ₫</th>
                      <th>Active</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.map((dish) => (
                      <tr key={dish.id}>
                        <td>{dish.id}</td>
                        <td>
                          <strong>{dish.name}</strong>
                          <br />
                          <small className="text-muted">{dish.description}</small>
                        </td>
                        <td>{formatPrice(dish.basePrice)}đ</td>
                        <td>
                          {dish.discountPercentage > 0 ? (
                            <Badge bg="danger">{dish.discountPercentage}%</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {dish.discountAmount > 0 ? (
                            <Badge bg="warning">{formatPrice(dish.discountAmount)}đ</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={dish.discountActive ? 'success' : 'secondary'}>
                            {dish.discountActive ? 'Có' : 'Không'}
                          </Badge>
                        </td>
                        <td>
                          <small>{formatDate(dish.discountStartDate)}</small>
                        </td>
                        <td>
                          <small>{formatDate(dish.discountEndDate)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Dữ liệu Raw từ Database</h5>
            </Card.Header>
            <Card.Body>
              {rawDishData.length === 0 ? (
                <Alert variant="warning">
                  <FaInfoCircle className="me-2" />
                  Click "Tải dữ liệu raw từ DB" để xem dữ liệu
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên món</th>
                        <th>Giá gốc</th>
                        <th>Discount %</th>
                        <th>Discount ₫</th>
                        <th>Active</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawDishData.map((dish) => (
                        <tr key={dish.id}>
                          <td>{dish.id}</td>
                          <td>
                            <strong>{dish.name}</strong>
                            <br />
                            <small className="text-muted">{dish.description}</small>
                          </td>
                          <td>{formatPrice(dish.basePrice)}đ</td>
                          <td>
                            {dish.discountPercentage > 0 ? (
                              <Badge bg="danger">{dish.discountPercentage}%</Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {dish.discountAmount > 0 ? (
                              <Badge bg="warning">{formatPrice(dish.discountAmount)}đ</Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={dish.discountActive ? 'success' : 'secondary'}>
                              {dish.discountActive ? 'Có' : 'Không'}
                            </Badge>
                          </td>
                          <td>
                            <small>{formatDate(dish.discountStartDate)}</small>
                          </td>
                          <td>
                            <small>{formatDate(dish.discountEndDate)}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4">
        <Card.Header>
          <h5>Thông tin Database</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <h6>Bảng: <code>dishes</code></h6>
              <ul>
                <li><code>discount_percentage</code> - Phần trăm giảm giá (0-100)</li>
                <li><code>discount_amount</code> - Số tiền giảm giá cố định</li>
                <li><code>discount_start_date</code> - Ngày bắt đầu giảm giá</li>
                <li><code>discount_end_date</code> - Ngày kết thúc giảm giá</li>
                <li><code>discount_active</code> - Trạng thái hoạt động (true/false)</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>API Endpoint:</h6>
              <ul>
                <li><code>PATCH /api/dishes/{id}/discount</code> - Cập nhật discount</li>
                <li><code>PATCH /api/dishes/{id}/discount/remove</code> - Xóa discount</li>
                <li><code>GET /api/dishes</code> - Lấy danh sách món ăn</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}







