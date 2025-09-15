import React from 'react';
import { Table, Badge, ProgressBar } from 'react-bootstrap';
import { FaStore, FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

interface BranchPerformance {
  branchId: number;
  branchName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderDensity: number;
  utilizationRate: number;
  ranking: number;
  performance: 'high' | 'medium' | 'low';
}

interface BranchRankingTableProps {
  branches: BranchPerformance[];
}

const BranchRankingTable: React.FC<BranchRankingTableProps> = ({ branches }) => {
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

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'secondary';
    }
  };

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return <FaTrophy className="text-warning" />;
      case 2: return <FaMedal className="text-secondary" />;
      case 3: return <FaAward className="text-danger" />;
      default: return null;
    }
  };

  const getRankingBadgeColor = (ranking: number) => {
    switch (ranking) {
      case 1: return 'warning';
      case 2: return 'secondary';
      case 3: return 'danger';
      default: return 'dark';
    }
  };

  return (
    <div className="branch-ranking-table">
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Xếp hạng</th>
            <th>Chi nhánh</th>
            <th>Đơn hàng</th>
            <th>Doanh thu</th>
            <th>Đơn giá TB</th>
            <th>Mật độ</th>
            <th>Tỷ lệ tận dụng</th>
            <th>Hiệu suất</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.branchId} className="branch-row">
              <td>
                <div className="d-flex align-items-center gap-2">
                  {getRankingIcon(branch.ranking)}
                  <Badge bg={getRankingBadgeColor(branch.ranking)}>
                    #{branch.ranking}
                  </Badge>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="branch-icon me-2">
                    <FaStore />
                  </div>
                  <div>
                    <div className="branch-name">{branch.branchName}</div>
                    <small className="text-muted">ID: {branch.branchId}</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-center">
                  <strong>{formatNumber(branch.totalOrders)}</strong>
                  <div className="text-muted">
                    <small>đơn hàng</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-center">
                  <strong>{formatCurrency(branch.totalRevenue)}</strong>
                  <div className="text-muted">
                    <small>VND</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-center">
                  <strong>{formatCurrency(branch.averageOrderValue)}</strong>
                  <div className="text-muted">
                    <small>VND/đơn</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <ProgressBar 
                    now={branch.orderDensity} 
                    className="me-2" 
                    style={{ width: '60px', height: '8px' }}
                    variant={branch.orderDensity > 80 ? 'success' : branch.orderDensity > 60 ? 'warning' : 'danger'}
                  />
                  <span className="percentage-text">{formatPercentage(branch.orderDensity)}</span>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <ProgressBar 
                    now={branch.utilizationRate} 
                    className="me-2" 
                    style={{ width: '60px', height: '8px' }}
                    variant={branch.utilizationRate > 80 ? 'success' : branch.utilizationRate > 60 ? 'warning' : 'danger'}
                  />
                  <span className="percentage-text">{formatPercentage(branch.utilizationRate)}</span>
                </div>
              </td>
              <td>
                <Badge bg={getPerformanceColor(branch.performance)}>
                  {getPerformanceText(branch.performance)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BranchRankingTable;
