import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  type: 'dish' | 'combo';
  dishId?: number;
  comboId?: number;
  discountPercentage?: number;
  branchId: number; // Thêm branchId để phân biệt món từ các chi nhánh khác nhau
}

interface CartState {
  items: CartItem[];
  selectedItems: number[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number; type: 'dish' | 'combo' } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; type: 'dish' | 'combo'; quantity: number } }
  | { type: 'TOGGLE_ITEM_SELECTION'; payload: number }
  | { type: 'SELECT_ALL_ITEMS' }
  | { type: 'DESELECT_ALL_ITEMS' }
  | { type: 'REMOVE_SELECTED_ITEMS' }
  | { type: 'REMOVE_SELECTED_ITEMS_AFTER_ORDER' }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState: CartState = {
  items: [],
  selectedItems: [],
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.type === action.payload.type && item.branchId === action.payload.branchId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(
        item => !(item.id === action.payload.id && item.type === action.payload.type)
      );
      const filteredSelectedItems = state.selectedItems.filter(
        id => !(id === action.payload.id)
      );
      return {
        ...state,
        items: filteredItems,
        selectedItems: filteredSelectedItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id && item.type === action.payload.type
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, items: updatedItems };
    }

    case 'TOGGLE_ITEM_SELECTION': {
      const isSelected = state.selectedItems.includes(action.payload);
      const updatedSelectedItems = isSelected
        ? state.selectedItems.filter(id => id !== action.payload)
        : [...state.selectedItems, action.payload];
      return { ...state, selectedItems: updatedSelectedItems };
    }

    case 'SELECT_ALL_ITEMS': {
      const allItemIds = state.items.map(item => item.id);
      return { ...state, selectedItems: allItemIds };
    }

    case 'DESELECT_ALL_ITEMS': {
      return { ...state, selectedItems: [] };
    }

    case 'REMOVE_SELECTED_ITEMS': {
      const filteredItems = state.items.filter(
        item => !state.selectedItems.includes(item.id)
      );
      return { ...state, items: filteredItems, selectedItems: [] };
    }

    case 'REMOVE_SELECTED_ITEMS_AFTER_ORDER': {
      const filteredItems = state.items.filter(
        item => !state.selectedItems.includes(item.id)
      );
      return { ...state, items: filteredItems, selectedItems: [] };
    }

    case 'CLEAR_CART': {
      return { items: [], selectedItems: [] };
    }

    default:
      return state;
  }
};

// Context
interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: number, type: 'dish' | 'combo') => void;
  updateQuantity: (id: number, type: 'dish' | 'combo', quantity: number) => void;
  toggleItemSelection: (id: number) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  removeSelectedItems: () => void;
  removeSelectedItemsAfterOrder: () => void;
  getItemQuantity: (id: number, type: 'dish' | 'combo') => number;
  getSelectedItemsCount: () => number;
  clearCart: () => void;
  // Computed properties for selected items
  selectedItems: CartItem[];
  selectedTotalAmount: number;
  selectedTotalDiscount: number;
  // Thêm computed properties cho branch
  itemsByBranch: { [branchId: number]: CartItem[] };
  selectedItemsByBranch: { [branchId: number]: CartItem[] };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: number, type: 'dish' | 'combo') => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, type } });
  };

  const updateQuantity = (id: number, type: 'dish' | 'combo', quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, type, quantity } });
  };

  const toggleItemSelection = (id: number) => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: id });
  };

  const selectAllItems = () => {
    dispatch({ type: 'SELECT_ALL_ITEMS' });
  };

  const deselectAllItems = () => {
    dispatch({ type: 'DESELECT_ALL_ITEMS' });
  };

  const removeSelectedItems = () => {
    dispatch({ type: 'REMOVE_SELECTED_ITEMS' });
  };

  const removeSelectedItemsAfterOrder = () => {
    dispatch({ type: 'REMOVE_SELECTED_ITEMS_AFTER_ORDER' });
  };

  const getItemQuantity = (id: number, type: 'dish' | 'combo'): number => {
    const item = state.items.find(item => item.id === id && item.type === type);
    return item ? item.quantity : 0;
  };

  const getSelectedItemsCount = (): number => {
    return state.selectedItems.length;
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Computed properties
  const selectedItems = state.items.filter(item => state.selectedItems.includes(item.id));
  const selectedTotalAmount = selectedItems.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const discountAmount = item.discountPercentage ? (itemTotal * item.discountPercentage) / 100 : 0;
    return total + (itemTotal - discountAmount);
  }, 0);
  const selectedTotalDiscount = selectedItems.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const discountAmount = item.discountPercentage ? (itemTotal * item.discountPercentage) / 100 : 0;
    return total + discountAmount;
  }, 0);

  // Computed properties cho branch
  const itemsByBranch = state.items.reduce((acc, item) => {
    if (!acc[item.branchId]) {
      acc[item.branchId] = [];
    }
    acc[item.branchId].push(item);
    return acc;
  }, {} as { [branchId: number]: CartItem[] });

  const selectedItemsByBranch = selectedItems.reduce((acc, item) => {
    if (!acc[item.branchId]) {
      acc[item.branchId] = [];
    }
    acc[item.branchId].push(item);
    return acc;
  }, {} as { [branchId: number]: CartItem[] });

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    removeSelectedItems,
    removeSelectedItemsAfterOrder,
    getItemQuantity,
    getSelectedItemsCount,
    clearCart,
    selectedItems,
    selectedTotalAmount,
    selectedTotalDiscount,
    itemsByBranch,
    selectedItemsByBranch,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
