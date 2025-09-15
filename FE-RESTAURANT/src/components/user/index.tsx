import React from "react";
import { Link } from "react-router-dom";
import "../../style/client/HomeClient.scss";

const index: React.FC = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>GOLDENBAMBOO</h1>
          <h2>Ẩm Thực Việt Nam Truyền Thống</h2>
          <div className="hero-buttons">
            <Link to="/Client/Reservation" className="primary-button">
              Đặt Bàn
            </Link>
            <Link to="/Client/Menu" className="secondary-button">
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
          <Link to="/Client/About" className="text-link">
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
              src="https://images.unsplash.com/photo-1609501676725-7186f017a4b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
              alt="Gỏi Cuốn"
            />
            <h3>Gỏi Cuốn</h3>
            <p>Chả giò tươi với tôm, rau thơm và bún gạo</p>
          </div>
          <div className="featured-dish">
            <img
              src="https://images.unsplash.com/photo-1609501676725-7186f017a4b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
              alt="Bánh Kem"
            />
            <h3>Bánh Ngọt</h3>
            <p> Bánh Ngọt </p>
          </div>
        </div>
        <Link to="/Client/Menu" className="view-all-link">
          Xem Toàn Bộ Thực Đơn
        </Link>
      </div>

      {/* Reservation Banner Section */}
      <div className="reservation-banner">
        <div className="reservation-content">
          <h2>Trải Nghiệm Ẩm Thực Việt Nam Đích Thực</h2>
          <p>Tham gia cùng chúng tôi để thưởng thức hương vị Việt Nam vào bữa trưa hoặc bữa tối</p>
          <Link to="/Client/Reservation" className="reservation-button">
            Đặt Bàn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default index;