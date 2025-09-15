// Performance optimization hook
import { useCallback, useMemo, useState, useEffect } from 'react';
import { debounce } from 'lodash';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  return useMemo(
    () => debounce(func, delay) as T,
    [func, delay]
  );
};

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      }
  };

  return [storedValue, setValue];
};

// Performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    apiCallsCount: 0,
    errorCount: 0
  });

  const startTimer = useCallback(() => {
    return performance.now();
  }, []);

  const endTimer = useCallback((startTime: number, operation: string) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    }ms`);
    
    setMetrics(prev => ({
      ...prev,
      renderTime: prev.renderTime + duration
    }));
    
    return duration;
  }, []);

  const incrementApiCalls = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      apiCallsCount: prev.apiCallsCount + 1
    }));
  }, []);

  const incrementErrors = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));
  }, []);

  return {
    metrics,
    startTimer,
    endTimer,
    incrementApiCalls,
    incrementErrors
  };
};





