import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge, Modal, Spinner, Tabs, Tab, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaEye, FaBuilding, FaUnlock, FaLock, FaPause, FaCheckCircle, FaUser, FaUsers, FaUserTie, FaUserCog, FaUtensils, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AccountService } from '../services/AccountService';
import { BranchService } from '../services/BranchService';
import type { AccountResponseDTO, AccountStatus } from '../interfaces';
import { Role, RoleLabel } from '../interfaces/enums/Role';
import { useAuth } from '../hooks/useAuth';

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountResponseDTO[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [activeRole, setActiveRole] = useState<Role>(Role.MANAGER);
  
  console.log('🔍 AccountManagementPage: Component rendered', { 
    accountsCount: accounts.length, 
    loading, 
    activeRole 
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponseDTO | null>(null);
  const [newStatus, setNewStatus] = useState<AccountStatus>('ACTIVE');
  const [newRole, setNewRole] = useState<Role>(Role.USER);
  const [newBranchId, setNewBranchId] = useState<string>('');

  const { user: currentUser } = useAuth();
  const currentRoles = currentUser?.role ? [currentUser.role] : [];

  // Canonical role mapping
  const canonicalRoles = currentRoles
    .map((r: string) => {
      if (!r) return null;
      if (r.startsWith('ROLE_')) return r as Role;
      const lower = r.toLowerCase();
      if (lower === 'admin' || lower === 'administrator') return Role.ADMIN;
      if (lower === 'manager' || lower === 'quản lý' || lower === 'quan ly') return Role.MANAGER;
      if (lower === 'staff' || lower === 'nhân viên' || lower === 'nhan vien') return Role.STAFF;
      if (lower === 'user' || lower === 'người dùng' || lower === 'nguoi dung') return Role.USER;
      return r as Role;
    })
    .filter((r: Role | null): r is Role => r !== null && Object.values(Role).includes(r));

  const isAdmin = canonicalRoles.includes(Role.ADMIN);
  const isManager = canonicalRoles.includes(Role.MANAGER);
  const authBranchId = currentUser?.branchId || null;

  // Allowed tabs based on permissions (only MANAGER and STAFF)
  const allowedTabs: Role[] = isAdmin
    ? [Role.MANAGER, Role.STAFF]
    : isManager
    ? [Role.STAFF]
    : [];

  // Statistics
  const accountsArray = Array.isArray(accounts) ? accounts : [];
  const visibleAccounts = accountsArray.filter(a =>
    isAdmin || (isManager && a.branchId === authBranchId) || (!isAdmin && !isManager)
  );
  const staffAccounts = visibleAccounts.filter(a => 
    (a.roles.includes(Role.MANAGER) || a.roles.includes(Role.STAFF)) && 
    (isAdmin || (isManager && a.branchId === authBranchId))
  );
  const countManagers = staffAccounts.filter(a => a.roles.includes(Role.MANAGER)).length;
  const countStaffs = staffAccounts.filter(a => a.roles.includes(Role.STAFF)).length;
  const countActive = staffAccounts.filter(a => a.status === 'ACTIVE').length;
  const countInactive = staffAccounts.filter(a => a.status === 'INACTIVE').length;
  const countLocked = staffAccounts.filter(a => a.status === 'LOCKED').length;

  const fetchAccounts = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      console.log('🔄 AccountManagementPage: Fetching accounts...', { page, size });
      const data = await AccountService.getAll({ page, size });
      console.log('✅ AccountManagementPage: Accounts data received:', data);
      
      let accountsData: AccountResponseDTO[] = [];
      if (Array.isArray(data)) {
        accountsData = data;
        console.log('📊 AccountManagementPage: Data is array, length:', accountsData.length);
        // Nếu là array, tính toán pagination thủ công
        setTotalElements(accountsData.length);
        setTotalPages(Math.ceil(accountsData.length / pageSize));
      } else if (data && typeof data === 'object' && 'content' in data) {
        accountsData = data.content || [];
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 1);
        console.log('📊 AccountManagementPage: Data is paged, content length:', accountsData.length);
      } else {
        accountsData = [];
        setTotalElements(0);
        setTotalPages(0);
        console.log('📊 AccountManagementPage: Data is empty or invalid');
      }
      setAccounts(accountsData);
      
      console.log('📊 AccountManagementPage: Final accounts data:', {
        totalAccounts: accountsData.length,
        admins: accountsData.filter(a => a.roles.includes(Role.ADMIN)).length,
        managers: accountsData.filter(a => a.roles.includes(Role.MANAGER)).length,
        staff: accountsData.filter(a => a.roles.includes(Role.STAFF)).length,
        users: accountsData.filter(a => a.roles.includes(Role.USER)).length,
        note: 'Only MANAGER and STAFF accounts will be shown'
      });
      
      if (accountsData.length === 0) {
        toast.warn('Không có tài khoản nào được tải từ database');
      }
    } catch (error) {
      console.error('❌ AccountManagementPage: Error fetching accounts:', error);
      toast.error('Lỗi khi tải danh sách tài khoản');
      setAccounts([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await BranchService.getAll();
      let branchesData: any[] = [];
      if (Array.isArray(data)) {
        branchesData = data;
      } else if (data && typeof data === 'object' && 'content' in data) {
        branchesData = data.content || [];
      } else {
        branchesData = [];
      }
      setBranches(branchesData);
      if (branchesData.length === 0) {
        toast.warn('Không có chi nhánh nào được tải từ database');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Lỗi khi tải danh sách chi nhánh');
      setBranches([]);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBranches();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAccounts(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    fetchAccounts(0, size);
  };

  useEffect(() => {
    if (!allowedTabs.includes(activeRole)) {
      if (allowedTabs.includes(Role.MANAGER)) {
        setActiveRole(Role.MANAGER);
      } else if (allowedTabs.includes(Role.STAFF)) {
        setActiveRole(Role.STAFF);
      } else if (allowedTabs.includes(Role.USER)) {
        setActiveRole(Role.USER);
      }
    }
  }, [isAdmin, allowedTabs, activeRole]);

  const normalized = (s?: string) => (s || '').toLowerCase();
  const search = normalized(searchTerm);
  const filteredAccounts = (Array.isArray(accounts) ? accounts : [])
    .filter(a => {
      // Chỉ hiển thị MANAGER và STAFF (không hiển thị ADMIN và USER)
      if (a.roles.includes(Role.ADMIN) || a.roles.includes(Role.USER)) {
        return false;
      }
      
      // Chỉ hiển thị role tương ứng với tab hiện tại
      return a.roles.includes(activeRole);
    })
    .filter(a => isAdmin || (isManager && a.branchId === authBranchId) || (!isAdmin && !isManager))
    .filter(a => !search || 
      normalized(a.name).includes(search) || 
      normalized(a.username || '').includes(search) ||
      normalized(a.email || '').includes(search) ||
      (a.phone && normalized(a.phone).includes(search)))
    .filter(a => filterStatus === 'ALL' || a.status === filterStatus)
    .filter(a => filterBranch === 'ALL' || String(a.branchId || '') === filterBranch);

  const totalItems = filteredAccounts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + pageSize);
  
  // Debug log cho filtered accounts
  console.log(`📊 AccountManagementPage: Tab "${activeRole}" filtered accounts:`, {
    activeRole,
    totalFiltered: filteredAccounts.length,
    paginatedCount: paginatedAccounts.length,
    accounts: paginatedAccounts.map(a => ({
      id: a.id,
      name: a.name,
      roles: a.roles,
      status: a.status
    }))
  });

  const canManageAccount = (account: AccountResponseDTO) => {
    if (account.id === currentUser?.accountId) return false;
    if (isManager && account.branchId !== authBranchId) return false;
    return account.roles.some(role => allowedTabs.includes(role as Role));
  };

  const canChangeRole = (account: AccountResponseDTO) => {
    if (account.id === currentUser?.accountId) return false;
    if (isAdmin) {
      return !account.roles.includes(Role.ADMIN);
    }
    if (isManager) {
      if (account.branchId !== authBranchId) return false;
      return !account.roles.includes(Role.MANAGER) && !account.roles.includes(Role.ADMIN);
    }
    return false;
  };

  const getAvailableRoles = (account: AccountResponseDTO) => {
    const roles: Array<{ value: Role; label: string }> = [
      { value: Role.USER, label: RoleLabel[Role.USER] },
      { value: Role.STAFF, label: RoleLabel[Role.STAFF] }
    ];
    if (isAdmin && !account.roles.includes(Role.ADMIN)) {
      // Admins can assign MANAGER but not ADMIN
      roles.push({ value: Role.MANAGER, label: RoleLabel[Role.MANAGER] });
    }
    // Managers cannot assign MANAGER or ADMIN, so no additional roles are added for isManager
    return roles;
  };

  const getAvailableStatuses = (account: AccountResponseDTO) => {
    const statuses = [
      { value: 'ACTIVE' as AccountStatus, label: 'Hoạt động' },
      { value: 'INACTIVE' as AccountStatus, label: 'Chưa kích hoạt' },
      { value: 'LOCKED' as AccountStatus, label: 'Khóa' }
    ];

    // Không thể thay đổi trạng thái của chính mình
    if (account.id === currentUser?.accountId) return [];
    
    if (isAdmin) {
      // Admin có thể thay đổi trạng thái của tất cả tài khoản trừ admin khác
      const isAccountAdmin = account.roles.includes(Role.ADMIN);
      return isAccountAdmin ? [] : statuses;
    }
    
    if (isManager) {
      // Manager chỉ có thể thay đổi trạng thái của tài khoản trong chi nhánh mình
      if (account.branchId !== authBranchId) return [];
      
      // Manager không thể thay đổi trạng thái của admin hoặc manager khác
      const isAccountAdmin = account.roles.includes(Role.ADMIN);
      const isAccountManager = account.roles.includes(Role.MANAGER);
      if (isAccountAdmin || isAccountManager) return [];
      
      return statuses;
    }

    return [];
  };

  const handleStatusChange = async () => {
    if (!selectedAccount) return;
    try {
      // Truyền đúng format { status: string } như AccountService mong đợi
      await AccountService.updateStatus(selectedAccount.id, { status: newStatus });
      
      // Hiển thị thông báo đặc biệt khi chuyển từ Tạm khóa sang Hoạt động
      if (selectedAccount.status === 'INACTIVE' && newStatus === 'ACTIVE') {
        toast.success('Cập nhật trạng thái thành công! Tài khoản đã được mở khóa và có thể đăng nhập ngay.');
      } else {
        toast.success('Cập nhật trạng thái thành công!');
      }
      
      setShowStatusModal(false);
      fetchAccounts(currentPage, pageSize);
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleRoleChange = async () => {
    if (!selectedAccount) return;
    try {
      await AccountService.updateRole(selectedAccount.id, newRole);
      toast.success('Cập nhật vai trò thành công!');
      setShowRoleModal(false);
      fetchAccounts(currentPage, pageSize);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  const handleBranchChange = async () => {
    if (!selectedAccount) return;
    try {
      if (isManager && Number(newBranchId) !== authBranchId) {
        toast.error('Bạn chỉ có thể phân công tài khoản cho chi nhánh của mình.');
        return;
      }
      const data = {
        name: selectedAccount.name,
        password: 'temporary',
        phone: selectedAccount.phone || '',
        branchId: newBranchId === '' ? undefined : newBranchId,
      };
      await AccountService.update(selectedAccount.id, data);
      toast.success('Cập nhật chi nhánh thành công!');
      setShowBranchModal(false);
      fetchAccounts(currentPage, pageSize);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật chi nhánh');
    }
  };





  const openStatusModal = (account: AccountResponseDTO) => {
    setSelectedAccount(account);
    setNewStatus(account.status);
    setShowStatusModal(true);
    
    // Debug logs
    console.log('=== STATUS MODAL DEBUG ===');
    console.log('Account:', account.name, 'ID:', account.id);
    console.log('Current status:', account.status);
    console.log('Account roles:', account.roles);
    console.log('Current user ID:', currentUser?.accountId);
    console.log('Is same user:', account.id === currentUser?.accountId);
    console.log('Available statuses:', getAvailableStatuses(account));
    console.log('Can manage account:', canManageAccount(account));
    console.log('=== END STATUS DEBUG ===');
  };

  const openRoleModal = (account: AccountResponseDTO) => {
    setSelectedAccount(account);
    setNewRole(account.roles[0] as Role);
    setShowRoleModal(true);
  };

  const openBranchModal = (account: AccountResponseDTO) => {
    setSelectedAccount(account);
    setNewBranchId(account.branchId ? String(account.branchId) : '');
    setShowBranchModal(true);
  };

  const navigateToAddStaff = () => {
    navigate('/admin/staff/create');
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge bg="success">Hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge bg="warning">Tạm khóa</Badge>;
      case 'LOCKED':
        return <Badge bg="danger">Đã khóa</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <FaCheckCircle />;
      case 'INACTIVE':
        return <FaPause />;
      case 'LOCKED':
        return <FaLock />;
      default:
        return <FaEye />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <FaUserCog />;
      case 'ROLE_MANAGER':
        return <FaUserTie />;
      case 'ROLE_STAFF':
        return <FaUser />;
      case 'ROLE_USER':
        return <FaUsers />;
      default:
        return <FaUser />;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Quản lý Nhân viên</h2>
              <p className="text-muted mb-0">Quản lý Manager và Staff trong hệ thống</p>
            </div>
            <div>
              {(isAdmin || isManager) && (
                <Button 
                  variant="primary" 
                  onClick={navigateToAddStaff}
                  className="d-flex align-items-center"
                >
                  <FaPlus className="me-2" />
                  Thêm nhân viên
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4 justify-content-center">
        <Col md={2}>
          <Card className="text-center border-success h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-2">
                <FaCheckCircle className="text-success" size={24} />
              </div>
              <h4 className="text-success mb-1">{countActive}</h4>
              <p className="mb-0 text-muted">Hoạt động</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center border-warning h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-2">
                <FaPause className="text-warning" size={24} />
              </div>
              <h4 className="text-warning mb-1">{countInactive}</h4>
              <p className="mb-0 text-muted">Tạm khóa</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center border-danger h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-2">
                <FaLock className="text-danger" size={24} />
              </div>
              <h4 className="text-danger mb-1">{countLocked}</h4>
              <p className="mb-0 text-muted">Đã khóa</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center border-info h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-2">
                <FaUsers className="text-info" size={24} />
              </div>
              <h4 className="text-info mb-1">{staffAccounts.length}</h4>
              <p className="mb-0 text-muted">Tổng cộng</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
        <Tabs
          activeKey={activeRole}
            onSelect={(k) => {
              if (k && typeof k === 'string' && Object.values(Role).includes(k as Role)) {
                const newRole = k as Role;
                setActiveRole(newRole);
                setCurrentPage(1);
              }
            }}
          justify
            className="mb-3 nav-tabs-clickable"
        >
          {allowedTabs.includes(Role.MANAGER) && (
            <Tab eventKey={Role.MANAGER} title={
              <span className="d-flex align-items-center">
                <span className="me-1">{getRoleIcon('ROLE_MANAGER')}</span>
                Quản lý <Badge bg="secondary" className="ms-1">{countManagers}</Badge>
              </span>
            } />
          )}
          {allowedTabs.includes(Role.STAFF) && (
            <Tab eventKey={Role.STAFF} title={
              <span className="d-flex align-items-center">
                <span className="me-1">{getRoleIcon('ROLE_STAFF')}</span>
                Nhân viên <Badge bg="secondary" className="ms-1">{countStaffs}</Badge>
              </span>
            } />
          )}
        </Tabs>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
          <Form.Control
                  type="text"
                  placeholder="Tìm theo tên, username, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Chưa kích hoạt</option>
                  <option value="LOCKED">Khóa</option>
                </Form.Select>
              </Form.Group>
        </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Chi nhánh</Form.Label>
          <Form.Select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
          >
                  <option value="ALL">Tất cả chi nhánh</option>
                  {(Array.isArray(branches) ? branches : []).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Form.Select>
              </Form.Group>
        </Col>
      </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
      {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : (
            <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Username</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Chi nhánh</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
                {paginatedAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.name}</td>
                <td>{account.username}</td>
                <td>{account.email || '-'}</td>
                <td>{account.phone || '-'}</td>
                <td>
                  <Badge bg="info" className="me-1 d-inline-flex align-items-center">
                    <span className="me-1">{getRoleIcon(account.roles[0])}</span>
                    {RoleLabel[account.roles[0] as Role] || account.roles[0]}
                    </Badge>
                </td>
                <td>{account.branchName || 'Chưa phân công'}</td>
                <td>{getStatusBadge(account.status)}</td>
                <td>
                       {account.id === currentUser?.accountId ? (
                         // Nếu là tài khoản của chính mình, hiển thị nút chuyển đến AccountPage
                         <Button
                           variant="outline-primary"
                           size="sm"
                           onClick={() => window.location.href = '/account'}
                           title="Xem thông tin tài khoản của tôi"
                         >
                           Tài khoản của tôi
                         </Button>
                       ) : (
                         // Nếu là tài khoản khác, hiển thị các nút thao tác
                         <div className="d-flex gap-2">
                    {getAvailableStatuses(account).length > 0 && (
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => openStatusModal(account)}
                        disabled={!canManageAccount(account)}
                        title="Thay đổi trạng thái"
                        className="px-2 py-1"
                      >
                        {getStatusIcon(account.status)}
                        <span className="ms-1">Trạng thái</span>
                      </Button>
                    )}
                    {canChangeRole(account) && (
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        onClick={() => openRoleModal(account)}
                        disabled={!canManageAccount(account)}
                        title="Thay đổi vai trò"
                        className="px-2 py-1"
                      >
                        {getRoleIcon(account.roles[0])}
                        <span className="ms-1">Vai trò</span>
                      </Button>
                    )}
                    {canManageAccount(account) && (
                     <Button 
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openBranchModal(account)}
                        title="Thay đổi chi nhánh"
                        className="px-2 py-1"
                      >
                        <FaBuilding className="me-1" />
                        Chi nhánh
                     </Button>
                    )}
                         </div>
                       )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

          {!loading && paginatedAccounts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">Không tìm thấy tài khoản nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {!loading && (
        <Card className="mt-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
            <span>Kích thước trang:</span>
            <Form.Select
              style={{ width: 100 }}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </Form.Select>
            <span className="text-muted ms-2">Tổng {totalItems} mục</span>
              </div>
          <Pagination className="mb-0">
            <Pagination.First disabled={currentPage === 0} onClick={() => handlePageChange(0)} />
            <Pagination.Prev disabled={currentPage === 0} onClick={() => handlePageChange(Math.max(0, currentPage - 1))} />
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const needEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {needEllipsis && <Pagination.Ellipsis disabled />}
                    <Pagination.Item active={p === currentPage} onClick={() => handlePageChange(p)}>{p + 1}</Pagination.Item>
                  </React.Fragment>
                );
              })}
            <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))} />
            <Pagination.Last disabled={currentPage === totalPages - 1} onClick={() => handlePageChange(totalPages - 1)} />
          </Pagination>
            </div>
          </Card.Body>
        </Card>
      )}

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAccount && getStatusIcon(selectedAccount.status)}
            <span className="ms-2">Thay đổi trạng thái tài khoản</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <p className="mb-0">Thay đổi trạng thái của tài khoản</p>
            <h5 className="text-primary">{selectedAccount?.name}</h5>
            <small className="text-muted">ID: {selectedAccount?.id}</small>
          </div>
          <Form.Group>
            <Form.Label>Trạng thái mới</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
            >
              {selectedAccount && getAvailableStatuses(selectedAccount).map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
             

          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleStatusChange}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="d-flex align-items-center">
              {selectedAccount && getRoleIcon(selectedAccount.roles[0])}
              <span className="ms-2">Thay đổi vai trò tài khoản</span>
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <p className="mb-0">Thay đổi vai trò của tài khoản</p>
            <h5 className="text-primary">{selectedAccount?.name}</h5>
            <small className="text-muted">ID: {selectedAccount?.id}</small>
          </div>
          <Form.Group>
            <Form.Label>Vai trò mới</Form.Label>
            <Form.Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
            >
              {selectedAccount && getAvailableRoles(selectedAccount).map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleRoleChange}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBranchModal} onHide={() => setShowBranchModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBuilding className="me-2" />
            Thay đổi chi nhánh tài khoản
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <p className="mb-0">Thay đổi chi nhánh của tài khoản</p>
            <h5 className="text-primary">{selectedAccount?.name}</h5>
            <small className="text-muted">ID: {selectedAccount?.id}</small>
          </div>
          <Form.Group>
            <Form.Label>Chi nhánh mới</Form.Label>
            <Form.Select
              value={newBranchId}
              onChange={(e) => setNewBranchId(e.target.value)}
            >
              <option value="">Chưa phân công</option>
              {(Array.isArray(branches) ? branches : []).map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.id === selectedAccount?.branchId ? '(Hiện tại)' : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBranchModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleBranchChange}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}