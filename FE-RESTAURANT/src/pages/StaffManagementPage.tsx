import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner, Pagination } from 'react-bootstrap';
import { 
  FaUserTie, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaLock, 
  FaUnlock, 
  FaSearch,
  FaFilter,
  FaStore,
  FaUserPlus,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserManagementService, { type User, type UserCreateRequest, type UserUpdateRequest, type PaginatedResponse } from '../services/UserManagementService';
import { toast } from 'react-toastify';

const StaffManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<string>('ACTIVE');
  const [branches, setBranches] = useState<Array<{id: number, name: string}>>([]);
  
  // Form states
  const [formData, setFormData] = useState<UserCreateRequest>({
    username: '',
    email: '',
    name: '',
    phone: '',
    password: '',
    roleName: 'ROLE_STAFF',
    branchId: user?.branchId || undefined
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Load staff based on user role with pagination
  const loadStaff = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true);
      
      let response: PaginatedResponse<User>;
      
      if (user?.role === 'ROLE_ADMIN') {
        // Admin: lấy tất cả manager và staff
        response = await UserManagementService.getAllStaff({ page, size, sort: 'id', direction: 'DESC' });
      } else if (user?.role === 'ROLE_MANAGER' && user?.branchId) {
        // Manager: chỉ lấy nhân viên của chi nhánh
        response = await UserManagementService.getBranchStaff(user.branchId, { page, size, sort: 'id', direction: 'DESC' });
      } else {
        toast.error('Bạn không có quyền truy cập trang này');
        return;
      }
      
      // Safety check: ensure content is an array
      const staffData = Array.isArray(response.content) ? response.content : [];
      setStaff(staffData);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(response.number || 0);
    } catch (error) {
      console.error('❌ Error loading staff:', error);
      toast.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  // Load branches
  const loadBranches = async () => {
    try {
      const branchesData = await UserManagementService.getBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error('❌ Error loading branches:', error);
      toast.error('Lỗi khi tải danh sách chi nhánh');
    }
  };

  useEffect(() => {
    loadStaff();
    loadBranches();
  }, [user]);

  // Debug log để xem staff data

  // Filter staff - chỉ hiển thị ROLE_MANAGER và ROLE_STAFF, ẩn ROLE_ADMIN
  const filteredStaff = (Array.isArray(staff) ? staff : []).filter(staffMember => {
    // Ẩn hoàn toàn ROLE_ADMIN
    if (staffMember.roles.includes('ROLE_ADMIN')) {
      return false;
    }
    
    // Nếu user là manager, chỉ hiển thị ROLE_STAFF (ẩn ROLE_MANAGER)
    if (user?.role === 'ROLE_MANAGER') {
      if (staffMember.roles.includes('ROLE_MANAGER')) {
        return false;
      }
    }
    
    // Chỉ hiển thị ROLE_MANAGER và ROLE_STAFF
    const isStaff = staffMember.roles.includes('ROLE_MANAGER') || staffMember.roles.includes('ROLE_STAFF');
    
    const matchesSearch = 
      staffMember.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staffMember.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || staffMember.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || staffMember.status === statusFilter;
    
    return isStaff && matchesSearch && matchesRole && matchesStatus;
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadStaff(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    loadStaff(0, size);
  };


  // Handle update staff
  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      setSubmitting(true);
      
      const updateData: UserUpdateRequest = {
        name: formData.name,
        phone: formData.phone,
        roleName: formData.roleName,
        branchId: formData.branchId
      };
      
      await UserManagementService.updateUser(selectedStaff.id, updateData);
      toast.success('Cập nhật nhân viên thành công');
      setShowEditModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (error) {
      console.error('❌ Error updating staff:', error);
      toast.error('Lỗi khi cập nhật nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      setSubmitting(true);
      
      await UserManagementService.deleteUser(selectedStaff.id);
      toast.success('Xóa nhân viên thành công');
      setShowDeleteModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (error) {
      console.error('❌ Error deleting staff:', error);
      toast.error('Lỗi khi xóa nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (staffMember: User) => {
    try {
      const newStatus = staffMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await UserManagementService.toggleUserStatus(staffMember.id, newStatus);
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} nhân viên`);
      loadStaff();
    } catch (error) {
      console.error('❌ Error toggling staff status:', error);
      toast.error('Lỗi khi thay đổi trạng thái nhân viên');
    }
  };

  // Open edit modal
  const openEditModal = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setFormData({
      username: staffMember.username,
      email: staffMember.email,
      name: staffMember.name || '',
      phone: staffMember.phone || '',
      password: '',
      roleName: staffMember.roles[0] as 'ROLE_STAFF' | 'ROLE_MANAGER',
      branchId: staffMember.branchId
    });
    setShowEditModal(true);
  };

  // Handle change role
  const handleChangeRole = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setShowRoleModal(true);
  };

  // Handle change branch
  const handleChangeBranch = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setShowBranchModal(true);
  };

  // Handle change status
  const handleChangeStatus = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setNewStatus(staffMember.status);
    setShowStatusModal(true);
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedStaff) return;
    
    try {
      setSubmitting(true);
      await UserManagementService.updateUserStatus(selectedStaff.id, newStatus);
      
      // Reload data to get updated information from server
      await loadStaff();
      
      toast.success('Trạng thái đã được cập nhật');
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setSubmitting(false);
    }
  };

  // Get role badge
  const getRoleBadge = (roles: string[]) => {
    const roleConfig = {
      'ROLE_MANAGER': { variant: 'warning', text: 'Manager' },
      'ROLE_STAFF': { variant: 'info', text: 'Staff' }
    };
    
    // Lấy role đầu tiên (thường chỉ có 1 role)
    const primaryRole = roles[0] || 'ROLE_STAFF';
    const config = roleConfig[primaryRole as keyof typeof roleConfig] || { variant: 'secondary', text: primaryRole };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { variant: 'success', text: 'Hoạt động' },
      'INACTIVE': { variant: 'warning', text: 'Chưa kích hoạt' },
      'LOCKED': { variant: 'danger', text: 'Khóa' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Check if user can access this page
  if (!user || !['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user.role)) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Bạn không có quyền truy cập trang này.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <h4 className="mb-0">
                    <FaUserTie className="me-2" />
                    Quản lý nhân viên
                  </h4>
                  <small className="text-muted">
                    {user.role === 'ROLE_ADMIN' ? 'Tất cả nhân viên' : `Nhân viên chi nhánh ${user.branchId}`} • Tổng {staff.length} nhân viên
                  </small>
                </Col>
                <Col md={6} className="text-end">
                  <Button 
                    variant="primary"
                    onClick={() => navigate(user?.role === 'ROLE_ADMIN' ? '/admin/staff/create' : '/manager/staff/create')}
                  >
                    <FaUserPlus className="me-1" />
                    Thêm nhân viên
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col md={3}>
          <Form.Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            {user?.role === 'ROLE_ADMIN' && (
              <option value="ROLE_MANAGER">Manager</option>
            )}
            <option value="ROLE_STAFF">Staff</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Chưa kích hoạt</option>
            <option value="LOCKED">Khóa</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-primary" 
            onClick={() => loadStaff()}
            disabled={loading}
          >
            <FaFilter className="me-1" />
            Làm mới
          </Button>
        </Col>
      </Row>

      {/* Staff Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Đang tải danh sách nhân viên...</p>
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-4">
                  <FaUserTie size={48} className="text-muted mb-3" />
                  <h5>Không có nhân viên nào</h5>
                  <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc thêm nhân viên mới</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Họ tên</th>
                      <th>Vai trò</th>
                      <th>Chi nhánh</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staffMember) => (
                      <tr key={staffMember.id}>
                        <td>{staffMember.id}</td>
                        <td>
                          <strong>{staffMember.username}</strong>
                        </td>
                        <td>{staffMember.email}</td>
                        <td>{staffMember.name || 'Chưa cập nhật'}</td>
                        <td>{getRoleBadge(staffMember.roles)}</td>
                        <td>
                          <div>
                            <Badge bg="secondary" className="mb-1">
                              <FaStore className="me-1" />
                              {staffMember.branchName || `Chi nhánh ${staffMember.branchId}`}
                            </Badge>
                            {staffMember.branchAddress && (
                              <div className="text-muted small">
                                📍 {staffMember.branchAddress}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{getStatusBadge(staffMember.status)}</td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleChangeRole(staffMember)}
                              title="Thay đổi vai trò"
                              className="px-2 py-1"
                            >
                              <FaUserTie className="me-1" />
                              Vai trò
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleChangeBranch(staffMember)}
                              title="Thay đổi chi nhánh"
                              className="px-2 py-1"
                            >
                              <FaStore className="me-1" />
                              Chi nhánh
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleChangeStatus(staffMember)}
                              title="Thay đổi trạng thái"
                              className="px-2 py-1"
                            >
                              <FaUnlock className="me-1" />
                              Trạng thái
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            
            {/* Pagination */}
            {(() => {
              console.log('🔍 Pagination Debug:', { totalElements, totalPages, currentPage, pageSize, staffLength: staff.length });
              return null;
            })()}
            {(totalElements > 0 || staff.length > 0) && (
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
                  {[...Array(Math.max(totalPages, 1)).keys()].map((pageNumber) => (
                    <Pagination.Item key={pageNumber} active={pageNumber === currentPage} onClick={() => handlePageChange(pageNumber)}>
                      {pageNumber + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.max(totalPages, 1) - 1} />
                  <Pagination.Last onClick={() => handlePageChange(Math.max(totalPages, 1) - 1)} disabled={currentPage === Math.max(totalPages, 1) - 1} />
                </Pagination>
              </div>
            )}
          </Card>
        </Col>
      </Row>


      {/* Edit Staff Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.username}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vai trò *</Form.Label>
                  <Form.Select
                    value={formData.roleName}
                    onChange={(e) => setFormData({...formData, roleName: e.target.value as any})}
                  >
                    <option value="ROLE_STAFF">Staff</option>
                    {user?.role === 'ROLE_ADMIN' && (
                      <option value="ROLE_MANAGER">Manager</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              {user?.role === 'ROLE_ADMIN' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chi nhánh *</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.branchId || ''}
                      onChange={(e) => setFormData({...formData, branchId: Number(e.target.value)})}
                      placeholder="Nhập ID chi nhánh"
                      required
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStaff}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Staff Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{selectedStaff?.username}</strong>?</p>
          <Alert variant="warning">
            Hành động này không thể hoàn tác!
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteStaff}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xóa...
              </>
            ) : (
              'Xóa'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi vai trò</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Thay đổi vai trò cho nhân viên <strong>{selectedStaff?.username}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Vai trò mới</Form.Label>
            <Form.Select
              value={selectedStaff?.roles[0] || 'ROLE_STAFF'}
              onChange={(e) => {
                if (selectedStaff) {
                  setSelectedStaff({
                    ...selectedStaff,
                    roles: [e.target.value]
                  });
                }
              }}
            >
              <option value="ROLE_STAFF">Nhân viên</option>
              {user?.role === 'ROLE_ADMIN' && (
                <option value="ROLE_MANAGER">Quản lý</option>
              )}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={async () => {
              if (!selectedStaff) return;
              
              try {
                setSubmitting(true);
                // Call actual API to change role
                await UserManagementService.updateUserRole(selectedStaff.id, selectedStaff.roles[0]);
                
                // Reload data to get updated information from server
                await loadStaff();
                
                toast.success('Vai trò đã được cập nhật');
                setShowRoleModal(false);
              } catch (error) {
                console.error('Error updating role:', error);
                toast.error('Lỗi khi cập nhật vai trò');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Branch Modal */}
      <Modal show={showBranchModal} onHide={() => setShowBranchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi chi nhánh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Thay đổi chi nhánh cho nhân viên <strong>{selectedStaff?.username}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Chi nhánh mới</Form.Label>
            <Form.Select
              value={selectedStaff?.branchId || ''}
              onChange={(e) => {
                if (selectedStaff) {
                  setSelectedStaff({
                    ...selectedStaff,
                    branchId: parseInt(e.target.value)
                  });
                }
              }}
            >
              <option value="">Không có chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBranchModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={async () => {
              if (!selectedStaff) return;
              
              try {
                setSubmitting(true);
                // Call actual API to change branch
                await UserManagementService.updateUserBranch(selectedStaff.id, selectedStaff.branchId);
                
                // Reload data to get updated information from server
                await loadStaff();
                
                toast.success('Chi nhánh đã được cập nhật');
                setShowBranchModal(false);
              } catch (error) {
                console.error('Error updating branch:', error);
                toast.error('Lỗi khi cập nhật chi nhánh');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUnlock className="me-2" />
            Thay đổi trạng thái tài khoản
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <p className="mb-0">Thay đổi trạng thái của tài khoản</p>
            <h5 className="text-primary">{selectedStaff?.name || selectedStaff?.username}</h5>
            <small className="text-muted">ID: {selectedStaff?.id}</small>
          </div>
          <Form.Group>
            <Form.Label>Trạng thái mới</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
              <option value="LOCKED">Khóa</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStatusChange}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffManagementPage;
