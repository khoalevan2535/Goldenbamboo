import React, { useState, useMemo, useCallback } from 'react';
import { Form, Row, Col, Button, Alert, Spinner, Badge, ListGroup, Card, InputGroup, Pagination, Dropdown } from 'react-bootstrap';
import { FaTimes, FaSearch, FaFilter, FaCheck, FaCheckDouble, FaUtensils, FaHamburger, FaPlus, FaChevronLeft, FaChevronRight, FaEdit, FaStop, FaEllipsisV, FaLayerGroup } from 'react-icons/fa';
import { SafeImage } from '../shared/SafeImage';

interface DishSelectorModalProps {
  show: boolean;
  onClose: () => void;
  onAddSelected: () => void;
  availableDishes: any[];
  availableCategories: any[];
  selectedDishes: number[];
  onSelectDish: (dishId: number, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  loading: boolean;
  onEditDish?: (dishId: number) => void;
  onStopSelling?: (dishId: number) => void;
  onSwitchToCombo?: () => void;
}

const ITEMS_PER_PAGE = 24; // Tăng số món ăn mỗi trang để tối ưu diện tích

const DishSelectorModal: React.FC<DishSelectorModalProps> = ({
  show,
  onClose,
  onAddSelected,
  availableDishes,
  availableCategories,
  selectedDishes,
  onSelectDish,
  onSelectAll,
  onDeselectAll,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  loading,
  onEditDish,
  onStopSelling,
  onSwitchToCombo
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Filter and sort dishes
  const filteredAndSortedDishes = useMemo(() => {
    let filtered = availableDishes;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchLower) ||
        dish.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(dish => String(dish.categoryId) === selectedCategory);
    }

    // Sort dishes
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.basePrice || 0;
          bValue = b.basePrice || 0;
          break;
        case 'category':
          const categoryA = availableCategories.find(cat => String(cat.id) === String(a.categoryId));
          const categoryB = availableCategories.find(cat => String(cat.id) === String(b.categoryId));
          aValue = categoryA?.name || '';
          bValue = categoryB?.name || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [availableDishes, searchTerm, selectedCategory, sortBy, sortOrder, availableCategories]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDishes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDishes = filteredAndSortedDishes.slice(startIndex, endIndex);

  // Group dishes by category for list view
  const groupedDishes = useMemo(() => {
    return currentDishes.reduce((groups: any, dish) => {
      const category = availableCategories.find(cat => String(cat.id) === String(dish.categoryId));
      const categoryName = category ? category.name : 'Không phân loại';
      
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(dish);
      return groups;
    }, {});
  }, [currentDishes, availableCategories]);

  // Select all visible dishes
  const handleSelectAllVisible = useCallback(() => {
    const visibleDishIds = currentDishes.map(dish => dish.id);
    visibleDishIds.forEach(dishId => {
      if (!selectedDishes.includes(dishId)) {
        onSelectDish(dishId, true);
      }
    });
  }, [currentDishes, selectedDishes, onSelectDish]);

  // Get selected count for current page
  const selectedInCurrentPage = currentDishes.filter(dish => selectedDishes.includes(dish.id)).length;

  // Handle edit dish
  const handleEditDish = useCallback((dishId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditDish?.(dishId);
  }, [onEditDish]);

  // Handle stop selling
  const handleStopSelling = useCallback((dishId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onStopSelling?.(dishId);
  }, [onStopSelling]);

  if (!show) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 1050,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px'
    }}>
      <div className="bg-white rounded shadow-lg modal-content" style={{ 
        maxWidth: '1200px', 
        width: '98%', 
        maxHeight: '95vh', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Compact Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
          <div>
            <h5 className="mb-1">
              <FaUtensils className="me-2 text-primary" />
              Chọn món ăn
            </h5>
            <div className="d-flex gap-2 text-muted small">
              <span>Đã chọn: <Badge bg="primary">{selectedDishes.length}</Badge></span>
              <span>Hiển thị: <Badge bg="info">{filteredAndSortedDishes.length}</Badge></span>
              <span>Trang: <Badge bg="secondary">{currentPage}/{totalPages}</Badge></span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
              size="sm"
              onClick={() => onViewModeChange('list')}
              title="Chế độ danh sách"
            >
              <FaHamburger />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} 
              size="sm"
              onClick={() => onViewModeChange('grid')}
              title="Chế độ lưới"
            >
              <FaUtensils />
            </Button>
                         {onSwitchToCombo && (
               <Button 
                 variant="outline-success" 
                 size="sm"
                 onClick={onSwitchToCombo}
                 title="Chuyển sang chọn combo"
               >
                 <FaLayerGroup />
               </Button>
             )}
             <Button variant="outline-secondary" size="sm" onClick={onClose}>
               <FaTimes />
             </Button>
          </div>
        </div>

        {/* Compact Search, Filter and Sort Bar */}
        <div className="p-3 border-bottom">
          <Row className="g-2">
            <Col md={3}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm món ăn..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="search-input"
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                >
                  <option value="all">Tất cả danh mục</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <InputGroup size="sm">
                <InputGroup.Text>Sắp xếp</InputGroup.Text>
                <Form.Select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'name' | 'price' | 'category');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                >
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="category-asc">Danh mục A-Z</option>
                  <option value="category-desc">Danh mục Z-A</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-success" 
                size="sm" 
                onClick={handleSelectAllVisible}
                className="w-100 btn-select-all"
                title={`Chọn tất cả ${currentDishes.length} món trong trang này`}
              >
                <FaCheckDouble className="me-1" />
                Chọn trang
              </Button>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-1">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={onDeselectAll}
                  className="flex-fill"
                >
                  Bỏ chọn tất cả
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={onAddSelected}
                  disabled={selectedDishes.length === 0}
                  className="flex-fill"
                >
                  <FaPlus className="me-1" />
                  Thêm {selectedDishes.length}
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '15px' }}>
          {loading ? (
            <div className="loading-container">
              <Spinner animation="border" />
              <div className="mt-3">Đang tải danh sách món ăn...</div>
            </div>
          ) : (
            <div className="fade-in">
              {viewMode === 'list' ? (
                // Compact List View
                Object.entries(groupedDishes).map(([categoryName, dishes]: [string, any]) => (
                  <Card key={categoryName} className="mb-3 slide-in">
                    <Card.Header className="category-header py-2">
                      <h6 className="mb-0">
                        {categoryName} ({dishes.length} món)
                      </h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <ListGroup variant="flush">
                        {dishes.map((dish: any) => (
                          <ListGroup.Item 
                            key={dish.id} 
                            className={`d-flex justify-content-between align-items-center p-2 list-item-hover ${
                              selectedDishes.includes(dish.id) ? 'list-item-selected' : ''
                            }`}
                            onClick={() => onSelectDish(dish.id, !selectedDishes.includes(dish.id))}
                          >
                            <div className="d-flex align-items-center flex-grow-1">
                              <Form.Check
                                type="checkbox"
                                id={`dish-${dish.id}`}
                                checked={selectedDishes.includes(dish.id)}
                                onChange={() => {}}
                                className="me-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center">
                                      <h6 className="mb-0 me-2">{dish.name}</h6>
                                      <Badge bg="info" className="me-2 badge-category">{categoryName}</Badge>
                                      {dish.operationalStatus === 'ACTIVE' && (
                                        <Badge bg="success" className="badge-status">Hoạt động</Badge>
                                      )}
                                    </div>
                                    <p className="text-muted small mb-0">{dish.description}</p>
                                  </div>
                                  <div className="d-flex align-items-center ms-3">
                                    <div className="text-end me-2">
                                      <div className="price-display">
                                        {dish.basePrice?.toLocaleString()} ₫
                                      </div>
                                    </div>
                                    <div className="d-flex gap-1">
                                      {selectedDishes.includes(dish.id) && (
                                        <FaCheck className="text-success" />
                                      )}
                                      <Dropdown>
                                        <Dropdown.Toggle 
                                          variant="outline-secondary" 
                                          size="sm"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <FaEllipsisV />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                          <Dropdown.Item onClick={(e) => handleEditDish(dish.id, e)}>
                                            <FaEdit className="me-2" />
                                            Chỉnh sửa
                                          </Dropdown.Item>
                                          <Dropdown.Item onClick={(e) => handleStopSelling(dish.id, e)}>
                                            <FaStop className="me-2" />
                                            Dừng bán
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                // Compact Grid View
                <Row>
                  {currentDishes.map((dish: any) => {
                    const category = availableCategories.find(cat => String(cat.id) === String(dish.categoryId));
                    return (
                      <Col key={dish.id} md={6} lg={4} xl={3} className="mb-2">
                        <Card 
                          className={`h-100 dish-card ${selectedDishes.includes(dish.id) ? 'selected' : ''}`}
                          onClick={() => onSelectDish(dish.id, !selectedDishes.includes(dish.id))}
                        >
                          {selectedDishes.includes(dish.id) && (
                            <div className="selection-indicator">
                              <FaCheck />
                            </div>
                          )}
                                                     {/* Dish Image */}
                           <div className="dish-image-container">
                             <SafeImage
                               src={dish.imageUrl || '/images/default-dish.svg'}
                               alt={dish.name}
                               className="dish-image"
                               fallbackSrc="/images/default-dish.svg"
                               showSpinner={false}
                             />
                           </div>
                          <Card.Body className="d-flex flex-column p-2">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <Form.Check
                                type="checkbox"
                                checked={selectedDishes.includes(dish.id)}
                                onChange={() => {}}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FaEllipsisV />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={(e) => handleEditDish(dish.id, e)}>
                                    <FaEdit className="me-2" />
                                    Chỉnh sửa
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={(e) => handleStopSelling(dish.id, e)}>
                                    <FaStop className="me-2" />
                                    Dừng bán
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                            <h6 className="card-title mb-1 small">{dish.name}</h6>
                            <p className="card-text text-muted small flex-grow-1 mb-1">{dish.description}</p>
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center">
                                <Badge bg="info" className="badge-category small">{category?.name || 'N/A'}</Badge>
                                <span className="price-display small">
                                  {dish.basePrice?.toLocaleString()} ₫
                                </span>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {filteredAndSortedDishes.length === 0 && !loading && (
                <div className="empty-state">
                  <FaUtensils className="empty-state-icon" />
                  <div>Không có món ăn nào phù hợp với bộ lọc hiện tại.</div>
                </div>
              )}
            </div>
          )}
        </div>

                 {/* Compact Pagination */}
         {totalPages > 1 && (
           <div className="p-2 border-top bg-light">
             <div className="d-flex justify-content-between align-items-center">
               <div className="text-muted small">
                 Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredAndSortedDishes.length)} trong tổng số {filteredAndSortedDishes.length} món ăn
               </div>
               <Pagination className="mb-0 pagination-sm">
                 <Pagination.First 
                   onClick={() => setCurrentPage(1)}
                   disabled={currentPage === 1}
                 />
                 <Pagination.Prev 
                   onClick={() => setCurrentPage(currentPage - 1)}
                   disabled={currentPage === 1}
                 />
                 
                 {/* Show page numbers */}
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                   let pageNum;
                   if (totalPages <= 5) {
                     pageNum = i + 1;
                   } else if (currentPage <= 3) {
                     pageNum = i + 1;
                   } else if (currentPage >= totalPages - 2) {
                     pageNum = totalPages - 4 + i;
                   } else {
                     pageNum = currentPage - 2 + i;
                   }
                   
                   return (
                     <Pagination.Item
                       key={pageNum}
                       active={pageNum === currentPage}
                       onClick={() => setCurrentPage(pageNum)}
                     >
                       {pageNum}
                     </Pagination.Item>
                   );
                 })}
                 
                 <Pagination.Next 
                   onClick={() => setCurrentPage(currentPage + 1)}
                   disabled={currentPage === totalPages}
                 />
                 <Pagination.Last 
                   onClick={() => setCurrentPage(totalPages)}
                   disabled={currentPage === totalPages}
                 />
               </Pagination>
             </div>
           </div>
         )}

         {/* Footer with switch button */}
         <div className="p-2 border-top bg-light">
           <div className="d-flex justify-content-between align-items-center">
             <div className="text-muted small">
               Đã chọn {selectedDishes.length} món ăn
             </div>
             <div className="d-flex gap-2">
               {onSwitchToCombo && (
                 <Button 
                   variant="outline-success" 
                   size="sm"
                   onClick={onSwitchToCombo}
                   title="Chuyển sang chọn combo"
                 >
                   <FaLayerGroup className="me-1" />
                   Combo
                 </Button>
               )}
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default DishSelectorModal;
