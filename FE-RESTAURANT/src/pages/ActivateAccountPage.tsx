  import React, { useState, useEffect } from 'react';
  import { useSearchParams, useNavigate } from 'react-router-dom';
  import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
  import { AuthService } from '../services/AuthService';
  import { useAuth } from '../hooks/useAuth';

  const ActivateAccountPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithTokens, user } = useAuth();
    const [formData, setFormData] = useState({
      newPassword: '',
      confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const token = searchParams.get('token');

    useEffect(() => {
      if (!token) {
        setError('Token kích hoạt không hợp lệ hoặc đã hết hạn.');
      }
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };

    const validateForm = () => {
      const errors: {[key: string]: string} = {};

      if (!formData.newPassword) {
        errors.newPassword = 'Mật khẩu không được để trống';
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm() || !token) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await AuthService.activateStaffAccount(token, formData.newPassword);
        
        if (response.accessToken) {
          // Lưu token và đăng nhập tự động
          await loginWithTokens(response.accessToken, response.refreshToken);
          setSuccess(true);
          // Tự động chuyển hướng theo role sau 2 giây
          setTimeout(async () => {
            try {
              // Gọi API để lấy thông tin user mới nhất
              const userInfo = await AuthService.getMe();
              const role = userInfo.role || 'ROLE_USER';
              
              console.log('Full user info after activation:', userInfo);
              console.log('User role after activation:', role);
              console.log('Role type:', typeof role);
              
              // Kiểm tra role
              const hasAdmin = role === 'ROLE_ADMIN';
              const hasManager = role === 'ROLE_MANAGER';
              const hasStaff = role === 'ROLE_STAFF';
              
              console.log('Role checks:', { hasAdmin, hasManager, hasStaff });
              
              if (hasAdmin) {
                console.log('Redirecting to admin dashboard');
                window.location.href = 'http://localhost:5173/admin/dashboard';
              } else if (hasManager) {
                console.log('Redirecting to manager dashboard');
                window.location.href = 'http://localhost:5173/manager/dashboard';
              } else if (hasStaff) {
                console.log('Redirecting to staff dashboard');
                window.location.href = 'http://localhost:5173/staff/dashboard';
              } else {
                console.log('No matching role, redirecting to home');
                window.location.href = 'http://localhost:5173/';
              }
            } catch (error) {
              console.error('Error getting user info for redirect:', error);
              // Fallback: chuyển về trang chủ
              window.location.href = 'http://localhost:5173/';
            }
          }, 2000);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi kích hoạt tài khoản');
      } finally {
        setLoading(false);
      }
    };

    if (success) {
      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="shadow">
                <Card.Body className="text-center p-5">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="text-success mb-3">Kích hoạt thành công!</h3>
                  <p className="text-muted mb-4">
                    Tài khoản của bạn đã được kích hoạt thành công và đã được đăng nhập tự động. 
                    Bạn sẽ được chuyển hướng đến trang làm việc phù hợp trong vài giây.
                  </p>
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                    <span className="text-muted">Đang chuyển hướng...</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow">
              <Card.Header className="bg-primary text-white text-center">
                <h4 className="mb-0">Kích Hoạt Tài Khoản Nhân Viên</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.newPassword}
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.newPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Xác nhận mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.confirmPassword}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={loading || !token}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang kích hoạt...
                        </>
                      ) : (
                        'Kích Hoạt Tài Khoản'
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted small">
                    Link kích hoạt có hiệu lực trong vòng 7 ngày kể từ thời điểm gửi.
                    Nếu bạn gặp vấn đề, vui lòng liên hệ quản lý.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };

  export default ActivateAccountPage;
