import { useState, useEffect, type FormEvent } from 'react';
import { Modal, Button, Form, Alert, Badge, ListGroup } from 'react-bootstrap';
import type { ComboResponseDTO } from '../../interfaces';
import { ItemAvailabilityStatus } from '../../interfaces/enums/MenuItemStatus';
import { ComboService } from '../../services/ComboService';
import { toast } from 'react-toastify';

interface ComboStatusModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (id: string, newStatus: ItemAvailabilityStatus) => Promise<void>;
  onReset?: () => void; // Callback để refresh danh sách sau khi reset
  combo: ComboResponseDTO | null;
}

export function ComboStatusModal({ show, onHide, onSubmit, onReset, combo }: ComboStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ItemAvailabilityStatus>(ItemAvailabilityStatus.AVAILABLE);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (combo?.availabilityStatus) {
      setSelectedStatus(combo.availabilityStatus);
    }
  }, [combo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (combo && combo.id) {
      try {
        await onSubmit(combo.id, selectedStatus);
        // Sau khi cập nhật thành công, combo sẽ chuyển sang chế độ thủ công
        // Modal sẽ được đóng và danh sách sẽ được refresh
      } catch (error) {
        // Lỗi sẽ được xử lý trong onSubmit
        console.error('Error updating combo status:', error);
      }
    }
    onHide();
  };

  const handleResetToAutomatic = async () => {
    if (!combo?.id) return;
    
    try {
      setIsResetting(true);
      await ComboService.resetToAutomatic(combo.id);
      toast.success('Đã reset combo về trạng thái tự động');
      onReset?.(); // Refresh danh sách
      onHide();
    } catch (error: any) {
      console.error('Error resetting combo:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi reset combo');
    } finally {
      setIsResetting(false);
    }
  };

  // Function để lấy thông tin chi tiết về món ăn trong combo
  const getDishStatusDetails = () => {
    if (!combo?.comboDishes) return null;

    const dishStatuses = combo.comboDishes.map(cd => ({
      name: cd.dishName,
      status: cd.availabilityStatus,
      statusText: cd.availabilityStatus === 'AVAILABLE' ? 'Còn hàng' : 
                  cd.availabilityStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Ngừng bán',
      statusVariant: cd.availabilityStatus === 'AVAILABLE' ? 'success' : 
                     cd.availabilityStatus === 'OUT_OF_STOCK' ? 'warning' : 'danger'
    }));

    return dishStatuses;
  };

  // Function để lấy món ăn có vấn đề
  const getProblematicDishes = () => {
    const dishStatuses = getDishStatusDetails();
    if (!dishStatuses) return [];
    
    return dishStatuses.filter(dish => dish.status !== 'AVAILABLE');
  };

  if (!combo) return null;

  // Debug: Log combo data
  console.log('ComboStatusModal - combo data:', combo);
  console.log('ComboStatusModal - comboDishes:', combo.comboDishes);
  console.log('ComboStatusModal - manualAvailabilityOverride:', combo.manualAvailabilityOverride);
  console.log('ComboStatusModal - availabilityStatus:', combo.availabilityStatus);
  
  const dishStatuses = getDishStatusDetails();
  console.log('ComboStatusModal - dishStatuses:', dishStatuses);
  console.log('ComboStatusModal - all dishes available:', dishStatuses?.every(dish => dish.status === ItemAvailabilityStatus.AVAILABLE));
  
  const canEdit = combo.manualAvailabilityOverride || 
    (!combo.manualAvailabilityOverride && 
     combo.availabilityStatus === ItemAvailabilityStatus.AVAILABLE && 
     dishStatuses?.every(dish => dish.status === ItemAvailabilityStatus.AVAILABLE));
  console.log('ComboStatusModal - canEdit:', canEdit);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Đổi trạng thái Combo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="mb-2">🍽️ {combo.name}</h5>
            {combo.description && (
              <p className="text-muted mb-2">{combo.description}</p>
            )}
            <div className="row">
              <div className="col-md-6">
                <small className="text-muted">Giá: <strong>{typeof combo.basePrice === "number" ? combo.basePrice.toLocaleString("vi-VN") + " ₫" : "N/A"}</strong></small>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Trạng thái: <Badge bg={combo.availabilityStatus === 'AVAILABLE' ? 'success' : combo.availabilityStatus === 'OUT_OF_STOCK' ? 'warning' : 'danger'} className="ms-1">
                  {combo.availabilityStatus === 'AVAILABLE' ? 'Còn hàng' : combo.availabilityStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Ngừng bán'}
                </Badge></small>
              </div>
            </div>
          </div>
          
          {/* Hiển thị trạng thái manual/automatic */}
          <div className="mb-3">
            <strong>Chế độ quản lý:</strong>{' '}
            <Badge bg={combo.manualAvailabilityOverride ? 'warning' : 'info'}>
              {combo.manualAvailabilityOverride ? 'Thủ công' : 'Tự động'}
            </Badge>
            {!combo.manualAvailabilityOverride && (
              <small className="text-muted ms-2">
                (Trạng thái sẽ được cập nhật tự động dựa trên món ăn)
              </small>
            )}
          </div>
          
          {/* Cảnh báo về logic tự động */}
          {!combo.manualAvailabilityOverride && combo.comboDishes?.some(cd => cd.availabilityStatus !== ItemAvailabilityStatus.AVAILABLE) && (
            <Alert variant="warning" className="mb-3">
              <strong>⚠️ Cảnh báo:</strong> Combo này có món ăn không khả dụng. 
              Combo sẽ tự động chuyển sang "Hết hàng" nếu có món ăn bị ngừng bán hoặc hết hàng.
            </Alert>
          )}

          {/* Hiển thị chi tiết món ăn có vấn đề khi ở chế độ tự động */}
          {!combo.manualAvailabilityOverride && getProblematicDishes().length > 0 && (
            <div className="mb-3">
              <strong>🔍 Món ăn có vấn đề:</strong>
              <ListGroup className="mt-2">
                {getProblematicDishes().map((dish, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-2">
                    <span>{dish.name}</span>
                    <Badge bg={dish.statusVariant}>{dish.statusText}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* Thống kê combo */}
          {getDishStatusDetails() && getDishStatusDetails()!.length > 0 && (
            <div className="mb-3">
              <div className="row text-center">
                <div className="col-4">
                  <div className="border rounded p-2 bg-light">
                    <div className="h5 mb-0 text-success">{getDishStatusDetails()!.filter(d => d.status === 'AVAILABLE').length}</div>
                    <small className="text-muted">Còn hàng</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-2 bg-light">
                    <div className="h5 mb-0 text-warning">{getDishStatusDetails()!.filter(d => d.status === 'OUT_OF_STOCK').length}</div>
                    <small className="text-muted">Hết hàng</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-2 bg-light">
                    <div className="h5 mb-0 text-danger">{getDishStatusDetails()!.filter(d => d.status === 'DISCONTINUED').length}</div>
                    <small className="text-muted">Ngừng bán</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hiển thị tất cả món ăn trong combo */}
          <div className="mb-3">
            <strong>📋 Tất cả món ăn trong combo:</strong>
            {getDishStatusDetails() && getDishStatusDetails()!.length > 0 ? (
              <ListGroup className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {getDishStatusDetails()!.map((dish, index) => (
                  <ListGroup.Item 
                    key={index} 
                    className={`d-flex justify-content-between align-items-center py-2 ${
                      dish.status !== 'AVAILABLE' ? 'bg-light' : ''
                    }`}
                  >
                    <div className="d-flex flex-column">
                      <span className={dish.status !== 'AVAILABLE' ? 'text-muted' : ''}>
                        {dish.name}
                      </span>
                      {!combo.manualAvailabilityOverride && (
                        <small className="text-muted">
                          {dish.status === 'AVAILABLE' ? '✅ Khả dụng' : 
                           dish.status === 'OUT_OF_STOCK' ? '⚠️ Hết hàng' : '❌ Ngừng bán'}
                        </small>
                      )}
                    </div>
                    <Badge bg={dish.statusVariant}>{dish.statusText}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="mt-2 text-muted">
                <em>Không có thông tin món ăn trong combo</em>
              </div>
            )}
          </div>
          
          {/* Thông báo khi ở chế độ thủ công */}
          {combo.manualAvailabilityOverride && (
            <Alert variant="info" className="mb-3">
              <strong>ℹ️ Thông báo:</strong> Combo này đang ở chế độ thủ công. 
              Trạng thái sẽ không bị thay đổi tự động dựa trên món ăn.
            </Alert>
          )}
          
          {/* Hiển thị form chỉnh sửa khi:
              1. Ở chế độ thủ công, HOẶC
              2. Ở chế độ tự động nhưng combo đang "Còn hàng" và tất cả món ăn đều còn hàng */}
          {(combo.manualAvailabilityOverride || 
            (!combo.manualAvailabilityOverride && 
             combo.availabilityStatus === ItemAvailabilityStatus.AVAILABLE && 
             getDishStatusDetails()?.every(dish => dish.status === ItemAvailabilityStatus.AVAILABLE))) && (
            <Form.Group>
              <Form.Label>Chọn trạng thái mới</Form.Label>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ItemAvailabilityStatus)}
              >
                {/* Chỉ cho phép thay đổi từ "Còn hàng" sang "Hết hàng" hoặc "Ngừng bán" */}
                {combo.availabilityStatus === ItemAvailabilityStatus.AVAILABLE ? (
                  [
                    { v: ItemAvailabilityStatus.AVAILABLE, l: 'Còn hàng' },
                    { v: ItemAvailabilityStatus.OUT_OF_STOCK, l: 'Hết hàng' },
                    { v: ItemAvailabilityStatus.DISCONTINUED, l: 'Ngừng bán' },
                  ].map(s => (
                    <option key={s.v} value={s.v}>{s.l}</option>
                  ))
                ) : (
                  /* Nếu đã hết hàng hoặc ngừng bán, chỉ cho phép giữ nguyên */
                  [
                    { v: combo.availabilityStatus, l: combo.availabilityStatus === ItemAvailabilityStatus.OUT_OF_STOCK ? 'Hết hàng' : 'Ngừng bán' },
                  ].map(s => (
                    <option key={s.v} value={s.v}>{s.l}</option>
                  ))
                )}
              </Form.Select>
            </Form.Group>
          )}

          {/* Hiển thị thông báo khi ở chế độ tự động */}
          {!combo.manualAvailabilityOverride && (
            <Alert variant="info" className="mb-3">
              <strong>ℹ️ Thông báo:</strong> Combo này đang ở chế độ tự động. 
              Trạng thái sẽ được cập nhật tự động dựa trên món ăn trong combo.
              <br />
              {combo.availabilityStatus === ItemAvailabilityStatus.AVAILABLE && 
               getDishStatusDetails()?.every(dish => dish.status === ItemAvailabilityStatus.AVAILABLE) ? (
                <strong>Bạn có thể chỉnh sửa trạng thái combo khi tất cả món ăn đều còn hàng.</strong>
              ) : (
                <strong>Để chỉnh sửa trạng thái thủ công, hãy thay đổi trạng thái combo trước.</strong>
              )}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Đóng</Button>
          {combo.manualAvailabilityOverride && (
            <Button 
              variant="outline-warning" 
              onClick={handleResetToAutomatic}
              disabled={isResetting}
            >
              {isResetting ? 'Đang reset...' : 'Reset về tự động'}
            </Button>
          )}
          {/* Hiển thị nút "Lưu thay đổi" khi có thể chỉnh sửa */}
          {(combo.manualAvailabilityOverride || 
            (!combo.manualAvailabilityOverride && 
             combo.availabilityStatus === ItemAvailabilityStatus.AVAILABLE && 
             getDishStatusDetails()?.every(dish => dish.status === ItemAvailabilityStatus.AVAILABLE))) && (
            <Button variant="primary" type="submit">Lưu thay đổi</Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 