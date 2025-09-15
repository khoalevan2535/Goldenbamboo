import { useEffect, useRef, useCallback } from "react";

type EventCallback = (payload: { type: string; data: string }) => void;

interface RealtimeConfig {
  url: string;
  throttleDelay?: number;
  filterTypes?: string[];
}

// Global connection manager để tránh tạo nhiều connection
const connectionManager = new Map<string, {
  eventSource: EventSource;
  callbacks: Set<EventCallback>;
  lastCallTime: number;
}>();

export function useRealtimeOptimized(
  config: RealtimeConfig,
  onEvent: EventCallback
) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  const { url, throttleDelay = 1000, filterTypes = [] } = config;

  const cleanup = useCallback(() => {
    const connection = connectionManager.get(url);
    if (connection) {
      connection.callbacks.delete(callbackRef.current);
      if (connection.callbacks.size === 0) {
        connection.eventSource.close();
        connectionManager.delete(url);
      }
    }
  }, [url]);

  useEffect(() => {
    let connection = connectionManager.get(url);

    if (!connection) {
      // Tạo connection mới
      const eventSource = new EventSource(url, { withCredentials: true as any });
      
      connection = {
        eventSource,
        callbacks: new Set(),
        lastCallTime: 0
      };

      eventSource.onmessage = (e) => {
        if (!e?.data) return;

        const now = Date.now();
        if (now - connection!.lastCallTime < throttleDelay) {
          return; // Skip nếu gọi quá nhanh
        }
        connection!.lastCallTime = now;

        // Parse event data
        const raw = String(e.data);
        const idx = raw.indexOf(":");
        const type = idx > 0 ? raw.substring(0, idx) : "UNKNOWN";
        const data = idx > 0 ? raw.substring(idx + 1) : raw;

        // Filter events nếu cần
        if (filterTypes.length === 0 || filterTypes.some(filterType => type.startsWith(filterType))) {
          // Gọi tất cả callbacks
          connection!.callbacks.forEach(callback => {
            try {
              callback({ type, data });
            } catch (error) {
              console.error('Error in realtime callback:', error);
            }
          });
        }
      };

      eventSource.onerror = () => {
        // Auto-reconnect handled by EventSource
        console.log('Realtime connection error, attempting reconnect...');
      };

      connectionManager.set(url, connection);
    }

    // Thêm callback vào connection
    connection.callbacks.add(callbackRef.current);

    return cleanup;
  }, [url, throttleDelay, filterTypes, cleanup]);

  // Cleanup khi component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
}




