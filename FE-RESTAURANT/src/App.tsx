import React, { useEffect } from "react";
import AppRoutes from "./routers/AppRoutes";
import { ToastContainer } from "react-toastify";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { registerServiceWorker, PerformanceMonitor } from "./utils/performance";
// Removed cart providers - no longer using cart localStorage
import { AuthProvider } from "./context/AuthContext"; // Thêm import AuthProvider
import { EnhancedCartProvider } from "./context/EnhancedCartContext"; // Thêm import EnhancedCartProvider
import { WishlistProvider } from "./context/WishlistContext"; // Thêm import WishlistProvider
import "react-toastify/dist/ReactToastify.css";
import "./style/global.css";
import "./style/responsive.css";

function App() {
  useEffect(() => {
    // Khởi tạo giám sát hiệu suất
    PerformanceMonitor.init();

    // Đăng ký service worker cho môi trường production
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
    }

    // Ghi log các chỉ số hiệu suất sau khi ứng dụng tải
    setTimeout(() => {
      PerformanceMonitor.logMetrics();
    }, 2000);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider> {/* Thêm thẻ mở AuthProvider */}
        <EnhancedCartProvider> {/* Enhanced Cart Provider */}
          <WishlistProvider> {/* Wishlist Provider */}
          <div className="app">
            {/* ToastContainer được đặt ở cấp cao nhất để hoạt động trên toàn ứng dụng */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              pauseOnFocusLoss={false}
              pauseOnHover={false}
              draggable
              theme="light"
            />
            {/* Toàn bộ logic định tuyến sẽ được xử lý bởi AppRoutes */}
            <AppRoutes />
          </div>
          </WishlistProvider> {/* Wishlist Provider */}
        </EnhancedCartProvider> {/* Enhanced Cart Provider */}
      </AuthProvider> {/* Thẻ đóng khớp với thẻ mở */}
    </ErrorBoundary>
  );
}

export default App;