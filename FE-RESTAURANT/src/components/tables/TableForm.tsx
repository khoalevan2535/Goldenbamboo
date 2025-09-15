import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';

import { TableService } from '../../services/TableService';
import { BranchService } from '../../services/BranchService';
import { useAuth } from '../../hooks/useAuth';
import { type TableRequestDTO } from '../../interfaces/TableRequestDTO';
import { type TableResponseDTO } from '../../interfaces/TableResponseDTO';

interface TableFormProps {
  mode: 'create' | 'edit';
}

const TableForm: React.FC<TableFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role, user } = useAuth() as any;
  
  const isAdmin = role === 'ROLE_ADMIN';
  const userBranchId = user?.branchId ?? null;

  // States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [table, setTable] = useState<TableResponseDTO | null>(null);

  // Form state
  const [form, setForm] = useState<TableRequestDTO>({
    name: '',
    status: mode === 'create' ? 'AVAILABLE' : 'AVAILABLE' as any,
    branchId: 0,
    description: '',
    createdBy: '',
    seats: 4,
    area: '',
    tableType: 'STANDARD',
    notes: ''
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading data for mode:', mode, 'id:', id);
        
        // Load branches
        try {
          if (isAdmin) {
            console.log('Loading all branches for admin');
            const branchResponse = await BranchService.getAll();
            console.log('Branch response:', branchResponse);
            const branchesData = branchResponse?.data?.content || branchResponse?.content || [];
            setBranches(Array.isArray(branchesData) ? branchesData : []);
            console.log('Branches loaded:', branchesData);
          } else if (userBranchId) {
            console.log('Loading branch for user:', userBranchId);
            const branchResponse = await BranchService.getById(userBranchId);
            const branchData = branchResponse?.data || branchResponse;
            setBranches(branchData ? [branchData] : []);
            setForm(prev => ({ ...prev, branchId: userBranchId }));
            console.log('User branch loaded:', branchData);
          } else {
            console.log('No user branch ID, setting empty branches');
            setBranches([]);
          }
        } catch (branchError: any) {
          console.error('Error loading branches:', branchError);
          setError(branchError.response?.data?.message || branchError.message || 'Không thể tải danh sách chi nhánh');
          setBranches([]);
          return;
        }

        // Load table for edit mode
        if (mode === 'edit' && id) {
          try {
            console.log('Loading table for edit, id:', id);
            const tableResponse = await TableService.getById(Number(id));
            console.log('Table response:', tableResponse);
            const tableData = tableResponse.data || tableResponse;
            
            if (!tableData) {
              throw new Error('Không tìm thấy dữ liệu bàn');
            }
            
            setTable(tableData);
                         setForm({
               name: tableData.name || '',
               status: tableData.status || 'AVAILABLE',
               branchId: tableData.branchId || 0,
               description: tableData.description || '',
               createdBy: tableData.createdBy || '',
               seats: tableData.seats || 4,
               area: tableData.area || '',
               tableType: tableData.tableType || 'STANDARD',
               notes: tableData.notes || ''
             });
            console.log('Table data loaded:', tableData);
          } catch (tableError: any) {
            console.error('Error loading table:', tableError);
            setError(tableError.response?.data?.message || tableError.message || 'Không thể tải thông tin bàn');
            return;
          }
        }
      } catch (error: any) {
        console.error('General error in loadData:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mode, id, isAdmin, userBranchId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setError('Tên bàn không được để trống');
      return;
    }

    if (!form.branchId) {
      setError('Vui lòng chọn chi nhánh');
      return;
    }

    if (!form.seats || form.seats < 1) {
      setError('Số ghế phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const requestData: TableRequestDTO = {
        ...form,
        status: mode === 'create' ? 'AVAILABLE' : form.status, // Đảm bảo bàn mới luôn có trạng thái AVAILABLE
        createdBy: user?.username || user?.fullName || 'Unknown',
        // Set default values for optional fields when creating
        ...(mode === 'create' && {
          tableType: form.tableType || 'STANDARD',
          description: form.description || '',
          notes: form.notes || '',
          area: form.area || ''
        })
      };

      if (mode === 'create') {
        await TableService.create(requestData);
        toast.success('Tạo bàn thành công!');
      } else {
        await TableService.update(Number(id), requestData);
        toast.success('Cập nhật bàn thành công!');
      }

      navigate(isAdmin ? '/admin/tables' : '/manager/tables');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          (mode === 'create' ? 'Có lỗi xảy ra khi tạo bàn' : 'Có lỗi xảy ra khi cập nhật bàn');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof TableRequestDTO, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="table-form-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">
            {mode === 'create' ? 'Tạo bàn mới' : 'Chỉnh sửa bàn'}
          </h2>
          {mode === 'edit' && table && (
            <small className="text-muted">
              Mã bàn: {table.id} | Ngày tạo: {new Date(table.createdAt).toLocaleDateString('vi-VN')}
            </small>
          )}
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => navigate(isAdmin ? '/admin/tables' : '/manager/tables')}
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Basic Information */}
          <Col md={8}>
            <div className="bg-white p-4 rounded shadow-sm mb-4">
              <h5 className="mb-3">Thông tin bàn</h5>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên bàn <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Bàn 01, VIP 01..."
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chi nhánh <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={form.branchId}
                      onChange={(e) => handleInputChange('branchId', Number(e.target.value))}
                      disabled={!isAdmin}
                    >
                      <option value={0}>-- Chọn chi nhánh --</option>
                      {branches?.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      )) || []}
                    </Form.Select>
                    {!isAdmin && (
                      <Form.Text className="text-muted">
                        Bạn chỉ có thể tạo bàn cho chi nhánh của mình
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số ghế <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="20"
                      value={form.seats}
                      onChange={(e) => handleInputChange('seats', Number(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Khu vực</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Tầng 1, Sân vườn..."
                      value={form.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {mode === 'edit' && (
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="AVAILABLE">Có sẵn</option>
                    <option value="OCCUPIED">Đang sử dụng</option>
                    <option value="RESERVED">Đã đặt trước</option>
                    <option value="UNAVAILABLE">Không khả dụng</option>
                  </Form.Select>
                </Form.Group>
              )}

              {mode === 'create' && (
                <div className="alert alert-info">
                  <small>
                    <i className="fas fa-info-circle me-1"></i>
                    Bàn mới tạo sẽ có trạng thái "Có sẵn" mặc định
                  </small>
                </div>
              )}
            </div>
          </Col>

          {/* Optional Information - Only show in edit mode */}
          {mode === 'edit' && (
            <Col md={4}>
              <div className="bg-white p-4 rounded shadow-sm mb-4">
                <h5 className="mb-3">Thông tin bổ sung</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Loại bàn</Form.Label>
                  <Form.Select
                    value={form.tableType}
                    onChange={(e) => handleInputChange('tableType', e.target.value)}
                  >
                    <option value="STANDARD">Tiêu chuẩn</option>
                    <option value="VIP">VIP</option>
                    <option value="PRIVATE">Riêng tư</option>
                    <option value="OUTDOOR">Ngoài trời</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Mô tả ngắn về bàn..."
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Ghi chú thêm..."
                    value={form.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </Form.Group>
              </div>
            </Col>
          )}
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(isAdmin ? '/admin/tables' : '/manager/tables')}
            disabled={submitting}
          >
            <FaTimes className="me-2" />
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {mode === 'create' ? 'Đang tạo...' : 'Đang lưu...'}
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {mode === 'create' ? 'Tạo bàn' : 'Lưu thay đổi'}
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default TableForm;
