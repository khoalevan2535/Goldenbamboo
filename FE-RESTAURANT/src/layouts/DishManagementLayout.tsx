import React from 'react';
import { Container, Breadcrumb } from 'react-bootstrap';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { FaUtensils, FaPlus, FaEdit } from 'react-icons/fa';

const DishManagementLayout: React.FC = () => {
  const location = useLocation();

  const items = [{ name: 'Quản lý món ăn', path: '/dish-management', icon: <FaUtensils /> }];
  if (location.pathname.includes('/create')) items.push({ name: 'Tạo mới', path: location.pathname, icon: <FaPlus /> });
  if (location.pathname.includes('/edit')) items.push({ name: 'Sửa món ăn', path: location.pathname, icon: <FaEdit /> });

  return (
    <Container fluid className="p-0">
      <div className="bg-white border-bottom p-3">
        <Breadcrumb className="mb-0">
          {items.map((item, idx) => (
            <Breadcrumb.Item
              key={idx}
              linkAs={Link}
              linkProps={{ to: item.path }}
              active={idx === items.length - 1}
            >
              <span className="d-flex align-items-center">
                {item.icon}
                <span className="ms-2">{item.name}</span>
              </span>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </Container>
  );
};

export default DishManagementLayout;
