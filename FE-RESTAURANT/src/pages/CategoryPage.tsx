import { useState, useEffect, useMemo } from "react";
import { useCategories } from "../hooks/useCategories";
import { useDebounce } from "../hooks/useDebounce";
import CategoryModal from "../components/categories/CategoryModal";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import CategoryOperationalModal from "../components/categories/CategoryOperationalModal";
import { type CategoryResponseDTO, type CategoryRequestDTO } from "../interfaces";
import { CategoryStatus, getCategoryStatusDisplayName, getCategoryStatusColor } from "../interfaces/enums/CategoryStatus";
import { Button, Form, Spinner, Table, Row, Col, Alert, OverlayTrigger, Tooltip, Badge, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { CategoryService } from "../services/CategoryService";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function CategoryPage() {
  const { categoryPage, loading, error, setParams, createCategory, updateCategory, deleteCategory } = useCategories({
    page: 0,
    size: 10,
  });

  const { user } = useAuth();
  const role = user?.role || 'ROLE_USER';
  const userBranchId = user?.branchId;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Detect current mode based on URL
  const isCreateMode = location.pathname.endsWith('/create');
  const isEditMode = location.pathname.includes('/edit') && params.id;
  const isListMode = !isCreateMode && !isEditMode;

  // Load category data for edit mode
  useEffect(() => {
    if (isEditMode && params.id) {
      // Load category data for editing
      CategoryService.getById(params.id)
        .then(category => setEditingCategory(category))
        .catch(error => {
          console.error('Error loading category:', error);
          // Navigate back if category not found
          navigate(-1);
        });
    }
  }, [isEditMode, params.id, navigate]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponseDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponseDTO | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [categoryToUpdateStatus, setCategoryToUpdateStatus] = useState<CategoryResponseDTO | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ Sửa lại useEffect: Cập nhật params khi filter thay đổi
  useEffect(() => {
    const isManager = role === 'ROLE_MANAGER';

    setParams((prevParams) => ({
      ...prevParams,
      page: 0, // Reset về trang đầu khi thay đổi filter
      name: debouncedSearchTerm,
      // Backend sẽ tự động filter theo branch của manager
      // Không filter theo status - hiển thị tất cả categories
    }));
  }, [debouncedSearchTerm, role]);

  const handleOpenCreateModal = () => {
    // Chuyển hướng đến trang tạo mới thay vì mở modal
    const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
    const path = `${basePath}/categories/create`;
    console.log('Category Create - Navigating to:', path);
    navigate(path);
  };

  const handleOpenEditModal = (category: CategoryResponseDTO) => {
    // Chuyển hướng đến trang sửa thay vì mở modal
    const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
    const path = `${basePath}/categories/${category.id}/edit`;
    console.log('Category Edit - Navigating to:', path, 'Category:', category);
    navigate(path);
  };

  // ✅ Tối ưu hóa: Chỉ đóng modal khi submit thành công
  const handleModalSubmit = async (categoryData: CategoryRequestDTO) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      setShowModal(false);
    } catch (e) {
      // Lỗi đã được toast tự động, component không cần làm gì thêm
    }
  };

  const handleOpenConfirmDeleteModal = async (category: CategoryResponseDTO) => {
    try {
      const res = await (await import('../services/CategoryService')).CategoryService.getDeletability(category.id.toString());
      if (!res.deletable) {
        // Nếu không thể xóa, hiển thị lý do và không mở modal
        const reasonText = res.reasons.map(r => `${r.type}: ${r.count}`).join(', ');
        alert(`Không thể xóa danh mục này. Đang có liên kết: ${reasonText}`);
        return;
      }
      setCategoryToDelete(category);
      setShowConfirmModal(true);
    } catch (e) {
      // Nếu API không khả dụng, vẫn fallback mở modal để BE kiểm tra lần cuối khi xóa
      setCategoryToDelete(category);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
    }
    setShowConfirmModal(false);
    // Reload after delete
    setParams(p => ({ ...p }));
  };

  const handleOpenStatusModal = (category: CategoryResponseDTO) => {
    setCategoryToUpdateStatus(category);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (id: string, status: CategoryStatus) => {
    try {
      await CategoryService.updateStatus(id, status);
      // Reload data after update
      setParams(p => ({ ...p }));
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  // Lấy ra thông tin từ page object để render
  const categories = categoryPage?.content || [];
  const currentPage = categoryPage?.number ?? 0;
  const totalPages = categoryPage?.totalPages ?? 0;

  // Map kiểm tra khả năng xóa để ẩn nút xóa khi có liên kết
  const [deletabilityMap, setDeletabilityMap] = useState<Record<string, boolean>>({});

  const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role]);

  useEffect(() => {
    const loadDeletability = async () => {
      try {
        const entries = await Promise.all(
          categories.map(async (c) => {
            try {
              const res = await CategoryService.getDeletability(c.id.toString());
              return [c.id.toString(), res.deletable] as const;
            } catch {
              // Nếu lỗi, để true để không chặn UX; BE vẫn chặn khi DELETE
              return [c.id.toString(), true] as const;
            }
          })
        );
        setDeletabilityMap(Object.fromEntries(entries));
      } catch {
        // ignore
      }
    };
    if (!isAdmin) {
      // Manager không cần gọi API deletability
      setDeletabilityMap({});
      return;
    }
    if (categories.length > 0) {
      loadDeletability();
    } else {
      setDeletabilityMap({});
    }
  }, [categories, isAdmin]);

  // Only show list mode - create/edit are handled by separate pages
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý Danh mục</h1>
        {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && (
          <Button onClick={handleOpenCreateModal}>
            <FaPlus className="me-2" /> 
            Thêm mới
          </Button>
        )}
      </div>

      <Row className="mb-3 g-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        {/* Filter approval status đã được bỏ */}
      </Row>

      {error && (
        <Alert variant="danger" className="mt-3">
          Lỗi: {error}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">
                Không tìm thấy danh mục.
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  <Badge 
                    bg={category.operationalStatus === 'ACTIVE' ? 'success' : 'secondary'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenStatusModal(category)}
                  >
                    {getCategoryStatusDisplayName(category.status)}
                  </Badge>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-1">
                    {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Chỉnh sửa</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleOpenEditModal(category)}
                        >
                          <FaEdit />
                        </Button>
                      </OverlayTrigger>
                    )}
                    {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && category.inUse !== true && (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Xóa</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenConfirmDeleteModal(category)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination - Đồng bộ với backend (0-based) */}
      {categoryPage && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => setParams((p) => ({ ...p, page: 0 }))}
              disabled={currentPage === 0}
            />
            <Pagination.Prev
              onClick={() => setParams((p) => ({ ...p, page: currentPage - 1 }))}
              disabled={currentPage === 0}
            />

            {/* Hiển thị số trang (0-based -> 1-based cho UI) */}
            {Array.from({ length: categoryPage.totalPages }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setParams((p) => ({ ...p, page: i }))}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => setParams((p) => ({ ...p, page: currentPage + 1 }))}
              disabled={currentPage === categoryPage.totalPages - 1}
            />
            <Pagination.Last
              onClick={() => setParams((p) => ({ ...p, page: categoryPage.totalPages - 1 }))}
              disabled={currentPage === categoryPage.totalPages - 1}
            />
          </Pagination>
        </div>
      )}

      <CategoryModal show={showModal} onHide={() => setShowModal(false)} onSubmit={handleModalSubmit} categoryToEdit={editingCategory} />

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete?.name}" không?`}
      />

      <CategoryOperationalModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        category={categoryToUpdateStatus}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
}
