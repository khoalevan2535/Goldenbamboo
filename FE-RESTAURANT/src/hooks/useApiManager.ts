import { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeError, shouldRetryError, getRetryDelay, formatErrorForUser } from '../utils/errorUtils';

interface ApiCallConfig {
  key: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: any;
  data?: any;
  cacheTime?: number; // Thời gian cache (ms)
  retryCount?: number; // Số lần retry
  retryDelay?: number; // Delay giữa các lần retry (ms)
  debounceTime?: number; // Thời gian debounce (ms)
  enabled?: boolean; // Có cho phép gọi API không
}

interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Global cache manager
const apiCache = new Map<string, { data: any; timestamp: number; cacheTime: number }>();

// Global request manager để tránh duplicate requests
const pendingRequests = new Map<string, Promise<any>>();

export function useApiManager<T = any>(config: ApiCallConfig) {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  });

  const {
    key,
    url,
    method = 'GET',
    params,
    data,
    cacheTime = 5 * 60 * 1000, // 5 phút mặc định
    retryCount = 2,
    retryDelay = 1000,
    debounceTime = 300,
    enabled = true
  } = config;

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Tạo cache key
  const cacheKey = `${key}_${JSON.stringify(params)}`;

  // Kiểm tra cache
  const getCachedData = useCallback(() => {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.cacheTime) {
      return cached.data;
    }
    return null;
  }, [cacheKey]);

  // Lưu vào cache
  const setCachedData = useCallback((data: T) => {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      cacheTime
    });
  }, [cacheKey, cacheTime]);

  // Thực hiện API call
  const executeApiCall = useCallback(async (): Promise<T> => {
    // Kiểm tra cache trước
    const cachedData = getCachedData();
    if (cachedData) {
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: false,
        error: null,
        lastFetched: Date.now()
      }));
      return cachedData;
    }

    // Kiểm tra pending request
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Tạo AbortController để có thể cancel request
    abortControllerRef.current = new AbortController();

    const makeRequest = async (): Promise<T> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Lấy token từ localStorage
        const token = localStorage.getItem('authToken');
        
        const requestConfig: any = {
          method,
          signal: abortControllerRef.current?.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          // Add timeout to prevent hanging requests
          timeout: 30000 // 30 seconds
        };

        // Thêm Authorization header nếu có token
        if (token) {
          requestConfig.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
          requestConfig.body = JSON.stringify(data);
        }

        let requestUrl = url;
        if (params && method === 'GET') {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
              searchParams.append(key, String(params[key]));
            }
          });
          requestUrl += `?${searchParams.toString()}`;
        }

        console.log('Making request to:', requestUrl);

        const response = await fetch(requestUrl, requestConfig);

        // Check if response is HTML instead of JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const htmlText = await response.text();
          console.error('Received HTML instead of JSON:', htmlText.substring(0, 200));
          throw new Error('Received HTML instead of JSON - Backend may be down or endpoint not found');
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setCachedData(result);
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastFetched: Date.now()
        }));

        return result;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Don't retry on abort errors (user cancelled or component unmounted)
          throw new Error('Request cancelled - Component unmounted or user cancelled');
        }
        
        // Add more context to network errors
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error - Backend may be down or unreachable');
        }
        
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
          throw new Error('Connection refused - Backend server is not running');
        }
        
        throw error;
      }
    };

    // Retry logic
    const executeWithRetry = async (): Promise<T> => {
      try {
        const result = await makeRequest();
        
        // Lưu vào cache nếu thành công
        setCachedData(result);
        
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastFetched: Date.now()
        }));

        return result;
      } catch (error: any) {
        const errorInfo = analyzeError(error);
        
        // Check if we should retry this error
        if (!shouldRetryError(error, retryCountRef.current, retryCount)) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: formatErrorForUser(error)
          }));
          throw error;
        }

        // Retry with smart backoff
        retryCountRef.current++;
        const backoffDelay = getRetryDelay(retryCountRef.current - 1, retryDelay);
        
        console.log(`🔄 Retrying request (${retryCountRef.current}/${retryCount}) after ${Math.round(backoffDelay)}ms`);
        console.log(`   Error: ${errorInfo.userMessage}`);
        console.log(`   Type: ${errorInfo.type}`);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return executeWithRetry();
      }
    };

    const requestPromise = executeWithRetry();
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
      retryCountRef.current = 0;
    }
  }, [key, url, method, params, data, cacheKey, cacheTime, retryCount, retryDelay, getCachedData, setCachedData]);

  // Debounced API call
  const executeApiCallDebounced = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (enabled) {
        executeApiCall().catch(console.error);
      }
    }, debounceTime);
  }, [executeApiCall, debounceTime, enabled]);

  // Manual trigger
  const refetch = useCallback(() => {
    // Clear cache để force refresh
    apiCache.delete(cacheKey);
    retryCountRef.current = 0;
    executeApiCall().catch(console.error);
  }, [executeApiCall, cacheKey]);

  // Auto fetch khi dependencies thay đổi
  useEffect(() => {
    if (enabled) {
      executeApiCallDebounced();
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeApiCallDebounced, enabled]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    isStale: state.lastFetched ? Date.now() - state.lastFetched > cacheTime : true
  };
}

// Utility function để clear cache
export const clearApiCache = (pattern?: string) => {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
};

// Utility function để clear pending requests
export const clearPendingRequests = () => {
  pendingRequests.clear();
};



