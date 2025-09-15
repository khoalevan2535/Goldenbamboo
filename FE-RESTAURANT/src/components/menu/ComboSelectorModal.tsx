import React from 'react';
import { Form, Row, Col, Button, Alert, Spinner, Badge, Card, InputGroup } from 'react-bootstrap';
import { FaTimes, FaSearch, FaCheck, FaCheckDouble, FaHamburger, FaPlus, FaUtensils } from 'react-icons/fa';
import { SafeImage } from '../shared/SafeImage';

interface ComboSelectorModalProps {
  show: boolean;
  onClose: () => void;
  onAddSelected: () => void;
  availableCombos: any[];
  selectedCombos: number[];
  onSelectCombo: (comboId: number, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  onSwitchToDish?: () => void;
}

const ComboSelectorModal: React.FC<ComboSelectorModalProps> = ({
  show,
  onClose,
  onAddSelected,
  availableCombos,
  selectedCombos,
  onSelectCombo,
  onSelectAll,
  onDeselectAll,
  searchTerm,
  onSearchChange,
  loading,
  onSwitchToDish
}) => {
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
      padding: '20px'
    }}>
      <div className="bg-white rounded shadow-lg modal-content" style={{ 
        maxWidth: '800px', 
        width: '95%', 
        maxHeight: '90vh', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light">
          <div>
            <h4 className="mb-1">
              <FaHamburger className="me-2 text-success" />
              Chọn combo
            </h4>
            <div className="d-flex gap-3 text-muted small">
              <span>Đã chọn: <Badge bg="success">{selectedCombos.length}</Badge></span>
              <span>Hiển thị: <Badge bg="info">{availableCombos.length}</Badge></span>
            </div>
          </div>
                     {onSwitchToDish && (
             <Button 
               variant="outline-primary" 
               size="sm"
               onClick={onSwitchToDish}
               title="Chuyển sang chọn món ăn"
             >
               <FaUtensils />
             </Button>
           )}
           <Button variant="outline-secondary" size="sm" onClick={onClose}>
             <FaTimes />
           </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-bottom">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm combo theo tên..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            <Button 
              variant="outline-success" 
              onClick={onSelectAll}
              className="btn-select-all"
            >
              <FaCheckDouble className="me-1" />
              Chọn tất cả
            </Button>
          </InputGroup>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {loading ? (
            <div className="loading-container">
              <Spinner animation="border" />
              <div className="mt-3">Đang tải danh sách combo...</div>
            </div>
          ) : (
            <div className="fade-in">
              <Row>
                {availableCombos.map(combo => (
                  <Col key={combo.id} md={6} className="mb-3">
                    <Card 
                      className={`h-100 combo-card ${selectedCombos.includes(combo.id) ? 'selected' : ''}`}
                      onClick={() => onSelectCombo(combo.id, !selectedCombos.includes(combo.id))}
                    >
                      {selectedCombos.includes(combo.id) && (
                        <div className="selection-indicator">
                          <FaCheck />
                        </div>
                      )}
                                             {/* Combo Image */}
                       <div className="combo-image-container">
                         <SafeImage
                           src={combo.imageUrl || '/images/default-combo.svg'}
                           alt={combo.name}
                           className="combo-image"
                           fallbackSrc="/images/default-combo.svg"
                           showSpinner={false}
                         />
                       </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Form.Check
                            type="checkbox"
                            checked={selectedCombos.includes(combo.id)}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <h6 className="card-title mb-2">{combo.name}</h6>
                        <p className="card-text text-muted small flex-grow-1">{combo.description}</p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="warning" className="badge-category">Combo</Badge>
                            <span className="price-display price-display-combo">
                              {combo.basePrice?.toLocaleString()} ₫
                            </span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {availableCombos.length === 0 && !loading && (
                <div className="empty-state">
                  <FaHamburger className="empty-state-icon" />
                  <div>Không có combo nào phù hợp với bộ lọc hiện tại.</div>
                </div>
              )}
            </div>
          )}
        </div>

                 {/* Footer */}
         <div className="p-4 border-top bg-light">
           <div className="d-flex justify-content-between align-items-center">
             <div className="d-flex gap-2">
               <Button 
                 variant="outline-secondary" 
                 size="sm"
                 onClick={onDeselectAll}
               >
                 Bỏ chọn tất cả
               </Button>
               <span className="text-muted small align-self-center">
                 Đã chọn {selectedCombos.length} combo
               </span>
             </div>
             <div className="d-flex gap-2">
               {onSwitchToDish && (
                 <Button 
                   variant="outline-primary" 
                   size="sm"
                   onClick={onSwitchToDish}
                   title="Chuyển sang chọn món ăn"
                 >
                   <FaUtensils className="me-1" />
                   Món ăn
                 </Button>
               )}
               <Button 
                 variant="secondary" 
                 onClick={onClose}
               >
                 Hủy
               </Button>
               <Button 
                 variant="success" 
                 onClick={onAddSelected}
                 disabled={selectedCombos.length === 0}
               >
                 <FaPlus className="me-1" />
                 Thêm {selectedCombos.length} combo
               </Button>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default ComboSelectorModal;
