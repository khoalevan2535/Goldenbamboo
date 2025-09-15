import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Table, Badge } from 'react-bootstrap';
import { ComboService } from '../../services/ComboService';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const TestComboList: React.FC = () => {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCombos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading combos...');
      const response = await ComboService.getAll();
      console.log('Combos response:', response);
      setCombos(response.data || response || []);
    } catch (e: any) {
      console.error('Error loading combos:', e);
      setError(`Error: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const handleEdit = (combo: any) => {
    console.log('Edit combo:', combo);
    navigate(`/manager/combos/${combo.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/manager/combos/create');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Test Combo List</h1>
        <Button onClick={handleCreate} variant="primary">
          <FaPlus className="me-2" />
          Tạo Combo Mới
        </Button>
      </div>

      {loading && <Alert variant="info">Đang tải danh sách combo...</Alert>}
      
      {error && (
        <Alert variant="danger">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Danh sách Combo ({combos.length})</h5>
            <Button onClick={loadCombos} variant="outline-primary" size="sm">
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {combos.length === 0 ? (
            <Alert variant="warning">
              Không có combo nào trong database. Hãy tạo combo mới!
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Combo</th>
                  <th>Mô tả</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Số món</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {combos.map((combo) => (
                  <tr key={combo.id}>
                    <td>{combo.id}</td>
                    <td>{combo.name}</td>
                    <td>{combo.description || 'N/A'}</td>
                    <td>{combo.basePrice?.toLocaleString('vi-VN')} VNĐ</td>
                    <td>
                      <Badge bg={combo.operationalStatus === 'ACTIVE' ? 'success' : 'secondary'}>
                        {combo.operationalStatus === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </Badge>
                    </td>
                    <td>{combo.comboDishes?.length || 0}</td>
                    <td>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleEdit(combo)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button variant="danger" size="sm">
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Debug Info</h5>
        </Card.Header>
        <Card.Body>
          <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(combos, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TestComboList;


