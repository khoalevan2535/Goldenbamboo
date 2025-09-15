import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const ComboEditPageSimple: React.FC = () => {
  console.log('ComboEditPageSimple rendering');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();

  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authorized
  if (role !== 'ROLE_ADMIN' && role !== 'ROLE_MANAGER') {
    toast.error('Bạn không có quyền truy cập trang này.');
    navigate('/manager/dashboard');
    return null;
  }

  // Load combo data
  useEffect(() => {
    const loadCombo = async () => {
      if (id) {
        console.log('ComboEditPageSimple - Loading combo for edit, id:', id);
        setLoading(true);
        try {
          // Simulate loading data - replace with actual API call later
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data for testing
          setForm({
            name: `Combo Test ${id}`,
            description: `Mô tả combo test ${id}`,
            basePrice: 100000,
          });
          
          console.log('ComboEditPageSimple - Mock data loaded');
        } catch (e: any) {
          console.error('ComboEditPageSimple - Error loading combo:', e);
          setError('Không thể tải thông tin combo');
          toast.error('Không thể tải thông tin combo');
        } finally {
          setLoading(false);
        }
      }
    };
    loadCombo();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên combo.');
      return;
    }

    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cập nhật combo thành công!');
      navigate('/manager/combos');
    } catch (err) {
      console.error('Error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      toast.error('Cập nhật combo thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/manager/combos');
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-2">Đang tải thông tin combo...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Chỉnh sửa Combo (Test)</h1>
        <Button variant="outline-secondary" onClick={handleBack}>
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Thông tin Combo</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="comboName">
                  <Form.Label>Tên Combo <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên combo..."
                    required
                    disabled={saving}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="comboDescription">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả ngắn gọn về combo..."
                    disabled={saving}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="comboPrice">
                  <Form.Label>Giá Cơ Bản <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleInputChange}
                    placeholder="Nhập giá..."
                    min="0"
                    required
                    disabled={saving}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="outline-secondary" onClick={handleBack} disabled={saving}>
                    <FaTimes className="me-2" />
                    Hủy
                  </Button>
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Cập nhật Combo
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Thông tin</Card.Header>
            <Card.Body>
              <p><strong>ID Combo:</strong> {id}</p>
              <Alert variant="info">
                <p>Đây là phiên bản test đơn giản của trang edit combo.</p>
                <p className="mb-0">Sử dụng mock data để test navigation.</p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ComboEditPageSimple;


