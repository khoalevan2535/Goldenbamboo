// Performance optimization utilities
import { globalCache, CACHE_KEYS } from './cacheManager';

// Image optimization
export const optimizeImage = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string => {
  if (!src) return '';
  
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // For external CDN or when using image optimization service
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('f', format);
  
  // Return optimized URL (adjust based on your image service)
  return `${src}?${params.toString()}`;
};

// Lazy loading utility
export const createIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};

// Bundle splitting helpers
export const loadComponentAsync = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Memory management
export class MemoryManager {
  private static subscribers = new Set<() => void>();
  private static memoryThreshold = 50 * 1024 * 1024; // 50MB

  static subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  static checkMemoryUsage() {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usage = memInfo.usedJSHeapSize;
      
      if (usage > this.memoryThreshold) {
        this.cleanup();
      }
    }
  }

  static cleanup() {
    // Clear caches
    globalCache.cleanup();
    
    // Notify subscribers to cleanup
    this.subscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        }
    });
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }
}

// API request batching
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
      params: any;
    }>;
    timeout: NodeJS.Timeout;
  }>();

  batch<T>(
    key: string,
    params: any,
    batchFn: (batchedParams: any[]) => Promise<T[]>,
    delay = 100
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, {
          requests: [],
          timeout: setTimeout(async () => {
            const batch = this.batches.get(key);
            if (!batch) return;
            
            this.batches.delete(key);
            
            try {
              const allParams = batch.requests.map(r => r.params);
              const results = await batchFn(allParams);
              
              batch.requests.forEach((request, index) => {
                request.resolve(results[index]);
              });
            } catch (error) {
              batch.requests.forEach(request => {
                request.reject(error);
              });
            }
          }, delay)
        });
      }

      const batch = this.batches.get(key)!;
      batch.requests.push({ resolve, reject, params });
    });
  }
}

// Resource preloading
export const preloadResource = (url: string, type: 'script' | 'style' | 'image' | 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'image':
      link.as = 'image';
      break;
    case 'fetch':
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      break;
  }
  
  document.head.appendChild(link);
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      // Update available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              if (confirm('Có phiên bản mới! Bạn có muốn tải lại trang?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      }
  }
};

// Performance monitoring
export class PerformanceMonitor {
  private static metrics = {
    navigationStart: 0,
    loadComplete: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0
  };

  static init() {
    // Navigation timing
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.navigationStart = navTiming.navigationStart;
      this.metrics.loadComplete = navTiming.loadEventEnd - navTiming.navigationStart;
    });

    // Paint timing
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cumulativeLayoutShift = clsValue;
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static logMetrics() {
    
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.init();
  
  // Check memory usage every 30 seconds
  setInterval(() => {
    MemoryManager.checkMemoryUsage();
  }, 30000);
}

// Virtual scrolling helper
export const useVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd).map((item, index) => ({
    item,
    index: visibleStart + index
  }));
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

export default {
  optimizeImage,
  createIntersectionObserver,
  MemoryManager,
  RequestBatcher,
  preloadResource,
  registerServiceWorker,
  PerformanceMonitor,
  useVirtualScrolling
};

