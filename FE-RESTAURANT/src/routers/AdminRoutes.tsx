 
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts & Pages
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/DashboardPage";
import CategoryPage from "../pages/CategoryPage";
import DishListPage from "../pages/DishListPage";
import BranchPage from "../pages/BranchPage";
import AccountPage from "../pages/AccountPage";
import ComboListPage from "../pages/ComboListPage";
import DiscountListPage from "../pages/discount-management/DiscountListPage";
import VoucherUsageHistoryPage from "../pages/discount-management/VoucherUsageHistoryPage";

// Table Management
import TableListPage from "../pages/table-management/TableListPage";
import TableCreatePage from "../pages/table-management/TableCreatePage";
import TableEditPage from "../pages/table-management/TableEditPage";
import TableViewPage from "../pages/table-management/TableViewPage";
import TableHistoryPage from "../pages/table-management/TableHistoryPage";

import AccountManagementPage from "../pages/AccountManagementPage";
import AddStaffPage from "../pages/AddStaffPage";
import StaffCreatePage from "../pages/StaffCreatePage";
import UserManagementPage from "../pages/UserManagementPage";
import StaffManagementPage from "../pages/StaffManagementPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Components
import RequireRole from "../components/RequireRole";

// Category Management
import CategoryCreatePage from "../pages/category-management/CategoryCreatePage";
import CategoryEditPage from "../pages/category-management/CategoryEditPage";

// Dish Management
import DishCreatePage from "../pages/dish-management/DishCreatePage";
import DishEditPage from "../pages/dish-management/DishEditPage";

// Combo Management
import ComboCreatePage from "../pages/combo-management/ComboCreatePage";
import ComboEditPage from "../pages/combo-management/ComboEditPage";

// Branch Management
import BranchCreatePage from "../pages/branch-management/BranchCreatePage";
import BranchEditPage from "../pages/branch-management/BranchEditPage";

import PaymentSuccessPage from "../pages/PaymentSuccessPage";

// Discount Management - Removed unnecessary imports

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Trang mặc định của admin, tự động chuyển đến dashboard */}
        
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Các routes dành cho ADMIN */}
        <Route element={<RequireRole allowedRoles={["ROLE_ADMIN"]} />}>
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="account" element={<AccountPage />} />
          
          {/* Account Management */}
          <Route path="accounts" element={<AccountManagementPage />} />
          <Route path="add-staff" element={<AddStaffPage />} />
          
          {/* User Management - Only for Admin */}
          <Route path="users" element={<UserManagementPage />} />
          
          {/* Staff Management - Admin sees all, Manager sees branch staff */}
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="staff/create" element={<StaffCreatePage />} />
          
          {/* Category Management */}
          <Route path="categories" element={<CategoryPage />} />
          <Route path="categories/create" element={<CategoryCreatePage />} />
          <Route path="categories/:id/edit" element={<CategoryEditPage />} />
          
          {/* Dish Management */}
          <Route path="dishes" element={<DishListPage />} />
          <Route path="dishes/create" element={<DishCreatePage />} />
          <Route path="dishes/:id/edit" element={<DishEditPage />} />
          
          {/* Combo Management */}
          <Route path="combos" element={<ComboListPage />} />
          <Route path="combos/create" element={<ComboCreatePage />} />
          <Route path="combos/:id/edit" element={<ComboEditPage />} />
          
          {/* Branch Management */}
          <Route path="branches" element={<BranchPage />} />
          <Route path="branches/create" element={<BranchCreatePage />} />
          <Route path="branches/:id/edit" element={<BranchEditPage />} />
          
          <Route path="payment/success" element={<PaymentSuccessPage />} />
          
          {/* Discount Management */}
          <Route path="discounts" element={<DiscountListPage />} />
          
          {/* Voucher Usage History - temporarily hidden */}
          {/* <Route path="voucher-history" element={<VoucherUsageHistoryPage />} /> */}
          
          {/* Table Management */}
          <Route path="tables" element={<TableListPage />} />
          <Route path="tables/create" element={<TableCreatePage />} />
          <Route path="tables/:id/edit" element={<TableEditPage />} />
          <Route path="tables/:id/view" element={<TableViewPage />} />
          <Route path="tables/:id/history" element={<TableHistoryPage />} />
          <Route path="analytics" element={
            <ErrorBoundary>
              <AnalyticsPage />
            </ErrorBoundary>
          } />
          
        </Route>


      </Route>

      {/* Route bắt các đường dẫn không hợp lệ trong /admin/* */}
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
