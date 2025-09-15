import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MenuDisplay } from '../../components/user/MenuDisplay';
import type { MenuResponseDTO } from '../../interfaces';
import '../../components/user/MenuDisplay.css';

// Dữ liệu mẫu cho demo
const sampleMenu: MenuResponseDTO = {
  id: '1',
  name: 'Menu Khuyến Mãi Tháng 8',
  description: 'Thưởng thức các món ăn đặc biệt với giá ưu đãi trong tháng 8. Từ các món truyền thống đến hiện đại, tất cả đều được chế biến từ nguyên liệu tươi ngon nhất.',
  dishes: [
    {
      id: '1',
      dishId: '1',
      dishName: 'Gà Rán Giòn Cay',
      categoryId: 1,
      categoryName: 'Món Chính',
      price: 89000,
      sellingPrice: 79000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      dishId: '2',
      dishName: 'Burger Bò Phô Mai',
      categoryId: 1,
      categoryName: 'Món Chính',
      price: 125000,
      sellingPrice: 99000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      dishId: '3',
      dishName: 'Pizza Margherita',
      categoryId: 1,
      categoryName: 'Món Chính',
      price: 189000,
      sellingPrice: 159000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      dishId: '4',
      dishName: 'Khoai Tây Chiên',
      categoryId: 2,
      categoryName: 'Món Phụ',
      price: 45000,
      sellingPrice: 35000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      dishId: '5',
      dishName: 'Salad Caesar',
      categoryId: 2,
      categoryName: 'Món Phụ',
      price: 69000,
      sellingPrice: 55000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      dishId: '6',
      dishName: 'Kem Vanilla',
      categoryId: 3,
      categoryName: 'Tráng Miệng',
      price: 39000,
      sellingPrice: 29000,
      status: 'ACTIVE',
      operationalStatus: 'INACTIVE',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
    },
    {
      id: '7',
      dishId: '7',
      dishName: 'Bánh Chocolate',
      categoryId: 3,
      categoryName: 'Tráng Miệng',
      price: 59000,
      sellingPrice: 45000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      dishId: '8',
      dishName: 'Coca Cola',
      categoryId: 4,
      categoryName: 'Đồ Uống',
      price: 25000,
      sellingPrice: 20000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1581006852262-e1344394fb79?w=400&h=300&fit=crop'
    }
  ],
  combos: [
    {
      id: '1',
      comboId: '1',
      comboName: 'Combo Gà Rán Siêu Tiết Kiệm',
      price: 199000,
      sellingPrice: 149000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      description: 'Combo tiết kiệm dành cho 2-3 người với các món ăn ngon miệng và đồ uống thơm ngon.',
      comboDishes: [
        { dishId: '1', dishName: 'Gà Rán Giòn Cay', quantity: 2, price: 89000 },
        { dishId: '4', dishName: 'Khoai Tây Chiên', quantity: 1, price: 45000 },
        { dishId: '8', dishName: 'Coca Cola', quantity: 2, price: 25000 }
      ]
    },
    {
      id: '2',
      comboId: '2',
      comboName: 'Combo Burger Deluxe',
      price: 299000,
      sellingPrice: 239000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&h=300&fit=crop',
      description: 'Combo cao cấp với burger bò phô mai, salad tươi và kem tráng miệng.',
      comboDishes: [
        { dishId: '2', dishName: 'Burger Bò Phô Mai', quantity: 1, price: 125000 },
        { dishId: '5', dishName: 'Salad Caesar', quantity: 1, price: 69000 },
        { dishId: '4', dishName: 'Khoai Tây Chiên', quantity: 1, price: 45000 },
        { dishId: '6', dishName: 'Kem Vanilla', quantity: 1, price: 39000 },
        { dishId: '8', dishName: 'Coca Cola', quantity: 1, price: 25000 }
      ]
    },
    {
      id: '3',
      comboId: '3',
      comboName: 'Combo Pizza Party',
      price: 399000,
      sellingPrice: 299000,
      status: 'ACTIVE',
      operationalStatus: 'INACTIVE',
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop',
      description: 'Combo pizza lớn dành cho nhóm bạn với bánh ngọt và đồ uống.',
      comboDishes: [
        { dishId: '3', dishName: 'Pizza Margherita', quantity: 1, price: 189000 },
        { dishId: '7', dishName: 'Bánh Chocolate', quantity: 2, price: 59000 },
        { dishId: '8', dishName: 'Coca Cola', quantity: 3, price: 25000 }
      ]
    },
    {
      id: '4',
      comboId: '4',
      comboName: 'Combo Gia Đình Hạnh Phúc',
      price: 599000,
      sellingPrice: 459000,
      status: 'ACTIVE',
      operationalStatus: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      description: 'Combo lớn dành cho gia đình 4-6 người với đa dạng món ăn ngon.',
      comboDishes: [
        { dishId: '1', dishName: 'Gà Rán Giòn Cay', quantity: 3, price: 89000 },
        { dishId: '2', dishName: 'Burger Bò Phô Mai', quantity: 2, price: 125000 },
        { dishId: '3', dishName: 'Pizza Margherita', quantity: 1, price: 189000 },
        { dishId: '4', dishName: 'Khoai Tây Chiên', quantity: 2, price: 45000 },
        { dishId: '5', dishName: 'Salad Caesar', quantity: 1, price: 69000 },
        { dishId: '8', dishName: 'Coca Cola', quantity: 4, price: 25000 }
      ]
    }
  ]
};

const MenuDemoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-display">
      {/* Back Button */}
      <Container className="py-3">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="mb-3"
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
        
        <div className="alert alert-info">
          <strong>📋 Demo Menu Display</strong><br />
          Đây là giao diện demo cho việc hiển thị menu cho khách hàng. 
          Giao diện bao gồm phân tab Món lẻ/Combo, lọc theo danh mục, và xem chi tiết combo.
        </div>
      </Container>

      {/* Menu Display */}
      <MenuDisplay menu={sampleMenu} />
    </div>
  );
};

export default MenuDemoPage;
