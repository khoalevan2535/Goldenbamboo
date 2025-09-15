import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { 
  FaUtensils, 
  FaMoneyBillWave, 
  FaUsers, 
  FaTrendingUp,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  growth?: number;
  growthLabel?: string;
  formatValue?: (value: string | number) => string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color,
  growth,
  growthLabel = 'vs tuần trước',
  formatValue
}) => {
  const getGrowthColor = (growthValue?: number) => {
    if (!growthValue) return 'secondary';
    return growthValue >= 0 ? 'success' : 'danger';
  };

  const getGrowthIcon = (growthValue?: number) => {
    if (!growthValue) return <FaMinus />;
    return growthValue >= 0 ? <FaArrowUp /> : <FaArrowDown />;
  };

  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <Card className="kpi-card h-100">
      <Card.Body className="text-center">
        <div className={`kpi-icon-wrapper text-${color} mb-3`}>
          {icon}
        </div>
        <h3 className="kpi-value">{displayValue}</h3>
        <p className="kpi-label">{title}</p>
        {growth !== undefined && (
          <div className="d-flex justify-content-center align-items-center gap-2">
            <Badge bg={getGrowthColor(growth)} className="d-flex align-items-center gap-1">
              {getGrowthIcon(growth)}
              {Math.abs(growth).toFixed(1)}%
            </Badge>
            <small className="text-muted">{growthLabel}</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

interface KPICardsProps {
  orderStats: {
    totalOrders: number;
    todayOrders: number;
    weeklyOrders: number;
    monthlyOrders: number;
    averageOrderValue: number;
  };
  revenueStats: {
    totalRevenue: number;
    todayRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
  };
}

const KPICards: React.FC<KPICardsProps> = ({ orderStats, revenueStats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="kpi-cards">
      <div className="row">
        <div className="col-lg-3 col-md-6 mb-3">
          <KPICard
            title="Tổng đơn hàng"
            value={orderStats.totalOrders}
            icon={<FaUtensils size={32} />}
            color="primary"
            growth={12.5}
            formatValue={formatNumber}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <KPICard
            title="Tổng doanh thu"
            value={revenueStats.totalRevenue}
            icon={<FaMoneyBillWave size={32} />}
            color="success"
            growth={8.3}
            formatValue={formatCurrency}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <KPICard
            title="Đơn giá TB"
            value={orderStats.averageOrderValue}
            icon={<FaUsers size={32} />}
            color="warning"
            growth={5.2}
            formatValue={formatCurrency}
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <KPICard
            title="Tỷ lệ tận dụng"
            value="92%"
            icon={<FaTrendingUp size={32} />}
            color="info"
            growth={3.1}
          />
        </div>
      </div>
    </div>
  );
};

export default KPICards;
