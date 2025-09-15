import { useState, useEffect } from "react";
import { useCombos } from "../hooks/useCombos";
import { useDebounce } from "../hooks/useDebounce";
import { ComboModal } from "../components/combos/ComboModal";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { ComboStatusModal } from "../components/combos/ComboStatusModal";
import type { ComboRequestDTO, ComboResponseDTO } from "../interfaces";
import { Button, Table, Spinner, Row, Col, Form, Badge, Pagination } from "react-bootstrap";
import { ComboService } from "../services/ComboService";
import { toast } from "react-toastify";
import { getApprovalStatusLabel, getApprovalStatusVariant } from "../utils/status";
import { useAuth } from "../hooks/useAuth";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { SafeImage } from "../components/shared/SafeImage";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function ComboListPage() {
  const { comboPage, loading, currentPage, setCurrentPage, pageSize, fetchCombos, handleCreate, handleUpdate, handleDelete, handleUpdateAvailabilityStatus } =
    useCombos();
  const { role, user } = useAuth();
  const isAdmin = role === "ROLE_ADMIN";
  const userBranchId = user?.branchId;

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Detect current mode based on URL
  const isCreateMode = location.pathname.endsWith('/create');
  const isEditMode = location.pathname.includes('/edit') && params.id;
  const isListMode = !isCreateMode && !isEditMode;

  // Load combo data for edit mode
  useEffect(() => {
    if (isEditMode && params.id) {
      // Load combo data for editing
      ComboService.getById(Number(params.id))
        .then(combo => setEditingCombo(combo))
        .catch(error => {
          console.error('Error loading combo:', error);
          // Navigate back if combo not found
          navigate(-1);
        });
    }
  }, [isEditMode, params.id, navigate]);

  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboResponseDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<ComboResponseDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // Không filter theo status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [comboToUpdateStatus, setComboToUpdateStatus] = useState<ComboResponseDTO | null>(null);
  // Logic operational đã bị xóa

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilterStatus = useDebounce(filterStatus, 300);

  useEffect(() => {
    fetchCombos({
      name: debouncedSearchTerm,
      status: debouncedFilterStatus || undefined, // Chỉ gửi status nếu có giá trị
        // Backend sẽ tự động filter theo branch của manager
      page: currentPage,
    });
  }, [debouncedSearchTerm, debouncedFilterStatus, role, currentPage, fetchCombos]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, debouncedFilterStatus, setCurrentPage]);

  const handleOpenCreateModal = () => {
    // Chuyển hướng đến trang tạo mới thay vì mở modal
    console.log('Combo Create - Button clicked!');
    console.log('Combo Create - Current role:', role);
    console.log('Combo Create - User:', user);
    const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
    const path = `${basePath}/combos/create`;
    console.log('Combo Create - Navigating to:', path);
    try {
        navigate(path);
        console.log('Combo Create - Navigation successful');
    } catch (error) {
        console.error('Combo Create - Navigation error:', error);
    }
  };

  const handleOpenEditModal = (combo: ComboResponseDTO) => {
    // Chuyển hướng đến trang sửa thay vì mở modal
    console.log('Combo Edit - Button clicked!');
    console.log('Combo Edit - Current role:', role);
    console.log('Combo Edit - Combo data:', combo);
    const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
    const path = `${basePath}/combos/${combo.id}/edit`;
    console.log('Combo Edit - Navigating to:', path);
    try {
      navigate(path);
      console.log('Combo Edit - Navigation successful');
    } catch (error) {
      console.error('Combo Edit - Navigation error:', error);
    }
  };

  const handleModalSubmit = async (data: ComboRequestDTO, image?: File) => {
    if (editingCombo) {
      await handleUpdate(editingCombo.id, data, image);
    } else {
      await handleCreate(data, image);
    }
  };

  const handleOpenConfirmDeleteModal = async (combo: ComboResponseDTO) => {
    try {
      const res = await ComboService.getDeletability(combo.id.toString());
      if (!res.deletable) {
        const reasonText = res.reasons.map(r => `${r.type}: ${r.count}`).join(', ');
        toast.warn(`Không thể xóa combo này. Đang có liên kết: ${reasonText}`);
        return;
      }
      setComboToDelete(combo);
      setShowConfirmModal(true);
    } catch {
      setComboToDelete(combo);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (comboToDelete) {
      handleDelete(comboToDelete.id);
    }
    setShowConfirmModal(false);
    setComboToDelete(null);
    // Reload list after delete
    fetchCombos({ name: debouncedSearchTerm, status: debouncedFilterStatus, page: currentPage });
  };

  const handleOpenStatusModal = (combo: ComboResponseDTO) => {
    setComboToUpdateStatus(combo);
    setShowStatusModal(true);
  };

  const handleOpenOperationalModal = async (combo: ComboResponseDTO) => {
    console.log('handleOpenOperationalModal - combo data:', combo);
    console.log('handleOpenOperationalModal - comboDishes:', combo.comboDishes);
    
    // Nếu combo không có đầy đủ thông tin comboDishes, gọi API để lấy chi tiết
    if (!combo.comboDishes || combo.comboDishes.length === 0) {
      try {
        console.log('Fetching detailed combo data for ID:', combo.id);
        const detailedCombo = await ComboService.getById(combo.id);
        console.log('Detailed combo data:', detailedCombo);
        setComboToUpdateStatus(detailedCombo);
      } catch (error) {
        console.error('Error fetching detailed combo:', error);
        setComboToUpdateStatus(combo); // Fallback to original combo
      }
    } else {
      setComboToUpdateStatus(combo);
    }
    
    setShowStatusModal(true);
  };

  // updateOperational đã bị xóa, không còn cần thiết

  const combos = comboPage?.content || [];

  // Only show list mode - create/edit are handled by separate pages

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Quản lý Combo</h1>
        {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && (
          <Button onClick={handleOpenCreateModal}>
            <FaPlus className="me-2" /> Thêm mới
          </Button>
        )}
      </div>

      <Row className="mb-3 g-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm theo tên combo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
            <option value="">Tất cả trạng thái</option>
          </Form.Select>
        </Col>
        {/* Bỏ chọn số dòng/trang để đồng bộ với Category */}
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Hình ảnh</th>
            <th>Tên Combo</th>
            <th>Giá</th>
            <th>Mô tả</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center">
                <Spinner animation="border" size="sm" /> Đang tải...
              </td>
            </tr>
          ) : combos.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                Không tìm thấy combo nào.
              </td>
            </tr>
          ) : (
            combos.map((combo: ComboResponseDTO) => (
              <tr key={combo.id}>
                <td>{combo.id}</td>
                <td className="text-center">
                  {combo.image ? (
                    <SafeImage
                      src={combo.image}
                      alt={combo.name}
                      rounded
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                      showSpinner={false}
                    />
                  ) : (
                    <span className="text-muted">Không có ảnh</span>
                  )}
                </td>
                <td>{combo.name}</td>
                <td>{typeof combo.basePrice === "number" ? combo.basePrice.toLocaleString("vi-VN") + " ₫" : "N/A"}</td>
                <td className="text-truncate" style={{ maxWidth: 260 }}>
                  {combo.description}
                </td>
                <td className="text-center">
                  <div className="d-flex flex-column align-items-center gap-1">
                    <Badge 
                      bg={combo.availabilityStatus === 'AVAILABLE' ? 'success' : combo.availabilityStatus === 'OUT_OF_STOCK' ? 'warning' : 'danger'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleOpenOperationalModal(combo)}
                      className="px-3 py-2"
                    >
                      {combo.availabilityStatus === 'AVAILABLE' ? 'Còn hàng' : combo.availabilityStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Ngừng bán'}
                    </Badge>
                    <Badge 
                      bg={combo.manualAvailabilityOverride ? 'warning' : 'info'}
                      style={{ fontSize: '0.7em' }}
                    >
                      {combo.manualAvailabilityOverride ? 'Thủ công' : 'Tự động'}
                    </Badge>
                  </div>
                </td>
                <td className="text-center">
                  {(isAdmin || role === 'ROLE_MANAGER') && (
                    <Button variant="warning" size="sm" onClick={() => handleOpenEditModal(combo)} className="me-2">
                      <FaEdit />
                    </Button>
                  )}
                  {(isAdmin || role === 'ROLE_MANAGER') && (combo as any).inUse !== true && (
                    <Button variant="danger" size="sm" onClick={() => handleOpenConfirmDeleteModal(combo)}>
                      <FaTrash />
                    </Button>
                  )}
                  {/* Nút chỉnh sửa trạng thái đã được chuyển vào badge */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination - Đồng bộ với backend (0-based) */}
      {comboPage && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(0)} 
              disabled={currentPage === 0}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(currentPage - 1)} 
              disabled={currentPage === 0}
            />
            
            {/* Hiển thị số trang (0-based -> 1-based cho UI) */}
            {Array.from({ length: comboPage.totalPages }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={currentPage === comboPage.totalPages - 1}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(comboPage.totalPages - 1)} 
              disabled={currentPage === comboPage.totalPages - 1}
            />
          </Pagination>
        </div>
      )}

      <ComboModal show={showModal} onHide={() => setShowModal(false)} onSubmit={handleModalSubmit} comboToEdit={editingCombo} />

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Combo"
        message={`Bạn có chắc chắn muốn xóa combo "${comboToDelete?.name}" không?`}
        requiresConfirmation={true}
      />

      <ComboStatusModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        onSubmit={handleUpdateAvailabilityStatus}
        onReset={() => fetchCombos({ name: debouncedSearchTerm, status: debouncedFilterStatus, page: currentPage })}
        combo={comboToUpdateStatus}
      />

      {/* Modal operational đã bị xóa */}
    </div>
  );
}
