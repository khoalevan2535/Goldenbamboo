import React from "react";
import { Link } from "react-router-dom";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaClock, 
  FaEnvelope, 
  FaFacebook, 
  FaInstagram 
} from "react-icons/fa";
import "../../style/client/footer.scss";

const Footer = () => {
  return (
    <footer className="w-full bg-dark text-white">
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl mb-4">GOLDENBAMBOO</h3>
            <p className="text-gray text-sm leading-relaxed">
              Ẩm thực Việt Nam đích thực được chế biến theo công thức truyền thống và nguyên liệu tươi ngon. Trải nghiệm hương vị Việt Nam trong từng miếng ăn.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-4">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 mr-2 text-secondary-warm flex-shrink-0 mt-0.5" />
                <span className="text-gray text-sm">
                Khu đô thị du lịch Marine Plaza 32C Khu BTLK Phường Bãi Cháy, gần Citadine Hotel, 
                  <br />
                  Tp. Hạ Long, Quảng Ninh 02033
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="h-5 w-5 mr-2 text-secondary-warm" />
                <a
                  href="tel:+84285551234"
                  className="text-gray text-sm hover:text-white transition-colors duration-300"
                >
                  (+84) 28 555 1234
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="h-5 w-5 mr-2 text-secondary-warm" />
                <a
                  href="mailto:info@goldenbamboo.com"
                  className="text-gray text-sm hover:text-white transition-colors duration-300"
                >
                  info@goldenbamboo.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-4">Giờ Mở Cửa</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaClock className="h-5 w-5 mr-2 text-secondary-warm flex-shrink-0 mt-0.5" />
                <div className="text-gray text-sm">
                  <p className="font-medium">Thứ Hai - Thứ Sáu</p>
                  <p>11:00 - 22:00</p>
                </div>
              </li>
              <li className="flex items-start">
                <FaClock className="h-5 w-5 mr-2 text-secondary-warm flex-shrink-0 mt-0.5" />
                <div className="text-gray text-sm">
                  <p className="font-medium">Thứ Bảy - Chủ Nhật</p>
                  <p>10:00 - 23:00</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-4">Theo Dõi Chúng Tôi</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://facebook.com"
                className="h-10 w-10 rounded-full bg-secondary-warm flex items-center justify-center hover:bg-primary-warm transition-colors duration-300"
              >
                <FaFacebook className="h-5 w-5 text-dark" />
              </a>
              <a
                href="https://instagram.com"
                className="h-10 w-10 rounded-full bg-secondary-warm flex items-center justify-center hover:bg-primary-warm transition-colors duration-300"
              >
                <FaInstagram className="h-5 w-5 text-dark" />
              </a>
            </div>
            <p className="text-gray text-sm">
              Đăng ký nhận bản tin để nhận ưu đãi đặc biệt và cập nhật mới nhất.
            </p>
            <Link
              to="/Client/Contact"
              className="text-gray text-sm hover:text-white transition-colors duration-300 mt-2 inline-block"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-dark mt-10 pt-6 text-center text-gray-dark text-sm">
          <p>
            © {new Date().getFullYear()} GOLDENBAMBOO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;