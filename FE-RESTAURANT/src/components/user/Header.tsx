import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../../style/client/header.scss";
// Removed cartStoreClient import - no longer using cart localStorage
import { useAuth } from "../../hooks/useAuth";
// Removed ShoppingCartIcon import - no longer using cart localStorage

const ClientHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Removed useCartClient - no longer using cart localStorage
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang Chủ", path: "/home" },
    { name: "Về chúng tôi", path: "/about" },
    { name: "Thực Đơn", path: "/menu" },
    { name: "Đặt Hàng", path: "/order" },
    { name: "Đặt Bàn", path: "/reservation" },
    { name: "Liên Hệ", path: "/contact" },
  ];

  const accountLinks = [
    { name: "Đăng Nhập", path: "/login" },
    { name: "Đăng Ký", path: "/register" },
    { name: "Thông Tin Tài Khoản", path: "/user-info" },
  ];

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
    setIsOpen(false);
  };

  const handleLogoClick = () => {
    // Điều hướng dựa trên vai trò của người dùng
    if (isAuthenticated && user) {
      
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
    <nav className={`fixed w-full z-10 transition-all duration-300 ${scrolled ? "bg-background-cream shadow-md py-2" : "bg-transparent py-6"}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <div
          onClick={handleLogoClick}
          className="text-primary-warm font-serif text-2xl md:text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
          title="Click để điều hướng theo vai trò của bạn"
        >
          GOLDENBAMBOO
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm uppercase tracking-wider font-medium transition-colors duration-300 relative ${location.pathname === link.path ? "text-primary-warm border-b-2 border-primary-warm" : "text-gray hover:text-primary-warm"}`}
            >
              {link.name}
            </Link>
          ))}
          {/* Removed ShoppingCartIcon - no longer using cart localStorage */}
          <div className="dropdown">
            <button
              className="text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm transition-colors duration-300"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaUser className="me-2" />
              {isAuthenticated ? (user?.sub || 'Tài khoản') : 'Account'}
            </button>
            <ul className="dropdown-menu">
              {isAuthenticated ? (
                <>
                  <li className="dropdown-item">
                    <div className="dropdown-link text-sm text-gray px-3 py-2">
                      Xin chào, {user?.sub || 'Người dùng'}
                    </div>
                  </li>
                  <li className="dropdown-item">
                    <Link
                      to="/user-info"
                      className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm"
                      onClick={() => setIsOpen(false)}
                    >
                      Thông Tin Tài Khoản
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link
                      to="/orders"
                      className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm"
                      onClick={() => setIsOpen(false)}
                    >
                      Đơn hàng của tôi
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <button
                      onClick={handleLogout}
                      className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm w-100 text-start border-0 bg-transparent"
                    >
                      <FaSignOutAlt className="me-2" />
                      Đăng xuất
                    </button>
                  </li>
                </>
              ) : (
                accountLinks.map((link, index) => (
                  <li key={index} className="dropdown-item">
                    <Link
                      to={link.path}
                      className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="text-primary-warm"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background-cream shadow-md py-4 animate-fadeIn">
          <div className="container mx-auto px-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm uppercase tracking-wider font-medium py-2 transition-colors duration-300 relative ${location.pathname === link.path ? "text-primary-warm border-l-4 border-primary-warm pl-4" : "text-gray hover:text-primary-warm pl-4"}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center pl-4 py-2">
              {/* Removed ShoppingCartIcon - no longer using cart localStorage */}
            </div>
            <div className="dropdown">
              <button
                className="text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm transition-colors duration-300 py-2 pl-4 w-full text-left"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FaUser className="me-2" />
                {isAuthenticated ? (user?.sub || 'Tài khoản') : 'Account'}
              </button>
              <ul className="dropdown-menu w-full">
                {isAuthenticated ? (
                  <>
                    <li className="dropdown-item">
                      <div className="dropdown-link text-sm text-gray px-3 py-2">
                        Xin chào, {user?.sub || 'Người dùng'}
                      </div>
                    </li>
                    <li className="dropdown-item">
                      <Link
                        to="/user-info"
                        className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm"
                        onClick={() => setIsOpen(false)}
                      >
                        Thông Tin Tài Khoản
                      </Link>
                    </li>
                    <li className="dropdown-item">
                      <Link
                        to="/orders"
                        className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm"
                        onClick={() => setIsOpen(false)}
                      >
                        Đơn hàng của tôi
                      </Link>
                    </li>
                    <li className="dropdown-item">
                      <button
                        onClick={handleLogout}
                        className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm w-100 text-start border-0 bg-transparent"
                      >
                        <FaSignOutAlt className="me-2" />
                        Đăng xuất
                      </button>
                    </li>
                  </>
                ) : (
                  accountLinks.map((link, index) => (
                    <li key={index} className="dropdown-item">
                      <Link
                        to={link.path}
                        className="dropdown-link text-sm uppercase tracking-wider font-medium text-gray hover:text-primary-warm"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ClientHeader;
