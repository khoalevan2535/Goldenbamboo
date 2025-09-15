// Cart Storage Manager - Multiple storage options for cart persistence

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'hybrid';

export interface CartStorageConfig {
  primaryStorage: StorageType;
  backupStorage?: StorageType;
  autoSave: boolean;
  saveInterval: number; // milliseconds
  maxRetries: number;
}

export interface CartStorageData {
  items: any[];
  selectedBranchId: number | null;
  lastUpdated: string;
  version: string;
}

export class CartStorageManager {
  private config: CartStorageConfig;
  private memoryCache: CartStorageData | null = null;
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly CART_KEY = 'restaurant_cart_v1';
  private readonly VERSION = '1.0.0';

  constructor(config: Partial<CartStorageConfig> = {}) {
    this.config = {
      primaryStorage: 'hybrid',
      backupStorage: 'sessionStorage',
      autoSave: true,
      saveInterval: 1000, // 1 second
      maxRetries: 3,
      ...config
    };

    this.initializeStorage();
  }

  private initializeStorage() {
    // Test storage availability
    this.testStorageSupport();
    
    // Load existing data
    this.loadFromStorage();
    
    // Setup auto-save if enabled
    if (this.config.autoSave) {
      this.setupAutoSave();
    }
  }

  private testStorageSupport() {
    const results = {
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      memory: true // Memory is always available
    };

    return results;
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = 'cart_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const testKey = 'cart_test_' + Date.now();
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Save cart data to storage
  saveCartData(data: Omit<CartStorageData, 'lastUpdated' | 'version'>): boolean {
    const cartData: CartStorageData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      version: this.VERSION
    };

    let success = false;

    // Try primary storage first
    success = this.saveToStorage(this.config.primaryStorage, cartData);
    
    // If primary fails, try backup storage
    if (!success && this.config.backupStorage) {
      success = this.saveToStorage(this.config.backupStorage, cartData);
    }

    // Always update memory cache
    this.memoryCache = cartData;

    if (success) {
    } else {
      console.error('❌ Failed to save cart to any storage');
    }

    return success;
  }

  private saveToStorage(storageType: StorageType, data: CartStorageData): boolean {
    try {
      switch (storageType) {
        case 'localStorage':
          localStorage.setItem(this.CART_KEY, JSON.stringify(data));
          return true;
          
        case 'sessionStorage':
          sessionStorage.setItem(this.CART_KEY, JSON.stringify(data));
          return true;
          
        case 'memory':
          this.memoryCache = data;
          return true;
          
        case 'hybrid':
          // Save to both localStorage and sessionStorage
          const localSuccess = this.saveToStorage('localStorage', data);
          const sessionSuccess = this.saveToStorage('sessionStorage', data);
          return localSuccess || sessionSuccess;
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`❌ Error saving to ${storageType}:`, error);
      return false;
    }
  }

  // Load cart data from storage
  loadCartData(): CartStorageData | null {
    let data: CartStorageData | null = null;

    // Try primary storage first
    data = this.loadFromStorageType(this.config.primaryStorage);
    
    // If primary fails, try backup storage
    if (!data && this.config.backupStorage) {
      data = this.loadFromStorageType(this.config.backupStorage);
    }

    // If still no data, try memory cache
    if (!data && this.memoryCache) {
      data = this.memoryCache;
    }

    if (data) {
    } else {
    }

    return data;
  }

  private loadFromStorage(): CartStorageData | null {
    return this.loadCartData();
  }

  private loadFromStorageType(storageType: StorageType): CartStorageData | null {
    try {
      let rawData: string | null = null;

      switch (storageType) {
        case 'localStorage':
          rawData = localStorage.getItem(this.CART_KEY);
          break;
          
        case 'sessionStorage':
          rawData = sessionStorage.getItem(this.CART_KEY);
          break;
          
        case 'memory':
          return this.memoryCache;
          
        case 'hybrid':
          // Try localStorage first, then sessionStorage
          rawData = localStorage.getItem(this.CART_KEY) || sessionStorage.getItem(this.CART_KEY);
          break;
      }

      if (rawData) {
        const parsed = JSON.parse(rawData);
        
        // Validate data structure
        if (this.validateCartData(parsed)) {
          return parsed;
        } else {
          this.clearStorage(storageType);
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Error loading from ${storageType}:`, error);
      return null;
    }
  }

  private validateCartData(data: any): data is CartStorageData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.items) &&
      (data.selectedBranchId === null || typeof data.selectedBranchId === 'number') &&
      typeof data.lastUpdated === 'string' &&
      typeof data.version === 'string'
    );
  }

  // Clear cart data from storage
  clearCartData(): void {
    this.clearStorage(this.config.primaryStorage);
    if (this.config.backupStorage) {
      this.clearStorage(this.config.backupStorage);
    }
    this.memoryCache = null;
  }

  private clearStorage(storageType: StorageType): void {
    try {
      switch (storageType) {
        case 'localStorage':
          localStorage.removeItem(this.CART_KEY);
          break;
          
        case 'sessionStorage':
          sessionStorage.removeItem(this.CART_KEY);
          break;
          
        case 'memory':
          this.memoryCache = null;
          break;
          
        case 'hybrid':
          localStorage.removeItem(this.CART_KEY);
          sessionStorage.removeItem(this.CART_KEY);
          this.memoryCache = null;
          break;
      }
    } catch (error) {
      console.error(`❌ Error clearing ${storageType}:`, error);
    }
  }

  // Setup auto-save functionality
  private setupAutoSave() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }

    this.saveTimer = setInterval(() => {
      if (this.memoryCache) {
        this.saveCartData(this.memoryCache);
      }
    }, this.config.saveInterval);
  }

  // Get storage info
  getStorageInfo() {
    const info = {
      config: this.config,
      memoryCache: this.memoryCache ? 'Present' : 'Empty',
      localStorage: localStorage.getItem(this.CART_KEY) ? 'Present' : 'Empty',
      sessionStorage: sessionStorage.getItem(this.CART_KEY) ? 'Present' : 'Empty',
      storageSupport: this.testStorageSupport()
    };

    return info;
  }

  // Update configuration
  updateConfig(newConfig: Partial<CartStorageConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.autoSave !== undefined) {
      if (newConfig.autoSave) {
        this.setupAutoSave();
      } else if (this.saveTimer) {
        clearInterval(this.saveTimer);
        this.saveTimer = null;
      }
    }
    
  }

  // Cleanup
  destroy() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.memoryCache = null;
  }
}

// Create default instance
export const cartStorageManager = new CartStorageManager();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).cartStorageManager = cartStorageManager;
}
