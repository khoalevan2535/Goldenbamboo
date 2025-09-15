import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Routers chuyên biệt
import AdminRoutes from "./AdminRoutes";
import ManagerRoutes from "./ManagerRoutes";
import StaffRoutes from "./StaffRoutes";
import ClientRouter from "./ClientRouter";

// Pages
import Home from "../pages/client/Index";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/Register";

import NotFoundPage from "../pages/NotFoundPage";
import OAuth2SuccessPage from "../pages/OAuth2SuccessPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import AccountPage from "../pages/AccountPage";
import ActivateAccountPage from "../pages/ActivateAccountPage";
import MenuDemoPage from "../pages/user/MenuDemoPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import UserInfo from "../pages/client/UserInfo";
import DeliveryAddressPage from "../pages/DeliveryAddressPage";

// Layouts
import ClientLayout from "../layouts/ClientLayout";
import AdminLayout from "../layouts/AdminLayout";

// Components
import RequireAuth from "../components/RequireAuth";
import { Search } from "react-bootstrap-icons";
import MenuPage from "../pages/client/MenuPage";
import ClientOrderPage from "../pages/client/ClientOrderPage";
import Account from "../pages/client/Account";
import AboutPage from "../pages/client/AboutPage";
import ReservationPage from "../pages/client/ReservationPage";
import ContractPage from "../pages/client/ContractPage";
import CheckoutPage from "../pages/client/CheckoutPage";
// Removed CartPage import - no longer using cart localStorage
import OrderHistoryPage from "../pages/client/OrderHistoryPage";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import PaymentCancel from "../pages/payment/PaymentCancel";
// import Search from "../components/user/Search";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/user-info" element={<UserInfo />} />
        
        {/* Payment Routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* User & Public Routes within Layout */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="order" element={<ClientOrderPage />} />
          <Route path="reservation" element={<ReservationPage />} />
          <Route path="contact" element={<ContractPage />} />
          {/* Removed cart route - no longer using cart localStorage */}
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="account" element={<Account />} />
          <Route path="search" element={<Search />} />
          <Route path="menu-demo" element={<MenuDemoPage />} />
          {/* Các trang public khác có thể thêm ở đây */}
        </Route>

        {/* Protected Routes - Phân luồng theo vai trò */}
        <Route element={<RequireAuth />}>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/manager/*" element={<ManagerRoutes />} />
          <Route path="/staff/*" element={<StaffRoutes />} />
          <Route path="/me" element={<AdminLayout />}>
            <Route index element={<AccountPage />} />
          </Route>
          <Route path="/delivery-addresses" element={<AdminLayout />}>
            <Route index element={<DeliveryAddressPage />} />
          </Route>
        </Route>


        {/* Nếu có các trang chung cho tất cả user đã đăng nhập, đặt ở đây */}

        {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
