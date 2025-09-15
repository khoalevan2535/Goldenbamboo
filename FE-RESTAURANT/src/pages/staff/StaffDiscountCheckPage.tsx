import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Search, CheckCircle, XCircle, InfoCircle } from 'react-bootstrap-icons';
import { useDishes } from '../../hooks/useDishes';
import { useCombos } from '../../hooks/useCombos';
import { formatPrice } from '../../utils/discountUtils';
import { discountService } from '../../services/DiscountService';

interface ActiveDiscount {
  id: number;
  code: string;
  name: string;
  newPrice: number;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
}

const StaffDiscountCheckPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeDiscount, setActiveDiscount] = useState<ActiveDiscount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dishPage, fetchDishes } = useDishes();
  const { comboPage, fetchCombos } = useCombos();

  const dishes = dishPage?.content || [];
  const combos = comboPage?.content || [];

  useEffect(() => {
    fetchDishes({ page: 0, size: 100 });
    fetchCombos({ page: 0, size: 100 });
  }, []);

  const handleCheckDiscount = async (item: any, type: 'dish' | 'combo') => {
    setLoading(true);
    setError(null);
    setActiveDiscount(null);
    setSelectedItem({ ...item, type });

    try {
      let response;
      if (type === 'dish') {
        response = await discountService.getActiveDiscountForDish(item.id);
      } else {
        response = await discountService.getActiveDiscountForCombo(item.id);
      }

      if (response && response.id) {
        setActiveDiscount(response);
      } else if (response && response.message) {
        // API trả về message thay vì discount object
        setActiveDiscount(null);
      } else {
        setActiveDiscount(null);
      }
    } catch (error: any) {
      console.error('Error checking discount:', error);
      setError('Lỗi khi kiểm tra discount: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <InfoCircle className="me-2" />
                Kiểm tra Discount đang áp dụng
              </h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm món ăn hoặc combo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <h5>Món ăn</h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredDishes.map(dish => (
                      <Card key={dish.id} className="mb-2">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{dish.name}</h6>
                              <small className="text-muted">
                                Giá gốc: {formatPrice(dish.basePrice)}đ
                              </small>
                            </div>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleCheckDiscount(dish, 'dish')}
                              disabled={loading}
                            >
                              {loading && selectedItem?.id === dish.id ? (
                                <Spinner size="sm" />
                              ) : (
                                'Kiểm tra'
                              )}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Col>

                <Col md={6}>
                  <h5>Combo</h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredCombos.map(combo => (
                      <Card key={combo.id} className="mb-2">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{combo.name}</h6>
                              <small className="text-muted">
                                Giá gốc: {formatPrice(combo.basePrice)}đ
                              </small>
                            </div>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleCheckDiscount(combo, 'combo')}
                              disabled={loading}
                            >
                              {loading && selectedItem?.id === combo.id ? (
                                <Spinner size="sm" />
                              ) : (
                                'Kiểm tra'
                              )}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Col>
              </Row>

              {selectedItem && (
                <Row className="mt-4">
                  <Col>
                    <Card>
                      <Card.Header>
                        <h5 className="mb-0">
                          Kết quả kiểm tra: {selectedItem.name}
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        {loading ? (
                          <div className="text-center">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang kiểm tra...</p>
                          </div>
                        ) : error ? (
                          <Alert variant="danger">
                            <XCircle className="me-2" />
                            {error}
                          </Alert>
                        ) : activeDiscount ? (
                          <Alert variant="success">
                            <CheckCircle className="me-2" />
                            <strong>Có discount đang áp dụng!</strong>
                            <hr />
                            <div className="row">
                              <div className="col-md-6">
                                <p><strong>Mã discount:</strong> {activeDiscount.code}</p>
                                <p><strong>Tên:</strong> {activeDiscount.name}</p>
                                <p><strong>Giá gốc:</strong> {formatPrice(selectedItem.basePrice)}đ</p>
                                <p><strong>Giá sau giảm:</strong> 
                                  <span className="text-success fw-bold ms-2">
                                    {formatPrice(activeDiscount.newPrice)}đ
                                  </span>
                                </p>
                              </div>
                              <div className="col-md-6">
                                <p><strong>Tiết kiệm:</strong> 
                                  <span className="text-success fw-bold ms-2">
                                    {formatPrice(selectedItem.basePrice - activeDiscount.newPrice)}đ
                                  </span>
                                </p>
                                <p><strong>Bắt đầu:</strong> {new Date(activeDiscount.startDate).toLocaleString('vi-VN')}</p>
                                <p><strong>Kết thúc:</strong> {new Date(activeDiscount.endDate).toLocaleString('vi-VN')}</p>
                                <p><strong>Trạng thái:</strong> 
                                  <Badge bg="success" className="ms-2">
                                    {activeDiscount.status}
                                  </Badge>
                                </p>
                              </div>
                            </div>
                            {activeDiscount.description && (
                              <p><strong>Mô tả:</strong> {activeDiscount.description}</p>
                            )}
                          </Alert>
                        ) : (
                          <Alert variant="info">
                            <InfoCircle className="me-2" />
                            <strong>Không có discount đang áp dụng</strong>
                            <p className="mb-0 mt-2">
                              Món này hiện tại không có discount hoặc discount đã hết hạn.
                            </p>
                          </Alert>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffDiscountCheckPage;
