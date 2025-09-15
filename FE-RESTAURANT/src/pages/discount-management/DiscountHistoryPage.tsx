import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Table, Badge, Spinner, Alert, Card, Row, Col, Modal, Form } from 'react-bootstrap';
import { FaArrowLeft, FaTag, FaClock, FaEye, FaExclamationTriangle, FaEdit, FaTrash, FaSave, FaTimes, FaStop } from 'react-icons/fa';
import { discountService } from '../../services/DiscountService';
import { toast } from 'react-toastify';

// CSS cho animation
const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  .pulse-animation {
    animation: pulse 2s infinite;
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

interface DiscountHistory {
  id: number;
  code: string;
  name: string;
  newPrice: number;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  type?: 'BRANCH_DISCOUNT' | 'CUSTOMER_VOUCHER';
}

export default function DiscountHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [discounts, setDiscounts] = useState<DiscountHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // States cho edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountHistory | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    newPrice: 0,
    startDate: '',
    endDate: '',
    description: ''
  });
  
  // States cho delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState<DiscountHistory | null>(null);
  
  // States cho stop confirmation
  const [showStopModal, setShowStopModal] = useState(false);
  const [stoppingDiscount, setStoppingDiscount] = useState<DiscountHistory | null>(null);

  // Tự động detect base path từ current location
  const getBasePath = () => {
    if (location.pathname.startsWith('/manager/')) {
      return '/manager';
    } else if (location.pathname.startsWith('/admin/')) {
      return '/admin';
    }
    return '/admin'; // default
  };

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch tất cả discounts
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const response = await discountService.getAllDiscounts();
        console.log('Discounts API Response:', response); // Debug log
        
        // Xử lý response an toàn và filter chỉ BRANCH_DISCOUNT
        if (Array.isArray(response)) {
          // Chỉ hiển thị BRANCH_DISCOUNT, không hiển thị CUSTOMER_VOUCHER
          const branchDiscounts = response.filter(discount => 
            discount.type === 'BRANCH_DISCOUNT' || !discount.type // Backward compatibility
          );
          setDiscounts(branchDiscounts);
        } else {
          console.warn('Unexpected discounts response format:', response);
          setDiscounts([]);
        }
      } catch (error: any) {
        console.error('Error fetching discounts:', error);
        toast.error('Lỗi khi tải danh sách giảm giá: ' + (error?.response?.data?.message || error?.message));
        setDiscounts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  // Function tính thời gian còn lại
  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days} ngày ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Function format giá
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  // Function format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Function mở edit modal
  const handleEditDiscount = (discount: DiscountHistory) => {
    // Kiểm tra nghiệp vụ: chỉ cho phép sửa discount chưa bắt đầu hoặc đang hoạt động
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);
    
    if (discount.status === 'EXPIRED' || now > endDate) {
      toast.warning('Không thể sửa discount đã hết hạn');
      return;
    }
    
    if (discount.status === 'REPLACED') {
      toast.warning('Không thể sửa discount đã bị thay thế');
      return;
    }
    
    setEditingDiscount(discount);
    setEditFormData({
      name: discount.name,
      newPrice: discount.newPrice,
      startDate: discount.startDate.slice(0, 16), // Format cho datetime-local
      endDate: discount.endDate.slice(0, 16),
      description: discount.description || ''
    });
    setShowEditModal(true);
  };
  
  // Function lưu edit
  const handleSaveEdit = async () => {
    if (!editingDiscount) return;
    
    try {
      setLoading(true);
      
      // Validation
      if (!editFormData.name.trim()) {
        toast.error('Tên discount không được để trống');
        return;
      }
      
      if (editFormData.newPrice <= 0) {
        toast.error('Giá sau giảm phải lớn hơn 0');
        return;
      }
      
      const startDate = new Date(editFormData.startDate);
      const endDate = new Date(editFormData.endDate);
      
      if (startDate >= endDate) {
        toast.error('Ngày bắt đầu phải trước ngày kết thúc');
        return;
      }
      
      // Gọi API update
      await discountService.updateDiscount(editingDiscount.id, {
        name: editFormData.name,
        newPrice: editFormData.newPrice,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        description: editFormData.description,
        type: 'BRANCH_DISCOUNT' // Đảm bảo type đúng
      });
      
      toast.success('Cập nhật discount thành công');
      setShowEditModal(false);
      
      // Refresh danh sách
      const response = await discountService.getAllDiscounts();
      if (Array.isArray(response)) {
        const branchDiscounts = response.filter(discount => 
          discount.type === 'BRANCH_DISCOUNT' || !discount.type
        );
        setDiscounts(branchDiscounts);
      }
      
    } catch (error: any) {
      console.error('Error updating discount:', error);
      toast.error('Lỗi khi cập nhật discount: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Function mở delete confirmation
  const handleDeleteDiscount = (discount: DiscountHistory) => {
    // Kiểm tra nghiệp vụ: chỉ cho phép xóa discount chưa bắt đầu
    const now = new Date();
    const startDate = new Date(discount.startDate);
    
    // Chỉ cho phép xóa discount chưa bắt đầu
    if (now >= startDate) {
      toast.warning('Không thể xóa discount đã bắt đầu. Vui lòng sử dụng chức năng "Dừng" để thay đổi trạng thái.');
      return;
    }
    
    setDeletingDiscount(discount);
    setShowDeleteModal(true);
  };
  
  // Function xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!deletingDiscount) return;
    
    try {
      setLoading(true);
      
      await discountService.deleteDiscount(deletingDiscount.id);
      
      toast.success('Xóa discount thành công');
      setShowDeleteModal(false);
      
      // Refresh danh sách
      const response = await discountService.getAllDiscounts();
      if (Array.isArray(response)) {
        const branchDiscounts = response.filter(discount => 
          discount.type === 'BRANCH_DISCOUNT' || !discount.type
        );
        setDiscounts(branchDiscounts);
      }
      
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      toast.error('Lỗi khi xóa discount: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Function mở stop confirmation
  const handleStopDiscount = (discount: DiscountHistory) => {
    // Kiểm tra nghiệp vụ: chỉ cho phép dừng discount đã bắt đầu
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);
    
    // Chỉ cho phép dừng discount đã bắt đầu và chưa hết hạn
    if (now < startDate) {
      toast.warning('Discount chưa bắt đầu, không thể dừng. Vui lòng xóa discount này.');
      return;
    }
    
    if (now > endDate) {
      toast.warning('Discount đã hết hạn, không cần dừng.');
      return;
    }
    
    if (discount.status === 'INACTIVE') {
      toast.info('Discount đã được dừng rồi.');
      return;
    }
    
    setStoppingDiscount(discount);
    setShowStopModal(true);
  };
  
  // Function xác nhận dừng
  const handleConfirmStop = async () => {
    if (!stoppingDiscount) return;
    
    try {
      setLoading(true);
      
      // Dừng discount bằng cách cập nhật endDate về thời điểm hiện tại
      const now = new Date();
      await discountService.updateDiscount(stoppingDiscount.id, {
        name: stoppingDiscount.name,
        newPrice: stoppingDiscount.newPrice,
        startDate: stoppingDiscount.startDate,
        endDate: now.toISOString(), // Kết thúc ngay lập tức
        description: stoppingDiscount.description,
        type: 'BRANCH_DISCOUNT'
      });
      
      toast.success('Đã dừng discount thành công');
      setShowStopModal(false);
      
      // Refresh danh sách
      const response = await discountService.getAllDiscounts();
      if (Array.isArray(response)) {
        const branchDiscounts = response.filter(discount => 
          discount.type === 'BRANCH_DISCOUNT' || !discount.type
        );
        setDiscounts(branchDiscounts);
      }
      
    } catch (error: any) {
      console.error('Error stopping discount:', error);
      toast.error('Lỗi khi dừng discount: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setLoading(false);
    }
  };

  // Function lấy status badge
  const getStatusBadge = (discount: DiscountHistory) => {
    const now = currentTime;
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    // Xử lý status REPLACED trước
    if (discount.status === 'REPLACED') {
      return (
        <div>
          <Badge bg="secondary">Đã thay thế</Badge>
          <div className="small text-muted mt-1">
            <FaTag className="me-1" />
            Bị thay thế bởi discount mới
          </div>
        </div>
      );
    }

    // Xử lý status SCHEDULED
    if (discount.status === 'SCHEDULED' || now < startDate) {
      const timeToStart = getTimeRemaining(discount.startDate);
      return (
        <div>
          <Badge bg="info">Sắp bắt đầu</Badge>
          <div className="small text-info mt-1">
            <FaClock className="me-1" />
            Bắt đầu sau: {timeToStart}
          </div>
        </div>
      );
    }

    // Xử lý status EXPIRING
    if (discount.status === 'EXPIRING') {
      const timeRemaining = getTimeRemaining(discount.endDate);
      return (
        <div>
          <Badge bg="warning" className="pulse-animation">Sắp hết hạn</Badge>
          <div className="small text-warning mt-1">
            <FaClock className="me-1" />
            Còn lại: {timeRemaining}
          </div>
        </div>
      );
    }

    // Xử lý status EXPIRED
    if (discount.status === 'EXPIRED' || now > endDate) {
      return (
        <div>
          <Badge bg="danger">Đã hết hạn</Badge>
          <div className="small text-muted mt-1">
            <FaClock className="me-1" />
            Hết hạn: {formatDate(discount.endDate)}
          </div>
        </div>
      );
    }

    // Xử lý status ACTIVE
    if (discount.status === 'ACTIVE') {
      const timeRemaining = getTimeRemaining(discount.endDate);
      return (
        <div>
          <Badge bg="success">Đang áp dụng</Badge>
          <div className="small text-success mt-1">
            <FaClock className="me-1" />
            Còn lại: {timeRemaining}
          </div>
        </div>
      );
    }

    return <Badge bg="warning">Tạm dừng</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Đếm discount sắp hết hạn
  const expiringCount = discounts?.filter(d => d.status === 'EXPIRING').length || 0;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">
            <FaTag className="me-2" />
            Lịch sử giảm giá
          </h4>
          <p className="text-muted mb-0">Quản lý tất cả các chương trình giảm giá</p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(`${getBasePath()}/discounts`)}
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      {/* Cảnh báo discount sắp hết hạn */}
      {expiringCount > 0 && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Cảnh báo:</strong> Có {expiringCount} discount sắp hết hạn trong vòng 24 giờ tới. 
          Vui lòng kiểm tra và gia hạn nếu cần thiết.
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{discounts?.length || 0}</h5>
              <p className="mb-0">Tổng số discount</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">
                {discounts?.filter(d => d.status === 'ACTIVE').length || 0}
              </h5>
              <p className="mb-0">Đang hoạt động</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-info">
                {discounts?.filter(d => d.status === 'SCHEDULED').length || 0}
              </h5>
              <p className="mb-0">Sắp bắt đầu</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h5 className="text-warning">
                {discounts?.filter(d => d.status === 'EXPIRING').length || 0}
              </h5>
              <p className="mb-0">Sắp hết hạn</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-danger">
                {discounts?.filter(d => d.status === 'EXPIRED').length || 0}
              </h5>
              <p className="mb-0">Đã hết hạn</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-secondary">
                {discounts?.filter(d => d.status === 'REPLACED').length || 0}
              </h5>
              <p className="mb-0">Đã thay thế</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Mã discount</th>
                <th>Tên</th>
                <th>Giá sau giảm</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {!discounts || discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <p className="text-muted mb-0">Chưa có discount nào</p>
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id}>
                    <td>
                      <code>{discount.code}</code>
                    </td>
                    <td>
                      <div>
                        <strong>{discount.name}</strong>
                        {discount.description && (
                          <div className="small text-muted">{discount.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="text-success">
                        {formatPrice(discount.newPrice)}
                      </strong>
                    </td>
                    <td>
                      <div className="small">
                        <div><strong>Bắt đầu:</strong> {formatDate(discount.startDate)}</div>
                        <div><strong>Kết thúc:</strong> {formatDate(discount.endDate)}</div>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(discount)}
                    </td>
                    <td>
                      <div className="small text-muted">
                        {formatDate(discount.createdAt)}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            // Có thể thêm chức năng xem chi tiết
                            toast.info('Chức năng xem chi tiết đang phát triển');
                          }}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => handleEditDiscount(discount)}
                          title="Sửa discount"
                        >
                          <FaEdit />
                        </Button>
                        {/* Nút Dừng - chỉ hiển thị cho discount đã bắt đầu */}
                        {new Date() >= new Date(discount.startDate) && 
                         new Date() <= new Date(discount.endDate) && 
                         discount.status !== 'INACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => handleStopDiscount(discount)}
                            title="Dừng discount"
                          >
                            <FaStop />
                          </Button>
                        )}
                        {/* Nút Xóa - chỉ hiển thị cho discount chưa bắt đầu */}
                        {new Date() < new Date(discount.startDate) && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteDiscount(discount)}
                            title="Xóa discount"
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Sửa Discount
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên discount *</Form.Label>
              <Form.Control
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Nhập tên discount"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Giá sau giảm (₫) *</Form.Label>
              <Form.Control
                type="number"
                value={editFormData.newPrice}
                onChange={(e) => setEditFormData({...editFormData, newPrice: Number(e.target.value)})}
                placeholder="Nhập giá sau giảm"
                min="0"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Nhập mô tả discount (tùy chọn)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <FaTimes className="me-2" />
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrash className="me-2 text-danger" />
            Xác nhận xóa Discount
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </Alert>
          
          {deletingDiscount && (
            <div>
              <p>Bạn có chắc chắn muốn xóa discount này không?</p>
              <div className="bg-light p-3 rounded">
                <h6><strong>Tên:</strong> {deletingDiscount.name}</h6>
                <p className="mb-1"><strong>Mã:</strong> <code>{deletingDiscount.code}</code></p>
                <p className="mb-1"><strong>Giá sau giảm:</strong> {formatPrice(deletingDiscount.newPrice)}</p>
                <p className="mb-0"><strong>Trạng thái:</strong> {deletingDiscount.status}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <FaTimes className="me-2" />
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Xóa vĩnh viễn
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Stop Confirmation Modal */}
      <Modal show={showStopModal} onHide={() => setShowStopModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaStop className="me-2 text-secondary" />
            Xác nhận dừng Discount
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FaClock className="me-2" />
            <strong>Thông tin:</strong> Dừng discount sẽ thay đổi trạng thái thành "Tạm dừng"
          </Alert>
          
          {stoppingDiscount && (
            <div>
              <p>Bạn có chắc chắn muốn dừng discount này không?</p>
              <div className="bg-light p-3 rounded">
                <h6><strong>Tên:</strong> {stoppingDiscount.name}</h6>
                <p className="mb-1"><strong>Mã:</strong> <code>{stoppingDiscount.code}</code></p>
                <p className="mb-1"><strong>Giá sau giảm:</strong> {formatPrice(stoppingDiscount.newPrice)}</p>
                <p className="mb-1"><strong>Trạng thái hiện tại:</strong> {stoppingDiscount.status}</p>
                <p className="mb-0"><strong>Thời gian:</strong> {formatDate(stoppingDiscount.startDate)} - {formatDate(stoppingDiscount.endDate)}</p>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Lưu ý:</strong> Sau khi dừng, discount sẽ không còn áp dụng cho khách hàng nữa.
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStopModal(false)}>
            <FaTimes className="me-2" />
            Hủy
          </Button>
          <Button variant="secondary" onClick={handleConfirmStop} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang dừng...
              </>
            ) : (
              <>
                <FaStop className="me-2" />
                Dừng discount
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

