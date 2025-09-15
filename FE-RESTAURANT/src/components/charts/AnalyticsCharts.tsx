import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueByTimeData {
  hour: number;
  revenue: number;
  orders: number;
}

interface RevenueByBranchData {
  branchName: string;
  revenue: number;
  orders: number;
  averageOrder: number;
}

interface OrderTrendData {
  date: string;
  orders: number;
  revenue: number;
}

interface AnalyticsChartsProps {
  revenueByTime: RevenueByTimeData[];
  revenueByBranch: RevenueByBranchData[];
  orderTrends: OrderTrendData[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  revenueByTime,
  revenueByBranch,
  orderTrends,
}) => {
  // Revenue by Hour Chart
  const revenueByHourData = {
    labels: revenueByTime.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: revenueByTime.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Số đơn hàng',
        data: revenueByTime.map(item => item.orders),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const revenueByHourOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh Thu Theo Giờ',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Doanh thu (VND)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Số đơn hàng',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Revenue by Branch Chart
  const revenueByBranchData = {
    labels: revenueByBranch.map(item => item.branchName),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: revenueByBranch.map(item => item.revenue),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueByBranchOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh Thu Theo Chi Nhánh',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Doanh thu (VND)',
        },
      },
    },
  };

  // Order Trends Chart
  const orderTrendsData = {
    labels: orderTrends.map(item => item.date),
    datasets: [
      {
        label: 'Số đơn hàng',
        data: orderTrends.map(item => item.orders),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Doanh thu (VND)',
        data: orderTrends.map(item => item.revenue),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const orderTrendsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Xu Hướng Đơn Hàng',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Số đơn hàng',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Doanh thu (VND)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Branch Distribution Doughnut Chart
  const branchDistributionData = {
    labels: revenueByBranch.map(item => item.branchName),
    datasets: [
      {
        data: revenueByBranch.map(item => item.orders),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const branchDistributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Phân Bố Đơn Hàng Theo Chi Nhánh',
      },
    },
  };

  return (
    <div className="analytics-charts">
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="chart-card">
            <Line data={revenueByHourData} options={revenueByHourOptions} />
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="chart-card">
            <Doughnut data={branchDistributionData} options={branchDistributionOptions} />
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="chart-card">
            <Bar data={revenueByBranchData} options={revenueByBranchOptions} />
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="chart-card">
            <Line data={orderTrendsData} options={orderTrendsOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
