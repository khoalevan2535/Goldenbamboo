// Utility functions for debugging cart persistence issues

export const CartDebug = {
  // Check localStorage cart data
  checkLocalStorage: () => {
    const CART_KEY = 'restaurant_cart_v1';
    const cartData = localStorage.getItem(CART_KEY);
    
    
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        return parsed;
      } catch (error) {
        console.error('🔍 Cart Debug - parse error:', error);
        return null;
      }
    }
    
    return null;
  },

  // Clear cart data
  clearCart: () => {
    const CART_KEY = 'restaurant_cart_v1';
    localStorage.removeItem(CART_KEY);
  },

  // Add test item
  addTestItem: (type: 'dish' | 'combo', id: number, name: string, price: number) => {
    const CART_KEY = 'restaurant_cart_v1';
    const uid = `${type}-${id}-1`;
    
    const testItem = {
      uid,
      item_type: type,
      item_id: id,
      branch_id: 1,
      branch_name: 'Chi nhánh 1',
      name,
      image_url: '',
      unit_price: price,
      discount_value: 0,
      discount_percentage: 0,
      final_price: price,
      qty: 1,
      checked: true
    };

    // Get existing cart
    let cartData = { items: [], selectedBranchId: 1 };
    const existingCart = localStorage.getItem(CART_KEY);
    if (existingCart) {
      try {
        cartData = JSON.parse(existingCart);
      } catch (e) {
        console.error('Error parsing existing cart:', e);
      }
    }

    // Add or update item
    const existingItemIndex = cartData.items.findIndex((item: any) => item.uid === uid);
    if (existingItemIndex >= 0) {
      cartData.items[existingItemIndex].qty += 1;
    } else {
      cartData.items.push(testItem);
    }

    // Save to localStorage
    cartData.lastUpdated = new Date().toISOString();
    localStorage.setItem(CART_KEY, JSON.stringify(cartData));
    
    return testItem;
  },

  // Get all localStorage keys related to cart
  getAllCartKeys: () => {
    const allKeys = Object.keys(localStorage);
    const cartKeys = allKeys.filter(key => 
      key.includes('cart') || 
      key.includes('Cart') || 
      key.includes('restaurant')
    );
    
    return cartKeys;
  },

  // Check browser localStorage support
  checkLocalStorageSupport: () => {
    try {
      const testKey = 'cart_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('❌ Cart Debug - localStorage not supported:', error);
      return false;
    }
  },

  // Get localStorage usage info
  getStorageInfo: () => {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    const info = {
      totalSize: totalSize + ' bytes',
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100 + ' KB',
      itemCount: localStorage.length,
      cartDataSize: localStorage.getItem('restaurant_cart_v1')?.length || 0
    };
    
    return info;
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).CartDebug = CartDebug;
}
