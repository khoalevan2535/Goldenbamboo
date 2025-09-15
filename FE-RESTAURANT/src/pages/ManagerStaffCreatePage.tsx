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

export default function ManagerStaffCreatePage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states - mặc định vai trò là STAFF và chi nhánh là chi nhánh của manager
  const [newStaff, setNewStaff] = useState<StaffRegistrationRequestDTO>({
    username: '',
    password: '', // Sẽ được tạo tự động
    name: '',
    phone: '',
    email: '',
    roleName: Role.STAFF, // Mặc định là STAFF
    branchId: currentUser?.branchId || undefined // Mặc định là chi nhánh của manager
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submit
    if (!newStaff.name || !newStaff.name.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }
    if (newStaff.name.trim().length < 2) {
      toast.error('Họ tên phải có ít nhất 2 ký tự');
      return;
    }
    if (!/^[\p{L}\s]+$/u.test(newStaff.name.trim())) {
      toast.error('Họ tên chỉ được chứa chữ cái, khoảng trắng và chữ có dấu');
      return;
    }

    if (!newStaff.username || !newStaff.username.trim()) {
      toast.error('Username không được để trống');
      return;
    }
    if (newStaff.username.trim().length < 3) {
      toast.error('Username phải có ít nhất 3 ký tự');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(newStaff.username.trim())) {
      toast.error('Username chỉ được chứa chữ cái và số');
      return;
    }

    if (!newStaff.phone || !newStaff.phone.trim()) {
      toast.error('Số điện thoại không được để trống');
      return;
    }
    const phoneStr = newStaff.phone.replace(/\s/g, '');
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phoneStr)) {
      toast.error('Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, 09 và có 10 chữ số');
      return;
    }

    if (newStaff.email && newStaff.email.trim()) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(newStaff.email.trim())) {
        toast.error('Email không đúng định dạng (ví dụ: user@example.com)');
        return;
      }
    }

    if (!newStaff.roleName) {
      toast.error('Vai trò không được để trống');
      return;
    }
    if (newStaff.roleName !== Role.STAFF) {
      toast.error('Manager chỉ có thể tạo nhân viên với vai trò Staff');
      return;
    }

    if (!newStaff.branchId || newStaff.branchId === 0) {
      toast.error('Chi nhánh không được để trống');
      return;
    }

    // Kiểm tra chi nhánh có phải là chi nhánh của manager không
    if (newStaff.branchId !== currentUser?.branchId) {
      toast.error('Bạn chỉ có thể thêm nhân viên cho chi nhánh của mình');
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
        toast.success(`Thêm nhân viên thành công! Email kích hoạt đã được gửi đến ${staffData.email}`, {
          autoClose: 5000
        });
      } else {
        toast.success('Thêm nhân viên thành công!');
      }
      
      navigate('/manager/staff');
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
  };

  const handleEmailChange = (value: string) => {
    setNewStaff(prev => ({
      ...prev,
      email: value
    }));
  };

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

  // Lấy thông tin chi nhánh hiện tại
  const currentBranch = branches.find(b => b.id === currentUser?.branchId);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/manager/staff')}
              className="me-3"
            >
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
            <div>
              <h2 className="mb-1">Thêm nhân viên mới</h2>
              <p className="text-muted mb-0">Tạo tài khoản nhân viên mới cho chi nhánh của bạn</p>
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
                      />
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
                      />
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
                      />
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
                      />
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
                        disabled // Manager chỉ có thể tạo STAFF
                      >
                        <option value={Role.STAFF}>{RoleLabel[Role.STAFF]}</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Manager chỉ có thể tạo nhân viên với vai trò Staff
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Chi nhánh <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={currentBranch?.name || `Chi nhánh ${currentUser?.branchId}`}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Nhân viên sẽ được thêm vào chi nhánh của bạn
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <div className="d-flex justify-content-end gap-2">
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/manager/staff')}
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
