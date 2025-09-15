import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { BranchService } from '../services/BranchService';
import type { StaffRegistrationRequestDTO } from '../interfaces';
import { Role, RoleLabel } from '../interfaces/enums/Role';
import { useAuth } from '../hooks/useAuth';

export default function AddStaffPage() {
  const navigate = useNavigate();
  const { roles: currentRoles, user: currentUser } = useAuth();
  
  // Canonical role mapping
  const canonicalRoles = currentRoles
    .map(r => {
      if (!r) return null;
      if (r.startsWith('ROLE_')) return r as Role;
      const lower = r.toLowerCase();
      if (lower === 'admin' || lower === 'administrator') return Role.ADMIN;
      if (lower === 'manager' || lower === 'quản lý' || lower === 'quan ly') return Role.MANAGER;
      if (lower === 'staff' || lower === 'nhân viên' || lower === 'nhan vien') return Role.STAFF;
      if (lower === 'user' || lower === 'người dùng' || lower === 'nguoi dung') return Role.USER;
      return r as Role;
    })
    .filter((r): r is Role => r !== null && Object.values(Role).includes(r));

  const isAdmin = canonicalRoles.includes(Role.ADMIN);
  const isManager = canonicalRoles.includes(Role.MANAGER);
  const authBranchId = currentUser?.branchId || null;

  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [newStaff, setNewStaff] = useState<StaffRegistrationRequestDTO>({
    username: '',
    password: '', // Sẽ được tạo tự động
    name: '',
    phone: '',
    email: '',
    roleName: Role.STAFF,
    branchId: isManager ? (authBranchId || undefined) : undefined
  });
  // Bỏ state cho confirm password
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchBranches();
  }, []);

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
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Lỗi khi tải danh sách chi nhánh');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!newStaff.name.trim()) {
      errors.name = 'Tên không được để trống';
    }

    if (!newStaff.username.trim()) {
      errors.username = 'Username không được để trống';
    } else if (newStaff.username.length < 3) {
      errors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!newStaff.phone.trim()) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(newStaff.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (newStaff.email && !/^[A-Za-z0-9+_.-]+@(.+)$/.test(newStaff.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Bỏ validation mật khẩu vì sẽ được tạo tự động

    if (!newStaff.roleName) {
      errors.roleName = 'Vai trò không được để trống';
    }

    if ((!newStaff.branchId || newStaff.branchId === 0) && (isAdmin || isManager)) {
      errors.branchId = 'Chi nhánh không được để trống';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const staffData: StaffRegistrationRequestDTO = {
        ...newStaff,
        branchId: newStaff.branchId && newStaff.branchId !== 0 ? newStaff.branchId : undefined
      };

      await AuthService.registerStaff(staffData);
      
      // Hiển thị thông báo khác nhau tùy theo có email hay không
      if (staffData.email && staffData.email.trim()) {
        toast.success(`Thêm nhân viên thành công! Email kích hoạt đã được gửi đến ${staffData.email}`);
      } else {
        toast.success('Thêm nhân viên thành công!');
      }
      
      navigate('/admin/accounts');
    } catch (err: any) {
      console.error('Error adding staff:', err);
      toast.error(err?.response?.data?.message || 'Lỗi khi thêm nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof StaffRegistrationRequestDTO, value: string | number) => {
    setNewStaff(prev => ({
      ...prev,
      [field]: field === 'branchId' && value === 0 ? undefined : value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setNewStaff(prev => ({
      ...prev,
      email: value
    }));
    if (formErrors.email) {
      setFormErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  };

  // Bỏ handler cho confirm password

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Đang tải...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/admin/accounts')}
              className="me-3"
            >
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
            <div>
              <h2 className="mb-1">Thêm nhân viên mới</h2>
              <p className="text-muted mb-0">Tạo tài khoản nhân viên mới trong hệ thống</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Thông tin nhân viên</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên nhân viên <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên nhân viên"
                        value={newStaff.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        isInvalid={!!formErrors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập username"
                        value={newStaff.username}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        isInvalid={!!formErrors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={newStaff.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        isInvalid={!!formErrors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email (tùy chọn)"
                        value={newStaff.email || ''}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        isInvalid={!!formErrors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vai trò <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        value={newStaff.roleName}
                        onChange={(e) => handleFieldChange('roleName', e.target.value)}
                        isInvalid={!!formErrors.roleName}
                      >
                        {isAdmin && (
                          <option value={Role.MANAGER}>{RoleLabel[Role.MANAGER]}</option>
                        )}
                        <option value={Role.STAFF}>{RoleLabel[Role.STAFF]}</option>
                        <option value={Role.USER}>{RoleLabel[Role.USER]}</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.roleName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Chi nhánh <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        value={newStaff.branchId || ''}
                        onChange={(e) => handleFieldChange('branchId', e.target.value ? Number(e.target.value) : 0)}
                        isInvalid={!!formErrors.branchId}
                        disabled={isManager} // Manager can only assign to their own branch
                      >
                        <option value="">Chọn chi nhánh</option>
                        {(Array.isArray(branches) ? branches : []).map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Form.Select>
                      {isManager && (
                        <Form.Text className="text-muted">
                          Bạn chỉ có thể thêm nhân viên cho chi nhánh của mình
                        </Form.Text>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {formErrors.branchId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Bỏ trường mật khẩu vì sẽ được tạo tự động qua email kích hoạt */}

                <Row>
                  <Col>
                    <div className="d-flex justify-content-end gap-2">
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/admin/accounts')}
                        disabled={submitting}
                      >
                        Hủy
                      </Button>
                      <Button 
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang thêm...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Thêm nhân viên
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
