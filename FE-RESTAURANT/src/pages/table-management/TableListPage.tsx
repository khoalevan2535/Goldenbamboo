import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Form,
  Spinner,
  Button,
  Alert,
  Badge,
  Table,
  Pagination,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { TableService } from '../../services/TableService';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { type TableResponseDTO } from '../../interfaces/TableResponseDTO';

const TableListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth() as any;
  
  // Data states
  const [tables, setTables] = useState<TableResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  
  // Areas data
  const [areas, setAreas] = useState<string[]>([]);

  // Load tables
  useEffect(() => {
    loadTables();
  }, []);

  // Load areas
  useEffect(() => {
    loadAreas();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await TableService.getAll();
      setTables(response.data || response);
    } catch (err) {
      console.error('Error loading tables:', err);
      setError('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await TableService.getAll();
      const tables = response.data || response;
      const uniqueAreas = [...new Set(tables.map((table: TableResponseDTO) => table.area))];
      setAreas(uniqueAreas);
    } catch (err) {
      console.error('Error loading areas:', err);
    }
  };

  // Filter tables
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = !areaFilter || table.area === areaFilter;
    const matchesStatus = !statusFilter || table.status === statusFilter;
    
    return matchesSearch && matchesArea && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTables.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedTables = filteredTables.slice(startIndex, startIndex + pageSize);

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'AVAILABLE': 'success',
      'OCCUPIED': 'warning',
      'RESERVED': 'info',
      'MAINTENANCE': 'danger'
    };
    
    const labels: Record<string, string> = {
      'AVAILABLE': 'Có sẵn',
      'OCCUPIED': 'Đang sử dụng',
      'RESERVED': 'Đã đặt',
      'MAINTENANCE': 'Bảo trì'
    };

    return (
      <Badge bg={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Delete table
  const handleDeleteTable = (tableId: number) => {
    setTableToDelete(tableId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!tableToDelete) return;
    
    try {
      await TableService.delete(tableToDelete);
      toast.success('Xóa bàn thành công!');
      loadTables();
    } catch (err) {
      console.error('Error deleting table:', err);
      toast.error('Không thể xóa bàn');
    } finally {
      setShowConfirmModal(false);
      setTableToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý bàn</h1>
        {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && (
          <Button onClick={() => navigate('/manager/tables/create')}>
            <FaPlus className="me-2" /> 
            Thêm mới
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="mb-3 g-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm theo tên bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="">Tất cả khu vực</option>
            {areas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="OCCUPIED">Đang sử dụng</option>
            <option value="RESERVED">Đã đặt</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Tên bàn</th>
            <th>Khu vực</th>
            <th>Sức chứa</th>
            <th>Trạng thái</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : filteredTables.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                Không tìm thấy bàn nào.
              </td>
            </tr>
          ) : (
            paginatedTables.map((table) => (
              <tr key={table.id}>
                <td>{table.id}</td>
                <td>{table.name}</td>
                <td>{table.area}</td>
                <td>{table.seats} người</td>
                <td>
                  {getStatusBadge(table.status)}
                </td>
                <td className="text-center">
                  {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && (
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => navigate(`/manager/tables/${table.id}/edit`)}
                    >
                      <FaEdit />
                    </Button>
                  )}
                  {(role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') && (
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Xóa</Tooltip>}
                    >
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <FaTrash />
                      </Button>
                    </OverlayTrigger>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination - Đồng bộ với backend (0-based) */}
      {filteredTables.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(0)} 
              disabled={currentPage === 0}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(currentPage - 1)} 
              disabled={currentPage === 0}
            />
            
            {/* Hiển thị số trang (0-based -> 1-based cho UI) */}
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={currentPage === totalPages - 1}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages - 1)} 
              disabled={currentPage === totalPages - 1}
            />
          </Pagination>
        </div>
      )}

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa bàn"
        message="Bạn có chắc chắn muốn xóa bàn này không?"
      />
    </div>
  );
};

export default TableListPage;