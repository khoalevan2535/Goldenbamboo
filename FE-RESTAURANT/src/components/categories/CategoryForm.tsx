import React, { useEffect, useState } from 'react';
import { Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';

import { type CategoryRequestDTO, type CategoryResponseDTO } from '../../interfaces';
import { CategoryService } from '../../services/CategoryService';

interface Props { mode: 'create' | 'edit' }

const initialForm: CategoryRequestDTO = { name: '', description: '' };

const CategoryForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<CategoryRequestDTO>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (mode === 'edit' && id) {
        setLoading(true);
        try {
          const data = await CategoryService.getById(id);
          setForm({ name: data.name, description: data.description });
        } catch (e: any) {
          setError(e.message || 'Không thể tải dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'create') await CategoryService.create(form);
      else if (id) await CategoryService.update(id, form);
      toast.success(mode === 'create' ? 'Tạo danh mục thành công' : 'Cập nhật thành công');
      const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
      navigate(`${basePath}/categories`);
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra');
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <Spinner animation="border" />
    </div>
  );

  return (
    <Card className="p-4 shadow-sm">
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-0">{mode === 'create' ? 'Tạo danh mục mới' : 'Sửa danh mục'}</h4>
        <Button variant="outline-secondary" onClick={() => {
          const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
          navigate(`${basePath}/categories`);
        }}>
          <FaArrowLeft className="me-2" />Quay lại
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tên danh mục</Form.Label>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nhập tên danh mục"
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả (tùy chọn)"
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-secondary" onClick={() => setForm(initialForm)} disabled={saving}>
            <FaTimes className="me-2" />Đặt lại
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (<><Spinner size="sm" animation="border" className="me-2"/>Đang lưu...</>) : (<><FaSave className="me-2"/>Lưu</>)}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CategoryForm;
