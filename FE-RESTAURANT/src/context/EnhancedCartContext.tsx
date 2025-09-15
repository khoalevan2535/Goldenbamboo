import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { cartService } from '../services/CartService';
import { CartResponseDTO, CartItemResponseDTO } from '../interfaces/CartResponseDTO';
import { CartRequestDTO } from '../interfaces/CartRequestDTO';
import { CartItemRequestDTO } from '../interfaces/CartItemRequestDTO';
import { useAuth } from '../hooks/useAuth';

// Types
interface CartState {
  cart: CartResponseDTO | null;
  loading: boolean;
  error: string | null;
  branchId: number | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartResponseDTO | null }
  | { type: 'SET_BRANCH'; payload: number | null }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  branchId: null,
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'SET_BRANCH':
      return { ...state, branchId: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: null, error: null };
    default:
      return state;
  }
};

// Context
interface EnhancedCartContextType {
  state: CartState;
  // Cart operations
  addItemToCart: (request: Omit<CartRequestDTO, 'branchId' | 'accountId' | 'sessionId'>) => Promise<void>;
  updateCartItem: (itemId: number, request: Omit<CartItemRequestDTO, 'cartItemId'>) => Promise<void>;
  removeItemFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  setBranch: (branchId: number) => void;
  
  // Computed properties
  totalItems: number;
  totalAmount: number;
  isEmpty: boolean;
  cartItems: CartItemResponseDTO[];
  
  // Helper methods
  getItemQuantity: (itemId: number, itemType: 'dish' | 'combo') => number;
  isItemInCart: (itemId: number, itemType: 'dish' | 'combo') => boolean;
}

const EnhancedCartContext = createContext<EnhancedCartContextType | undefined>(undefined);

// Provider
interface EnhancedCartProviderProps {
  children: ReactNode;
}

export const EnhancedCartProvider: React.FC<EnhancedCartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Generate session ID for guest users
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Load cart when branch changes
  useEffect(() => {
    if (state.branchId) {
      refreshCart();
    }
  }, [state.branchId, user]);

  const addItemToCart = async (request: Omit<CartRequestDTO, 'branchId' | 'accountId' | 'sessionId'>) => {
    if (!state.branchId) {
      throw new Error('Branch not selected');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const cartRequest: CartRequestDTO = {
        ...request,
        branchId: state.branchId,
        accountId: user?.id,
        sessionId: user ? undefined : getSessionId(),
      };

      const updatedCart = await cartService.addItemToCart(cartRequest);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' });
    }
  };

  const updateCartItem = async (itemId: number, request: Omit<CartItemRequestDTO, 'cartItemId'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const cartItemRequest: CartItemRequestDTO = {
        ...request,
        cartItemId: itemId,
      };

      const updatedCart = await cartService.updateCartItem(itemId, cartItemRequest);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update cart item' });
    }
  };

  const removeItemFromCart = async (itemId: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updatedCart = await cartService.removeItemFromCart(itemId);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item from cart' });
    }
  };

  const clearCart = async () => {
    if (!state.cart) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await cartService.clearCart(state.cart.id);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear cart' });
    }
  };

  const refreshCart = async () => {
    if (!state.branchId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const cart = await cartService.getCart({
        branchId: state.branchId,
        accountId: user?.id,
        sessionId: user ? undefined : getSessionId(),
      });
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      // Nếu không tìm thấy giỏ hàng, tạo mới
      if (error instanceof Error && error.message.includes('404')) {
        try {
          // Tạo giỏ hàng mới
          const newCart = await cartService.createCart({
            branchId: state.branchId,
            accountId: user?.id,
            sessionId: user ? undefined : getSessionId(),
          });
          dispatch({ type: 'SET_CART', payload: newCart });
        } catch (createError) {
          dispatch({ type: 'SET_ERROR', payload: 'Không thể tạo giỏ hàng mới' });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load cart' });
      }
    }
  };

  const setBranch = (branchId: number) => {
    dispatch({ type: 'SET_BRANCH', payload: branchId });
  };

  // Computed properties
  const totalItems = state.cart?.totalItems || 0;
  const totalAmount = state.cart?.totalAmount || 0;
  const isEmpty = !state.cart || state.cart.cartItems.length === 0;
  const cartItems = state.cart?.cartItems || [];

  // Helper methods
  const getItemQuantity = (itemId: number, itemType: 'dish' | 'combo'): number => {
    const item = cartItems.find(cartItem => 
      cartItem.itemId === itemId && cartItem.itemType === itemType
    );
    return item?.quantity || 0;
  };

  const isItemInCart = (itemId: number, itemType: 'dish' | 'combo'): boolean => {
    return cartItems.some(cartItem => 
      cartItem.itemId === itemId && cartItem.itemType === itemType
    );
  };

  const value: EnhancedCartContextType = {
    state,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    clearCart,
    refreshCart,
    setBranch,
    totalItems,
    totalAmount,
    isEmpty,
    cartItems,
    getItemQuantity,
    isItemInCart,
  };

  return (
    <EnhancedCartContext.Provider value={value}>
      {children}
    </EnhancedCartContext.Provider>
  );
};

// Hook
export const useEnhancedCart = (): EnhancedCartContextType => {
  const context = useContext(EnhancedCartContext);
  if (context === undefined) {
    throw new Error('useEnhancedCart must be used within an EnhancedCartProvider');
  }
  return context;
};
