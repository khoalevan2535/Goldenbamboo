import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import StaffLayoutNew from "../layouts/StaffLayoutNew";
import { LoadingSpinner } from "../components/LoadingSpinner";

// Lazy load các pages để tăng tốc navigation
const StaffOrderPage = lazy(() => import("../pages/staff/StaffOrderPage"));
const StaffOrderManagementPage = lazy(() => import("../pages/staff/StaffOrderManagementPage"));
const StaffOrderHistoryPage = lazy(() => import("../pages/staff/StaffOrderHistoryPage"));
const StaffOrderTestPage = lazy(() => import("../pages/staff/StaffOrderTestPage"));
const StaffDiscountTestPage = lazy(() => import("../pages/staff/StaffDiscountTestPage"));
const StaffDatabaseCheckPage = lazy(() => import("../pages/staff/StaffDatabaseCheckPage"));
const StaffSetDiscountTestPage = lazy(() => import("../pages/staff/StaffSetDiscountTestPage"));
const StaffDiscountDebugPage = lazy(() => import("../pages/staff/StaffDiscountDebugPage"));
const StaffApiTestPage = lazy(() => import("../pages/staff/StaffApiTestPage"));
const StaffSimpleApiTestPage = lazy(() => import("../pages/staff/StaffSimpleApiTestPage"));
const StaffDiscountFlowTestPage = lazy(() => import("../pages/staff/StaffDiscountFlowTestPage"));
const StaffDiscountCheckPage = lazy(() => import("../pages/staff/StaffDiscountCheckPage"));
const StaffDashboard = lazy(() => import("../pages/staff/StaffDashboard"));
const StaffDishesPage = lazy(() => import("../pages/staff/StaffDishesPage"));
const StaffCombosPage = lazy(() => import("../pages/staff/StaffCombosPage"));
const TestOrderData = lazy(() => import("../pages/test/TestOrderData"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Components
import RequireRole from "../components/RequireRole";

// Loading component cho lazy loading
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
    <LoadingSpinner />
  </div>
);

export default function StaffRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireRole allowedRoles={["ROLE_STAFF"]} />}>
        {/* Layout mới giống admin/manager - Mặc định */}
        <Route element={<StaffLayoutNew />}>
            {/* Redirect to dashboard as default */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* 1. Dashboard */}
            <Route path="dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <StaffDashboard />
              </Suspense>
            } />
            
            {/* 2. Tạo đơn hàng */}
            <Route path="order" element={
              <Suspense fallback={<PageLoader />}>
                <StaffOrderPage />
              </Suspense>
            } />
            
            {/* 3. Quản lý đơn hàng */}
            <Route path="order-management" element={
              <Suspense fallback={<PageLoader />}>
                <StaffOrderManagementPage />
              </Suspense>
            } />
            
            {/* 4. Lịch sử đơn hàng */}
            <Route path="order-history" element={
              <Suspense fallback={<PageLoader />}>
                <StaffOrderHistoryPage />
              </Suspense>
            } />
            
            {/* 5. Test API */}
            <Route path="test-orders" element={
              <Suspense fallback={<PageLoader />}>
                <StaffOrderTestPage />
              </Suspense>
            } />
            
            {/* 6. Test Discount */}
            <Route path="test-discount" element={
              <Suspense fallback={<PageLoader />}>
                <StaffDiscountTestPage />
              </Suspense>
            } />
            
            {/* 7. Set Discount Test */}
            <Route path="set-discount" element={
              <Suspense fallback={<PageLoader />}>
                <StaffSetDiscountTestPage />
              </Suspense>
            } />
            
            {/* 8. Discount Debug */}
            <Route path="discount-debug" element={
              <Suspense fallback={<PageLoader />}>
                <StaffDiscountDebugPage />
              </Suspense>
            } />
            
            {/* 9. API Test */}
            <Route path="api-test" element={
              <Suspense fallback={<PageLoader />}>
                <StaffApiTestPage />
              </Suspense>
            } />
            
            {/* 10. Simple API Test */}
            <Route path="simple-api-test" element={
              <Suspense fallback={<PageLoader />}>
                <StaffSimpleApiTestPage />
              </Suspense>
            } />
            
            {/* 11. Discount Flow Test */}
          <Route path="discount-flow-test" element={
            <Suspense fallback={<PageLoader />}>
              <StaffDiscountFlowTestPage />
            </Suspense>
          } />
          
          {/* 12. Discount Check */}
          <Route path="discount-check" element={
            <Suspense fallback={<PageLoader />}>
              <StaffDiscountCheckPage />
            </Suspense>
          } />
          <Route path="discount-test" element={
            <Suspense fallback={<PageLoader />}>
              <StaffDiscountTestPage />
            </Suspense>
          } />
          <Route path="database-check" element={
            <Suspense fallback={<PageLoader />}>
              <StaffDatabaseCheckPage />
            </Suspense>
          } />
          <Route path="discount-test" element={
            <Suspense fallback={<PageLoader />}>
              <StaffDiscountTestPage />
            </Suspense>
          } />
            
            {/* 12. Danh sách món ăn */}
            <Route path="dishes" element={
              <Suspense fallback={<PageLoader />}>
                <StaffDishesPage />
              </Suspense>
            } />
            
            {/* 13. Danh sách combo */}
            <Route path="combos" element={
              <Suspense fallback={<PageLoader />}>
                <StaffCombosPage />
              </Suspense>
            } />
            
            {/* 14. Test Order Data */}
            <Route path="test-order-data" element={
              <Suspense fallback={<PageLoader />}>
                <TestOrderData />
              </Suspense>
            } />
            
        </Route>
      </Route>
      <Route path="*" element={
        <Suspense fallback={<PageLoader />}>
          <NotFoundPage />
        </Suspense>
      } />
    </Routes>
  );
}