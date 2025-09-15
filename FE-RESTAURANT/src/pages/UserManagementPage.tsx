import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner, Tabs, Tab, Pagination } from 'react-bootstrap';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaLock, 
  FaUnlock, 
  FaSearch,
  FaFilter,
  FaEye,
  FaUserTie,
  FaStore
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import UserManagementService, { type User, type UserCreateRequest, type UserUpdateRequest } from '../services/UserManagementService';
import { toast } from 'react-toastify';

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeRole, setActiveRole] = useState<string>('ROLE_USER');
  
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<string>('ACTIVE');
  const [branches, setBranches] = useState<Array<{id: number, name: string}>>([]);
  
  // Form states
  const [formData, setFormData] = useState<UserCreateRequest>({
    username: '',
    email: '',
    name: '',
    phone: '',
    password: '', // Sẽ được set tự động
    roleName: 'ROLE_USER'
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Load users with pagination
  const loadUsers = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true);
      const response = await UserManagementService.getAllUsers({ page, size });
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response)) {
        setUsers(response);
        setTotalElements(response.length);
        setTotalPages(Math.ceil(response.length / pageSize));
      } else {
        const usersData = response?.content || [];
        setUsers(usersData);
        setTotalElements(response?.totalElements || 0);
        setTotalPages(response?.totalPages || 0);
        setCurrentPage(response?.number || 0);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
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
    loadUsers();
    loadBranches();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(page, pageSize);
  };


  // Count users by role (only USER role)
  const userOnlyUsers = (Array.isArray(users) ? users : []).filter(user => user.roles && user.roles.includes('ROLE_USER'));
  const countUsers = userOnlyUsers.length;
  const totalItems = totalElements;
  

  // Filter users - chỉ hiển thị ROLE_USER và ẩn ROLE_ADMIN
  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    // Ẩn hoàn toàn ROLE_ADMIN
    if (user.roles && user.roles.includes('ROLE_ADMIN')) {
      return false;
    }
    
    // Chỉ hiển thị ROLE_USER
    const isUser = user.roles && user.roles.includes('ROLE_USER');
    
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    
    return isUser && matchesSearch && matchesStatus;
  });


  // Handle update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      
      const updateData: UserUpdateRequest = {
        name: formData.name,
        phone: formData.phone,
        roleName: formData.roleName
      };
      
      await UserManagementService.updateUser(selectedUser.id, updateData);
      toast.success('Cập nhật người dùng thành công');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers(currentPage, pageSize);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      toast.error('Lỗi khi cập nhật người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      
      await UserManagementService.deleteUser(selectedUser.id);
      toast.success('Xóa người dùng thành công');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers(currentPage, pageSize);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await UserManagementService.toggleUserStatus(user.id, newStatus);
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
      loadUsers(currentPage, pageSize);
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      toast.error('Lỗi khi thay đổi trạng thái người dùng');
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      password: '',
      roleName: user.roles[0] as 'ROLE_USER' | 'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN'
    });
    setShowEditModal(true);
  };

  // Handle change role
  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  // Handle change branch
  const handleChangeBranch = (user: User) => {
    setSelectedUser(user);
    setShowBranchModal(true);
  };

  // Handle change status
  const handleChangeStatus = (user: User) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setShowStatusModal(true);
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      await UserManagementService.updateUserStatus(selectedUser.id, newStatus);
      
      // Reload data to get updated information from server
      await loadUsers(currentPage, pageSize);
      
      toast.success('Trạng thái đã được cập nhật');
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setSubmitting(false);
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return '👑';
      case 'ROLE_MANAGER':
        return '👔';
      case 'ROLE_STAFF':
        return '👤';
      case 'ROLE_USER':
        return '👥';
      default:
        return '👤';
    }
  };

  // Get role badge
  const getRoleBadge = (roles: string[]) => {
    const roleConfig = {
      'ROLE_ADMIN': { variant: 'danger', text: 'Admin' },
      'ROLE_MANAGER': { variant: 'warning', text: 'Manager' },
      'ROLE_STAFF': { variant: 'info', text: 'Staff' },
      'ROLE_USER': { variant: 'secondary', text: 'User' }
    };
    
    // Lấy role đầu tiên (thường chỉ có 1 role)
    const primaryRole = roles[0] || 'ROLE_USER';
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

  // Get branch info
  const getBranchInfo = (user: User) => {
    if (!user.branchId) {
      return <Badge bg="light" text="dark">Không có</Badge>;
    }
    
    return (
      <div>
        <div className="fw-bold text-primary">
          {user.branchName || `Chi nhánh ${user.branchId}`}
        </div>
        {user.branchAddress && (
          <div className="text-muted small">
            📍 {user.branchAddress}
          </div>
        )}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!user || user.role !== 'ROLE_ADMIN') {
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
                  <h4 className="mb-0 text-primary">
                    <FaUsers className="me-2" />
                    Quản lý Người dùng
                  </h4>
                  <small className="text-muted">
                    Tổng {filteredUsers.length} người dùng 
                  </small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <h5 className="mb-0 text-primary">
                    <span className="me-2">{getRoleIcon('ROLE_USER')}</span>
                    Quản lý Người dùng
                  </h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-light">
              <FaSearch className="text-muted" />
            </span>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
            />
          </div>
        </Col>
        <Col md={3}>
          <Form.Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="shadow-sm"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Admin</option>
            <option value="ROLE_MANAGER">Manager</option>
            <option value="ROLE_STAFF">Staff</option>
            <option value="ROLE_USER">User</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shadow-sm"
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
            onClick={() => loadUsers(currentPage, pageSize)}
            disabled={loading}
            className="shadow-sm"
          >
            <FaFilter className="me-1" />
            Làm mới
          </Button>
        </Col>
      </Row>

      {/* Users Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Đang tải danh sách người dùng...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4">
                  <FaUsers size={48} className="text-muted mb-3" />
                  <h5>Không có người dùng nào</h5>
                  <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc thêm người dùng mới</p>
                </div>
              ) : (
                <Table responsive hover className="table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th><strong>ID</strong></th>
                      <th><strong>Username</strong></th>
                      <th><strong>Email</strong></th>
                      <th><strong>Họ tên</strong></th>
                      <th><strong>Vai trò</strong></th>
                      <th><strong>Trạng thái</strong></th>
                      <th><strong>Chi nhánh</strong></th>
                      <th className="text-center"><strong>Thao tác</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <strong>{user.username}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <div className="fw-bold">{user.name || 'Chưa cập nhật'}</div>
                        </td>
                        <td>{getRoleBadge(user.roles)}</td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{getBranchInfo(user)}</td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleChangeRole(user)}
                              title="Thay đổi vai trò"
                              className="px-2 py-1"
                            >
                              <FaUserTie className="me-1" />
                              Vai trò
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleChangeBranch(user)}
                              title="Thay đổi chi nhánh"
                              className="px-2 py-1"
                            >
                              <FaStore className="me-1" />
                              Chi nhánh
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleChangeStatus(user)}
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
          </Card>
        </Col>
      </Row>

            {/* Pagination */}
            {(() => {
              console.log('🔍 Pagination Debug:', { totalElements, totalPages, currentPage, pageSize, usersLength: users.length });
              return null;
            })()}
            {(totalElements > 0 || users.length > 0) && (
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa người dùng</Modal.Title>
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
            <Form.Group className="mb-3">
              <Form.Label>Vai trò *</Form.Label>
              <Form.Select
                value={formData.roleName}
                onChange={(e) => setFormData({...formData, roleName: e.target.value as any})}
              >
                <option value="ROLE_USER">User</option>
                <option value="ROLE_STAFF">Staff</option>
                <option value="ROLE_MANAGER">Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUser}
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

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.username}</strong>?</p>
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
            onClick={handleDeleteUser}
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
          <p>Thay đổi vai trò cho người dùng <strong>{selectedUser?.username}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Vai trò mới</Form.Label>
            <Form.Select
              value={selectedUser?.roles[0] || 'ROLE_USER'}
              onChange={(e) => {
                if (selectedUser) {
                  setSelectedUser({
                    ...selectedUser,
                    roles: [e.target.value]
                  });
                }
              }}
            >
              <option value="ROLE_USER">Người dùng</option>
              <option value="ROLE_STAFF">Nhân viên</option>
              <option value="ROLE_MANAGER">Quản lý</option>
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
              if (!selectedUser) return;
              
              try {
                setSubmitting(true);
                // Call actual API to change role
                await UserManagementService.updateUserRole(selectedUser.id, selectedUser.roles[0]);
                
                // Reload data to get updated information from server
                await loadUsers(currentPage, pageSize);
                
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
          <p>Thay đổi chi nhánh cho người dùng <strong>{selectedUser?.username}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Chi nhánh mới</Form.Label>
            <Form.Select
              value={selectedUser?.branchId || ''}
              onChange={(e) => {
                if (selectedUser) {
                  setSelectedUser({
                    ...selectedUser,
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
              if (!selectedUser) return;
              
              try {
                setSubmitting(true);
                // Call actual API to change branch
                await UserManagementService.updateUserBranch(selectedUser.id, selectedUser.branchId);
                
                // Reload data to get updated information from server
                await loadUsers(currentPage, pageSize);
                
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
            <h5 className="text-primary">{selectedUser?.name || selectedUser?.username}</h5>
            <small className="text-muted">ID: {selectedUser?.id}</small>
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

export default UserManagementPage;
