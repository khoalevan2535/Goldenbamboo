import { useEffect, useRef } from "react";

type OrderEventCallback = (payload: { type: string; data: string }) => void;

export function useOrdersRealtime(onEvent: OrderEventCallback) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const url = `${api}/staff/orders/stream`;
    const es = new EventSource(url, { withCredentials: true as any });

    // Throttle để tránh gọi callback quá nhiều
    let lastCallTime = 0;
    const throttleDelay = 1000; // 1 giây

    es.onmessage = (e) => {
      if (!e?.data) return;
      
      const now = Date.now();
      if (now - lastCallTime < throttleDelay) {
        return; // Skip nếu gọi quá nhanh
      }
      lastCallTime = now;

      // payload format: TYPE:rest
      const raw = String(e.data);
      const idx = raw.indexOf(":");
      const type = idx > 0 ? raw.substring(0, idx) : "UNKNOWN";
      const data = idx > 0 ? raw.substring(idx + 1) : raw;
      
      // Chỉ gọi callback cho các event quan trọng
      if (type.startsWith('ORDER_')) {
        callbackRef.current({ type, data });
      }
    };

    es.onerror = () => {
      // auto-reconnect by recreating connection after short delay if needed
      // EventSource will also handle retries by default; keep minimal
    };

    return () => { es.close(); };
  }, []);
}

