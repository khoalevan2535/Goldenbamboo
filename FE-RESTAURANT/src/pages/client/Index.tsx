import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../style/client/HomeClient.scss";

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Điều hướng dựa trên vai trò của người dùng
    if (user) {
      const role = user.role || 'ROLE_USER';
      const canonical = role && role.startsWith('ROLE_') ? role : (role?.toLowerCase() === 'admin' ? 'ROLE_ADMIN' : role?.toLowerCase() === 'manager' ? 'ROLE_MANAGER' : role?.toLowerCase() === 'staff' ? 'ROLE_STAFF' : role?.toLowerCase() === 'user' ? 'ROLE_USER' : role);
      const isAdmin = canonical === "ROLE_ADMIN";
      const isManager = canonical === "ROLE_MANAGER";
      const isStaff = canonical === "ROLE_STAFF";

      if (isAdmin) {
        navigate('/admin/dashboard');
      } else if (isManager) {
        navigate('/manager/dashboard');
      } else if (isStaff) {
        navigate('/staff/dashboard');
      } else {
        // Nếu là user thường, ở lại trang chủ
        console.log('User is regular customer, staying on home page');
      }
    } else {
      // Nếu chưa đăng nhập, ở lại trang chủ
      console.log('User not logged in, staying on home page');
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 
            onClick={handleLogoClick} 
            style={{ cursor: 'pointer' }}
            title="Click để điều hướng theo vai trò của bạn"
          >
            GOLDENBAMBOO
          </h1>
          <h2>Ẩm Thực Việt Nam Truyền Thống</h2>
          <div className="hero-buttons">
            <Link to="/reservation" className="primary-button">
              Đặt Bàn
            </Link>
            <Link to="/menu" className="secondary-button">
              Xem Thực Đơn
            </Link>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="intro-section">
        <div className="intro-content">
          <h2>Chào Mừng Đến Với GOLDENBAMBOO</h2>
          <p>
            Nằm tại trung tâm thành phố, GOLDENBAMBOO mang đến những hương vị đích thực của Việt Nam. Các công thức nấu ăn được lưu truyền qua nhiều thế hệ, giữ gìn di sản ẩm thực phong phú của Việt Nam.
          </p>
          <p>
            Từ phở thơm lừng đến gỏi cuốn tinh tế, mỗi món ăn được chế biến cẩn thận với kỹ thuật truyền thống và nguyên liệu tươi ngon nhất.
          </p>
          <Link to="/about" className="text-link">
            Tìm hiểu thêm về câu chuyện của chúng tôi
          </Link>
        </div>
        <div className="intro-image">
          <img
            src="https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
            alt="Ẩm thực Việt Nam"
          />
        </div>
      </div>

      {/* Featured Dishes Section */}
      <div className="featured-section">
        <h2>Món Ăn Đặc Trưng</h2>
        <div className="featured-dishes">
          <div className="featured-dish">
            <img
              src="https://images.unsplash.com/photo-1576577445504-6af96477db52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Phở Bò"
            />
            <h3>Phở Bò</h3>
            <p>Phở bò truyền thống với thảo mộc và gia vị thơm lừng</p>
          </div>
          <div className="featured-dish">
            <img
              src="/images/goicuon.jpg"
              alt="Gỏi Cuốn"
            />
            <h3>Gỏi Cuốn</h3>
            <p>Chả giò tươi với tôm, rau thơm và bún gạo</p>
          </div>
          <div className="featured-dish">
            <img
              src="/images/bunbo.jpg"
              alt="Bún Bò Huế "
            />
            <h3>Bún Bò Huế</h3>
            <p>Bún bò huế tươi ngon với nhiều hương vị hấp dẫn</p>
          </div>
        </div>
        <Link to="/menu" className="view-all-link">
          Xem Toàn Bộ Thực Đơn
        </Link>
      </div>

      {/* Reservation Banner Section */}
      <div className="reservation-banner">
        <div className="reservation-content">
          <h2>Trải Nghiệm Ẩm Thực Việt Nam Đích Thực</h2>
          <p>Tham gia cùng chúng tôi để thưởng thức hương vị Việt Nam vào bữa trưa hoặc bữa tối</p>
          <Link to="/reservation" className="reservation-button">
            Đặt Bàn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;