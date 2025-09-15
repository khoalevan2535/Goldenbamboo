import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useEnhancedCart } from '../context/EnhancedCartContext';

/**
 * Hook để tự động khởi tạo giỏ hàng khi user đăng nhập hoặc chọn branch
 */
export const useCartInitialization = () => {
  const { user } = useAuth();
  const { state, setBranch, refreshCart } = useEnhancedCart();

  // Tự động tạo giỏ hàng khi user đăng nhập và đã chọn branch
  useEffect(() => {
    if (user && state.branchId && !state.cart) {
      console.log('Auto-initializing cart for user:', user.id, 'branch:', state.branchId);
      refreshCart();
    }
  }, [user, state.branchId, state.cart, refreshCart]);

  // Tự động tạo giỏ hàng khi guest user chọn branch
  useEffect(() => {
    if (!user && state.branchId && !state.cart) {
      console.log('Auto-initializing cart for guest user, branch:', state.branchId);
      refreshCart();
    }
  }, [user, state.branchId, state.cart, refreshCart]);

  return {
    isInitialized: !!state.cart,
    isLoading: state.loading,
    error: state.error,
  };
};







