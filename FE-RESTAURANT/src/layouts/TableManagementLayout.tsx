import React from 'react';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { FaTable, FaPlus, FaList } from 'react-icons/fa';

const TableManagementLayout: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const pathname = location.pathname;
    const items = [
      { name: 'Quản lý bàn', path: '/table-management', icon: <FaTable /> }
    ];

    if (pathname.includes('/create')) {
      items.push({ name: 'Tạo bàn mới', path: '/table-management/create', icon: <FaPlus /> });
    } else if (pathname.includes('/edit')) {
      items.push({ name: 'Sửa bàn', path: pathname, icon: <FaPlus /> });
    } else if (pathname.includes('/view')) {
      items.push({ name: 'Chi tiết bàn', path: pathname, icon: <FaList /> });
    } else if (pathname.includes('/history')) {
      items.push({ name: 'Lịch sử bàn', path: pathname, icon: <FaList /> });
    }

    return items;
  };

  return (
    <Container fluid className="p-0">
      {/* Header với Breadcrumb */}
      <div className="bg-white border-bottom p-3">
        <Breadcrumb className="mb-0">
          {getBreadcrumbItems().map((item, index) => (
            <Breadcrumb.Item
              key={index}
              linkAs={Link}
              linkProps={{ to: item.path }}
              active={index === getBreadcrumbItems().length - 1}
            >
              <span className="d-flex align-items-center">
                {item.icon}
                <span className="ms-2">{item.name}</span>
              </span>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <Outlet />
      </div>
    </Container>
  );
};

export default TableManagementLayout;
