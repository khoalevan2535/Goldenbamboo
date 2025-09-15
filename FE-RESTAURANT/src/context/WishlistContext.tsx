import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface WishlistItem {
  id: string; // type-id-branch
  item_type: 'dish' | 'combo';
  item_id: number;
  branch_id: number;
  branch_name: string;
  name: string;
  image_url: string;
  unit_price: number;
  discount_value?: number;
  discount_percentage?: number;
  final_price: number;
  addedAt: string; // ISO timestamp
}

export interface RecentlyViewedItem {
  id: string; // type-id-branch
  item_type: 'dish' | 'combo';
  item_id: number;
  branch_id: number;
  branch_name: string;
  name: string;
  image_url: string;
  unit_price: number;
  final_price: number;
  viewedAt: string; // ISO timestamp
}

export interface QuickReorderItem {
  orderId: number;
  orderDate: string;
  items: {
    item_type: 'dish' | 'combo';
    item_id: number;
    name: string;
    image_url: string;
    unit_price: number;
    final_price: number;
    qty: number;
  }[];
  totalAmount: number;
  branchId: number;
  branchName: string;
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  recentlyViewed: RecentlyViewedItem[];
  quickReorderItems: QuickReorderItem[];
  loading: boolean;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: { id: string } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'ADD_TO_RECENTLY_VIEWED'; payload: RecentlyViewedItem }
  | { type: 'CLEAR_RECENTLY_VIEWED' }
  | { type: 'SET_QUICK_REORDER_ITEMS'; payload: QuickReorderItem[] }
  | { type: 'LOAD_FROM_STORAGE'; payload: { wishlist: WishlistItem[]; recentlyViewed: RecentlyViewedItem[] } };

// Initial state
const initialState: WishlistState = {
  wishlistItems: [],
  recentlyViewed: [],
  quickReorderItems: [],
  loading: false,
};

// Reducer
const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'ADD_TO_WISHLIST': {
      const existingIndex = state.wishlistItems.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.wishlistItems];
        updatedItems[existingIndex] = action.payload;
        return { ...state, wishlistItems: updatedItems };
      } else {
        // Add new item
        return { ...state, wishlistItems: [...state.wishlistItems, action.payload] };
      }
    }

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter(item => item.id !== action.payload.id)
      };

    case 'CLEAR_WISHLIST':
      return { ...state, wishlistItems: [] };

    case 'ADD_TO_RECENTLY_VIEWED': {
      // Remove existing item if exists
      const filtered = state.recentlyViewed.filter(item => item.id !== action.payload.id);
      // Add to beginning and limit to 20 items
      const updated = [action.payload, ...filtered].slice(0, 20);
      return { ...state, recentlyViewed: updated };
    }

    case 'CLEAR_RECENTLY_VIEWED':
      return { ...state, recentlyViewed: [] };

    case 'SET_QUICK_REORDER_ITEMS':
      return { ...state, quickReorderItems: action.payload };

    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        wishlistItems: action.payload.wishlist,
        recentlyViewed: action.payload.recentlyViewed
      };

    default:
      return state;
  }
};

// Context
interface WishlistContextType {
  state: WishlistState;
  // Wishlist operations
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  
  // Recently viewed operations
  addToRecentlyViewed: (item: Omit<RecentlyViewedItem, 'id' | 'viewedAt'>) => void;
  clearRecentlyViewed: () => void;
  
  // Quick reorder operations
  loadQuickReorderItems: () => Promise<void>;
  reorderFromHistory: (orderId: number) => Promise<void>;
  
  // Computed properties
  wishlistCount: number;
  recentlyViewedCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider
interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const WISHLIST_KEY = 'restaurant_wishlist_v1';
    const RECENTLY_VIEWED_KEY = 'restaurant_recently_viewed_v1';
    
    try {
      const wishlistData = localStorage.getItem(WISHLIST_KEY);
      const recentlyViewedData = localStorage.getItem(RECENTLY_VIEWED_KEY);
      
      const wishlist = wishlistData ? JSON.parse(wishlistData) : [];
      const recentlyViewed = recentlyViewedData ? JSON.parse(recentlyViewedData) : [];
      
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: { wishlist, recentlyViewed } });
      
    } catch (error) {
      console.error('❌ Error loading wishlist data:', error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const WISHLIST_KEY = 'restaurant_wishlist_v1';
    const RECENTLY_VIEWED_KEY = 'restaurant_recently_viewed_v1';
    
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(state.wishlistItems));
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(state.recentlyViewed));
      
    } catch (error) {
      console.error('❌ Error saving wishlist data:', error);
    }
  }, [state.wishlistItems, state.recentlyViewed]);

  // Wishlist operations
  const addToWishlist = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    const wishlistItem: WishlistItem = {
      ...item,
      id: `${item.item_type}-${item.item_id}-${item.branch_id}`,
      addedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
  };

  const removeFromWishlist = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { id } });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (id: string) => {
    return state.wishlistItems.some(item => item.id === id);
  };

  // Recently viewed operations
  const addToRecentlyViewed = (item: Omit<RecentlyViewedItem, 'id' | 'viewedAt'>) => {
    const recentlyViewedItem: RecentlyViewedItem = {
      ...item,
      id: `${item.item_type}-${item.item_id}-${item.branch_id}`,
      viewedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: recentlyViewedItem });
  };

  const clearRecentlyViewed = () => {
    dispatch({ type: 'CLEAR_RECENTLY_VIEWED' });
  };

  // Quick reorder operations
  const loadQuickReorderItems = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // This would typically call an API to get user's order history
      // For now, we'll simulate with localStorage
      const QUICK_REORDER_KEY = 'restaurant_quick_reorder_v1';
      const savedData = localStorage.getItem(QUICK_REORDER_KEY);
      
      if (savedData) {
        const quickReorderItems = JSON.parse(savedData);
        dispatch({ type: 'SET_QUICK_REORDER_ITEMS', payload: quickReorderItems });
      }
    } catch (error) {
      console.error('❌ Error loading quick reorder items:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const reorderFromHistory = async (orderId: number) => {
    try {
      const order = state.quickReorderItems.find(item => item.orderId === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // This would typically add items to cart
      // For now, we'll just log the action
      
      // Here you would integrate with your cart system
      // cartContext.addItems(order.items);
      
    } catch (error) {
      console.error('❌ Error reordering from history:', error);
    }
  };

  // Computed properties
  const wishlistCount = state.wishlistItems.length;
  const recentlyViewedCount = state.recentlyViewed.length;

  const value: WishlistContextType = {
    state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    addToRecentlyViewed,
    clearRecentlyViewed,
    loadQuickReorderItems,
    reorderFromHistory,
    wishlistCount,
    recentlyViewedCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
