import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Badge, Button, Modal, ListGroup } from 'react-bootstrap';
import { FaEye, FaUtensils, FaBox } from 'react-icons/fa';
import { SafeImage } from '../shared/SafeImage';
import type { MenuResponseDTO, MenuDishResponseDTO, MenuComboResponseDTO } from '../../interfaces';

interface MenuDisplayProps {
  menu: MenuResponseDTO;
}

interface ComboDetailModalProps {
  show: boolean;
  onHide: () => void;
  combo: MenuComboResponseDTO | null;
}

function ComboDetailModal({ show, onHide, combo }: ComboDetailModalProps) {
  if (!combo) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{combo.comboName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <SafeImage
                src={combo.imageUrl || '/placeholder-image.svg'}
                alt={combo.comboName}
                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                showSpinner={true}
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <h4 className="text-primary fw-bold">
                {combo.price?.toLocaleString('vi-VN')} ₫
              </h4>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Combo bao gồm:</h6>
              <ListGroup variant="flush">
                {combo.comboDishes?.map((dish, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                    <div>
                      <span className="fw-medium">{dish.dishName}</span>
                    </div>
                    <Badge bg="secondary" className="ms-2">
                      x{dish.quantity}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            {combo.description && (
              <div className="mb-3">
                <h6 className="fw-bold">Mô tả:</h6>
                <p className="text-muted">{combo.description}</p>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
        <Button variant="primary">
          <FaUtensils className="me-2" />
          Thêm vào giỏ hàng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function MenuDisplay({ menu }: MenuDisplayProps) {
  const [activeTab, setActiveTab] = useState<'dishes' | 'combos'>('dishes');
  const [selectedCombo, setSelectedCombo] = useState<MenuComboResponseDTO | null>(null);
  const [showComboModal, setShowComboModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Lấy danh sách categories từ dishes
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(
      (menu.dishes || [])
        .map(dish => dish.categoryName)
        .filter(Boolean)
    )).sort();
    return cats;
  }, [menu.dishes]);

  // Lọc dishes theo category
  const filteredDishes = React.useMemo(() => {
    if (!selectedCategory) return menu.dishes || [];
    return (menu.dishes || []).filter(dish => dish.categoryName === selectedCategory);
  }, [menu.dishes, selectedCategory]);

  const handleComboDetail = (combo: MenuComboResponseDTO) => {
    setSelectedCombo(combo);
    setShowComboModal(true);
  };

  return (
    <>
      <Container className="py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">{menu.name}</h1>
          {menu.description && (
            <p className="lead text-muted">{menu.description}</p>
          )}
        </div>

        {/* Tabs */}
        <Nav variant="pills" className="justify-content-center mb-4">
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'dishes'}
              onClick={() => setActiveTab('dishes')}
              className="px-4 py-2 mx-2"
            >
              <FaUtensils className="me-2" />
              Món lẻ
              <Badge bg="secondary" className="ms-2">
                {(menu.dishes || []).length}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'combos'}
              onClick={() => setActiveTab('combos')}
              className="px-4 py-2 mx-2"
            >
              <FaBox className="me-2" />
              Combo
              <Badge bg="secondary" className="ms-2">
                {(menu.combos || []).length}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Content */}
        {activeTab === 'dishes' && (
          <div>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-4">
                <Nav variant="tabs" className="justify-content-center">
                  <Nav.Item>
                    <Nav.Link
                      active={!selectedCategory}
                      onClick={() => setSelectedCategory('')}
                    >
                      Tất cả ({(menu.dishes || []).length})
                    </Nav.Link>
                  </Nav.Item>
                  {categories.map(category => (
                    <Nav.Item key={category}>
                      <Nav.Link
                        active={selectedCategory === category}
                        onClick={() => setSelectedCategory(category || '')}
                      >
                        {category} ({(menu.dishes || []).filter(d => d.categoryName === category).length})
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>
            )}

            {/* Dishes Grid */}
            <Row>
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => (
                  <Col key={dish.id} lg={3} md={4} sm={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 dish-card">
                      <div className="position-relative">
                        <SafeImage
                          src={dish.imageUrl || '/placeholder-image.svg'} // Thay đổi từ image sang imageUrl
                          alt={dish.dishName}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                          showSpinner={true}
                        />
                        {dish.operationalStatus === 'INACTIVE' && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <Badge bg="secondary">Tạm hết</Badge>
                          </div>
                        )}
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="h6 fw-bold">{dish.dishName}</Card.Title>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="h5 text-primary fw-bold mb-0">
                              {dish.price?.toLocaleString('vi-VN')} ₫
                            </span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              disabled={dish.operationalStatus === 'INACTIVE'}
                            >
                              <FaUtensils className="me-1" />
                              Chọn
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <FaUtensils className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                    <h5 className="text-muted">Không có món ăn nào</h5>
                    <p className="text-muted">
                      {selectedCategory ? `Không có món nào trong danh mục "${selectedCategory}"` : 'Menu này chưa có món ăn nào'}
                    </p>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}

        {activeTab === 'combos' && (
          <div>
            {/* Combos Grid */}
            <Row>
              {(menu.combos || []).length > 0 ? (
                (menu.combos || []).map((combo) => (
                  <Col key={combo.id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 combo-card">
                      <div className="position-relative">
                        <SafeImage
                          src={combo.imageUrl || '/placeholder-image.svg'}
                          alt={combo.comboName}
                          style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                          showSpinner={true}
                        />
                        {combo.operationalStatus === 'INACTIVE' && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <Badge bg="secondary">Tạm hết</Badge>
                          </div>
                        )}
                        <div className="position-absolute bottom-0 start-0 m-2">
                          <Badge bg="warning" text="dark">
                            <FaBox className="me-1" />
                            Combo
                          </Badge>
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="h5 fw-bold">{combo.comboName}</Card.Title>

                        {combo.description && (
                          <Card.Text className="text-muted small mb-3">
                            {combo.description.length > 100
                              ? `${combo.description.substring(0, 100)}...`
                              : combo.description
                            }
                          </Card.Text>
                        )}

                        {/* Combo Items Preview */}
                        {combo.comboDishes && combo.comboDishes.length > 0 && (
                          <div className="mb-3">
                            <small className="text-muted fw-medium">Bao gồm:</small>
                            <div className="mt-1">
                              {combo.comboDishes.slice(0, 3).map((dish, index) => (
                                <small key={index} className="d-block text-muted">
                                  • {dish.dishName} (x{dish.quantity})
                                </small>
                              ))}
                              {combo.comboDishes.length > 3 && (
                                <small className="text-muted">
                                  ... và {combo.comboDishes.length - 3} món khác
                                </small>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="h4 text-primary fw-bold mb-0">
                              {combo.price?.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>

                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="flex-grow-1"
                              onClick={() => handleComboDetail(combo)}
                            >
                              <FaEye className="me-1" />
                              Xem chi tiết
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-grow-1"
                              disabled={combo.operationalStatus === 'INACTIVE'}
                            >
                              <FaUtensils className="me-1" />
                              Chọn
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <FaBox className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                    <h5 className="text-muted">Không có combo nào</h5>
                    <p className="text-muted">Menu này chưa có combo nào</p>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Container>

      {/* Combo Detail Modal */}
      <ComboDetailModal
        show={showComboModal}
        onHide={() => setShowComboModal(false)}
        combo={selectedCombo}
      />

      <style>{`
        .dish-card:hover, .combo-card:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
        
        .dish-card, .combo-card {
          transition: transform 0.3s ease;
        }
      `}</style>
    </>
  );
}

export default MenuDisplay;
