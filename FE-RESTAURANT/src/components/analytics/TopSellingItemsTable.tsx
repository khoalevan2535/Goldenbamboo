import React from 'react';
import { Table, Badge, ProgressBar } from 'react-bootstrap';
import { FaUtensils, FaCrown, FaMedal, FaAward } from 'react-icons/fa';

interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

interface TopSellingItemsTableProps {
  items: TopSellingItem[];
}

const TopSellingItemsTable: React.FC<TopSellingItemsTableProps> = ({ items }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRankingIcon = (index: number) => {
    switch (index) {
      case 0: return <FaCrown className="text-warning" />;
      case 1: return <FaMedal className="text-secondary" />;
      case 2: return <FaAward className="text-danger" />;
      default: return null;
    }
  };

  const getRankingBadgeColor = (index: number) => {
    switch (index) {
      case 0: return 'warning';
      case 1: return 'secondary';
      case 2: return 'danger';
      default: return 'dark';
    }
  };

  const getTrendColor = (percentage: number) => {
    if (percentage > 10) return 'success';
    if (percentage > 5) return 'warning';
    return 'info';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage > 10) return '🔥';
    if (percentage > 5) return '📈';
    return '📊';
  };

  return (
    <div className="top-selling-items-table">
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Tên món</th>
            <th>Số lượng</th>
            <th>Doanh thu</th>
            <th>Tỷ lệ</th>
            <th>Xu hướng</th>
            <th>Hiệu suất</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="item-row">
              <td>
                <div className="d-flex align-items-center gap-2">
                  {getRankingIcon(index)}
                  <Badge bg={getRankingBadgeColor(index)}>
                    #{index + 1}
                  </Badge>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="dish-icon me-2">
                    <FaUtensils />
                  </div>
                  <div>
                    <div className="dish-name">{item.name}</div>
                    <small className="text-muted">
                      {formatNumber(item.quantity)} đơn vị
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-center">
                  <strong>{formatNumber(item.quantity)}</strong>
                  <div className="text-muted">
                    <small>lượt bán</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-center">
                  <strong>{formatCurrency(item.revenue)}</strong>
                  <div className="text-muted">
                    <small>VND</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <ProgressBar 
                    now={item.percentage} 
                    className="me-2" 
                    style={{ width: '60px', height: '8px' }}
                    variant={item.percentage > 10 ? 'success' : item.percentage > 5 ? 'warning' : 'info'}
                  />
                  <span className="percentage-text">{formatPercentage(item.percentage)}</span>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <span className="trend-icon">{getTrendIcon(item.percentage)}</span>
                  <Badge bg={getTrendColor(item.percentage)}>
                    {item.percentage > 10 ? 'Bán chạy' : item.percentage > 5 ? 'Ổn định' : 'Bình thường'}
                  </Badge>
                </div>
              </td>
              <td>
                <div className="text-center">
                  <div className="performance-indicator">
                    {item.percentage > 10 ? (
                      <Badge bg="success">Cao</Badge>
                    ) : item.percentage > 5 ? (
                      <Badge bg="warning">Trung bình</Badge>
                    ) : (
                      <Badge bg="info">Thấp</Badge>
                    )}
                  </div>
                  <div className="text-muted">
                    <small>
                      {item.percentage > 10 ? 'Hiệu quả cao' : 
                       item.percentage > 5 ? 'Hiệu quả trung bình' : 'Cần cải thiện'}
                    </small>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TopSellingItemsTable;
