import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HomeService } from "../../services/HomeService";
import type { FeaturedDish } from "../../services/HomeService";
import { ClientMenuService } from "../../services/ClientMenuService";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
// Removed AddToCartButtonClient import - no longer using cart localStorage
import "../../style/client/HomeClient.scss";

const Home: React.FC = () => {
  const [featuredDishes, setFeaturedDishes] = useState<FeaturedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<{ [key: number]: number }>({});

  // Lấy 3 món ăn nổi bật khi component mount
  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        setLoading(true);
        const dishes = await HomeService.getFeaturedDishes();
        setFeaturedDishes(dishes);

        // Kiểm tra giảm giá cho từng món ăn
        const discountData: { [key: number]: number } = {};
        for (const dish of dishes) {
          try {
            const dishDiscounts = await ClientMenuService.getDishDiscounts(dish.id);
            if (dishDiscounts.length > 0) {
              const discountAmount = ClientMenuService.calculateDiscount(dish.price, dishDiscounts);
              const percentage = ClientMenuService.calculateDiscountPercentage(dish.price, discountAmount);
              discountData[dish.id] = percentage;
            }
          } catch (error) {
            console.error('Error checking discount for dish:', dish.id, error);
          }
        }
        setDiscounts(discountData);
      } catch (error) {
        console.error('Error fetching featured dishes:', error);
        toast.error('Không thể tải món ăn nổi bật');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDishes();
  }, []);

  // Removed createItemData - no longer using cart localStorage

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>GOLDENBAMBOO</h1>
          <h2>Ẩm Thực Việt Nam Truyền Thống</h2>
          <div className="hero-buttons">
            <Link to="/Reservation" className="primary-button">
              Đặt Bàn
            </Link>
            <Link to="/Menu" className="secondary-button">
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
          <Link to="/About" className="text-link">
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
        {loading ? (
          <div className="loading-dishes">
            <p>Đang tải món ăn...</p>
          </div>
        ) : (
          <div className="featured-dishes">
            {featuredDishes.map((dish) => {
              const discountPercentage = discounts[dish.id] || 0;
              const finalPrice = discountPercentage > 0 ? dish.price * (1 - discountPercentage / 100) : dish.price;

              return (
                <div key={dish.id} className="featured-dish">
                  <div className="dish-image">
                    <img
                      src={getImageUrl(dish.imageUrl)} // Thay đổi từ dish.image sang dish.imageUrl
                      alt={dish.name}
                      onError={handleImageError}
                    />
                    {dish.status && <div className="status-badge">Có sẵn</div>}
                    {discountPercentage > 0 && (
                      <div className="discount-badge">-{discountPercentage}%</div>
                    )}
                  </div>
                  <div className="dish-content">
                    <h3>{dish.name}</h3>
                    <p className="description">{dish.description || "Món ăn ngon"}</p>
                    <div className="dish-footer">
                      <div className="price-section">
                        {discountPercentage > 0 ? (
                          <>
                            <span className="original-price">{formatPrice(dish.price)}</span>
                            <span className="final-price">{formatPrice(finalPrice)}</span>
                          </>
                        ) : (
                          <span className="price">{formatPrice(dish.price)}</span>
                        )}
                      </div>
                      <div className="action-section">
                        {/* Removed AddToCartButtonClient - no longer using cart localStorage */}
                        <button className={dish.status ? "add-to-cart-btn" : "unavailable-btn"}>
                          {dish.status ? "Thêm vào giỏ" : "Hết hàng"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default Home;