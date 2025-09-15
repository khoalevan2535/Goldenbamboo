// Advanced caching system for performance
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    const valid = Array.from(this.cache.values()).filter(
      item => now - item.timestamp <= item.ttl
    ).length;
    
    return {
      total: this.cache.size,
      valid,
      expired: this.cache.size - valid
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const globalCache = new CacheManager();

// Cache cleanup every 10 minutes
setInterval(() => {
  globalCache.cleanup();
}, 10 * 60 * 1000);

// Cache keys constants
export const CACHE_KEYS = {
  MENU_DATA: (branchId: number) => `menu_${branchId}`,
  TABLES_DATA: (branchId: number) => `tables_${branchId}`,
  USER_PROFILE: 'user_profile',
  CATEGORIES: 'categories',
  DISHES: 'dishes',
  COMBOS: 'combos',
  ANALYTICS: (timeRange: string) => `analytics_${timeRange}`,
} as const;





