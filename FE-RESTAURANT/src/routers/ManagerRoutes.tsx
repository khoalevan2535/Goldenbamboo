import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts & Pages
import ManagerLayout from "../layouts/ManagerLayout";
import DashboardPage from "../pages/DashboardPage";
import StaffOrderPage from "../pages/StaffOrderPage";
import StaffOrderManagementPage from "../pages/StaffOrderManagementPage";
import TableListPage from "../pages/table-management/TableListPage";
import TableCreatePage from "../pages/table-management/TableCreatePage";
import TableEditPage from "../pages/table-management/TableEditPage";
import AnalyticsPage from "../pages/AnalyticsPage";

// Components
import RequireRole from "../components/RequireRole";
import { LoadingSpinner } from "../components/LoadingSpinner";

// Lazy load các pages để tăng tốc navigation
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const CategoryCreatePage = lazy(() => import("../pages/category-management/CategoryCreatePage"));
const CategoryEditPage = lazy(() => import("../pages/category-management/CategoryEditPage"));
const DishListPage = lazy(() => import("../pages/DishListPage"));
const DishCreatePage = lazy(() => import("../pages/dish-management/DishCreatePage"));
const DishEditPage = lazy(() => import("../pages/dish-management/DishEditPage"));
const ComboListPage = lazy(() => import("../pages/ComboListPage"));
const ComboCreatePage = lazy(() => import("../pages/combo-management/ComboCreatePage"));
const ComboEditPage = lazy(() => import("../pages/combo-management/ComboEditPage"));
const DiscountListPage = lazy(() => import("../pages/discount-management/DiscountListPage"));
const DiscountHistoryPage = lazy(() => import("../pages/discount-management/DiscountHistoryPage"));
const CreateDiscountPage = lazy(() => import("../pages/discount-management/CreateDiscountPage"));
const CreateVoucherPage = lazy(() => import("../pages/discount-management/CreateVoucherPage"));
const VoucherManagementPage = lazy(() => import("../pages/discount-management/VoucherManagementPage"));
const VoucherUsageHistoryPage = lazy(() => import("../pages/discount-management/VoucherUsageHistoryPage"));
const StaffManagementPage = lazy(() => import("../pages/StaffManagementPage"));
const ManagerStaffCreatePage = lazy(() => import("../pages/ManagerStaffCreatePage"));
const ManagerAccountPage = lazy(() => import("../pages/ManagerAccountPage"));
const TestComboAPI = lazy(() => import("../pages/test/TestComboAPI"));
const TestComboList = lazy(() => import("../pages/test/TestComboList"));
const TestDishAPI = lazy(() => import("../pages/test/TestDishAPI"));
const TestVoucherUsageHistoryAPI = lazy(() => import("../pages/test/TestVoucherUsageHistoryAPI"));
const TestDiscountAPI = lazy(() => import("../pages/test/TestDiscountAPI"));

// Loading component cho lazy loading
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
    <LoadingSpinner />
  </div>
);

export default function ManagerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireRole allowedRoles={["ROLE_MANAGER"]} />}>
        <Route element={<ManagerLayout />}>
          {/* Trang mặc định của manager, tự động chuyển đến dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Vận hành hàng ngày */}
          <Route path="order" element={<StaffOrderPage />} />
          <Route path="listorder" element={<StaffOrderManagementPage />} />
          <Route path="tables" element={<TableListPage />} />
          <Route path="tables/create" element={<TableCreatePage />} />
          <Route path="tables/:id/edit" element={<TableEditPage />} />
          
          {/* Quản lý chi nhánh */}
          <Route path="categories" element={
            <Suspense fallback={<PageLoader />}>
              <CategoryPage />
            </Suspense>
          } />
          <Route path="categories/create" element={
            <Suspense fallback={<PageLoader />}>
              <CategoryCreatePage />
            </Suspense>
          } />
          <Route path="categories/:id/edit" element={
            <Suspense fallback={<PageLoader />}>
              <CategoryEditPage />
            </Suspense>
          } />
          <Route path="dishes" element={
            <Suspense fallback={<PageLoader />}>
              <DishListPage />
            </Suspense>
          } />
          <Route path="dishes/create" element={
            <Suspense fallback={<PageLoader />}>
              <DishCreatePage />
            </Suspense>
          } />
          <Route path="dishes/:id/edit" element={
            <Suspense fallback={<PageLoader />}>
              <DishEditPage />
            </Suspense>
          } />
          <Route path="combos" element={
            <Suspense fallback={<PageLoader />}>
              <ComboListPage />
            </Suspense>
          } />
          <Route path="combos/create" element={
            <Suspense fallback={<PageLoader />}>
              <ComboCreatePage />
            </Suspense>
          } />
          <Route path="combos/:id/edit" element={
            <Suspense fallback={<PageLoader />}>
              <ComboEditPage />
            </Suspense>
          } />
          <Route path="staff" element={
            <Suspense fallback={<PageLoader />}>
              <StaffManagementPage />
            </Suspense>
          } />
          <Route path="staff/create" element={
            <Suspense fallback={<PageLoader />}>
              <ManagerStaffCreatePage />
            </Suspense>
          } />
          <Route path="account" element={
            <Suspense fallback={<PageLoader />}>
              <ManagerAccountPage />
            </Suspense>
          } />
          <Route path="discounts" element={
            <Suspense fallback={<PageLoader />}>
              <DiscountListPage />
            </Suspense>
          } />
          <Route path="discounts/history" element={
            <Suspense fallback={<PageLoader />}>
              <DiscountHistoryPage />
            </Suspense>
          } />
          <Route path="discounts/create/:itemType/:itemId" element={
            <Suspense fallback={<PageLoader />}>
              <CreateDiscountPage />
            </Suspense>
          } />
          {/* Voucher routes - temporarily hidden */}
          {/* <Route path="vouchers" element={
            <Suspense fallback={<PageLoader />}>
              <VoucherManagementPage />
            </Suspense>
          } />
          <Route path="vouchers/create/:itemType/:itemId" element={
            <Suspense fallback={<PageLoader />}>
              <CreateVoucherPage />
            </Suspense>
          } />
          <Route path="voucher-history" element={
            <Suspense fallback={<PageLoader />}>
              <VoucherUsageHistoryPage />
            </Suspense>
          } /> */}
          
          {/* Báo cáo */}
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* Test pages */}
          <Route path="test-combo-api" element={
            <Suspense fallback={<PageLoader />}>
              <TestComboAPI />
            </Suspense>
          } />
          <Route path="test-combo-list" element={
            <Suspense fallback={<PageLoader />}>
              <TestComboList />
            </Suspense>
          } />
          <Route path="test-dish-api" element={
            <Suspense fallback={<PageLoader />}>
              <TestDishAPI />
            </Suspense>
          } />
          <Route path="test-voucher-history-api" element={
            <Suspense fallback={<PageLoader />}>
              <TestVoucherUsageHistoryAPI />
            </Suspense>
          } />
          <Route path="test-discount-api" element={
            <Suspense fallback={<PageLoader />}>
              <TestDiscountAPI />
            </Suspense>
          } />
        </Route>
      </Route>
      
      {/* Route bắt các đường dẫn không hợp lệ trong /staff/* */}
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
