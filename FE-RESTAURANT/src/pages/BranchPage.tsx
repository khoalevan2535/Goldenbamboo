import { useState, useEffect } from "react";
import { useBranches } from "../hooks/useBranches";
import { BranchModal } from "../components/branches/BranchModal";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { BranchStatusModal } from "../components/branches/BranchStatusModal";
import { Button, Form, Spinner, Table, Pagination, Row, Col, Badge } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { type BranchResponseDTO } from "../interfaces/BranchResponseDTO";
import { type BranchRequestDTO } from "../interfaces/BranchRequestDTO";
import { BranchStatus, BranchStatusUtils } from "../interfaces/enums/BranchStatus";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { BranchMapModal } from "../components/branches/BranchMapModal";

export default function BranchPage() {
  const { role } = useAuth();
  const isAdmin = role === "ROLE_ADMIN";
  const { 
    branchPage, 
    loading, 
    fetchBranches, 
    createBranch, 
    updateBranch, 
    deleteBranch, 
    updateBranchStatus,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  } = useBranches();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchResponseDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [branchToUpdateStatus, setBranchToUpdateStatus] = useState<BranchResponseDTO | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<BranchResponseDTO | null>(null);

  // Debounce search term and status filter
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilterStatus = useDebounce(filterStatus, 300);

  useEffect(() => {
    fetchBranches({ 
      name: debouncedSearchTerm, 
      status: debouncedFilterStatus === "" ? undefined : debouncedFilterStatus 
    });
  }, [debouncedSearchTerm, debouncedFilterStatus, currentPage, fetchBranches]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, debouncedFilterStatus, setCurrentPage]);

  const refreshBranches = () => {
    fetchBranches({ 
      name: debouncedSearchTerm, 
      status: debouncedFilterStatus === "" ? undefined : debouncedFilterStatus 
    });
  };

  const handleOpenCreateModal = () => {
    // Chuyển hướng đến trang tạo mới thay vì mở modal
    navigate('/admin/branches/create');
  };

  const handleOpenEditModal = (branch: BranchResponseDTO) => {
    // Chuyển hướng đến trang sửa thay vì mở modal
    navigate(`/admin/branches/${branch.id}/edit`);
  };

  const handleOpenConfirmDeleteModal = (branch: BranchResponseDTO) => {
    setBranchToDelete(branch);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (branchToDelete) {
      try {
        await deleteBranch(Number(branchToDelete.id));
        setShowConfirmModal(false);
        setBranchToDelete(null);
        refreshBranches();
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };


  const handleModalSubmit = async (branchData: BranchRequestDTO) => {
    try {
      if (editingBranch) {
        await updateBranch(Number(editingBranch.id), branchData);
      } else {
        await createBranch(branchData);
      }
      setShowModal(false);
      refreshBranches();
    } catch (error) {
      // Error handling is done in the hook
    }
  };


  const handleOpenStatusModal = (branch: BranchResponseDTO) => {
    setBranchToUpdateStatus(branch);
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (id: number, status: BranchStatus) => {
    try {
      await updateBranchStatus(id, status);
      setShowStatusModal(false);
      setBranchToUpdateStatus(null);
      refreshBranches();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapAddress, setMapAddress] = useState<string>("");

  const handleOpenMapModal = (address: string) => {
    setMapAddress(address);
    setShowMapModal(true);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý Chi nhánh</h1>
        {isAdmin && (
          <Button onClick={handleOpenCreateModal}>
            <FaPlus className="me-2" /> Thêm mới
          </Button>
        )}
      </div>

      <Row className="mb-3 g-3">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên chi nhánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
                      <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value={BranchStatus.OPEN}>Mở cửa</option>
              <option value={BranchStatus.INACTIVE}>Dừng hoạt động</option>
              <option value={BranchStatus.MAINTENANCE}>Bảo trì</option>
              <option value={BranchStatus.CLOSED}>Đóng cửa vĩnh viễn</option>
            </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Chi nhánh</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center">
                <Spinner animation="border" size="sm" /> Đang tải...
              </td>
            </tr>
          ) : !branchPage?.content || branchPage.content.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                Không tìm thấy chi nhánh nào.
              </td>
            </tr>
          ) : (
            branchPage.content.map((branch) => (
              <tr key={branch.id}>
                <td>{branch.id}</td>
                <td>{branch.name}</td>
                <td>
                  {branch.address}
                  <Button
                    variant="info"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleOpenMapModal(branch.address)}
                  >
                    Xem vị trí
                  </Button>
                </td>
                <td>{branch.phone}</td>
                <td className="text-center">
                  <Badge 
                    bg={BranchStatusUtils.getStatusColor(branch.status)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenStatusModal(branch)}
                    className="px-3 py-2"
                  >
                    {BranchStatusUtils.getDisplayName(branch.status)}
                  </Badge>
                </td>
                <td className="text-center">
                  {isAdmin && (
                    <>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleOpenEditModal(branch)}>
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => handleOpenConfirmDeleteModal(branch)}
                        disabled={branch.isInUse}
                        title={branch.isInUse ? "Không thể xóa chi nhánh đang được sử dụng" : ""}
                      >
                        <FaTrash />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {branchPage && (branchPage.totalElements > 0 || branchPage.content?.length > 0) && (
        <div className="d-flex justify-content-center">
          <Pagination>
            <Pagination.First onClick={() => setCurrentPage(0)} disabled={branchPage.first} />
            <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={branchPage.first} />
            {[...Array(Math.max(branchPage.totalPages, 1)).keys()].map(pageNumber => (
              <Pagination.Item
                key={pageNumber}
                active={pageNumber === currentPage}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={branchPage.last} />
            <Pagination.Last onClick={() => setCurrentPage(Math.max(branchPage.totalPages, 1) - 1)} disabled={branchPage.last} />
          </Pagination>
        </div>
      )}

      <BranchModal show={showModal} onHide={() => setShowModal(false)} onSubmit={handleModalSubmit} branchToEdit={editingBranch} />

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Chi nhánh"
        message={`Bạn có chắc chắn muốn xóa chi nhánh "${branchToDelete?.name}" không?`}
      />

      <BranchStatusModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        onSubmit={handleStatusSubmit}
        branch={branchToUpdateStatus}
      />

      <BranchMapModal
        show={showMapModal}
        onHide={() => setShowMapModal(false)}
        address={mapAddress}
      />
    </div>
  );
}
