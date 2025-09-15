import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        onOpen?.();
        console.log('🔄 WebSocket connected:', url);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
          setError('Invalid message format');
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onClose?.();
        console.log('🔌 WebSocket disconnected:', url);

        // Auto reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setConnectionStatus('error');
        setError('WebSocket connection error');
        onError?.(event);
        console.error('❌ WebSocket error:', event);
      };

    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to create WebSocket connection');
      console.error('❌ WebSocket creation error:', err);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('⚠️ WebSocket is not connected');
      setError('WebSocket is not connected');
      return false;
    }
  }, []);

  const sendOrderSubscription = useCallback((orderId: string, branchId?: string) => {
    return sendMessage({
      type: 'subscribe_order',
      orderId,
      branchId
    });
  }, [sendMessage]);

  const sendOrderStatusUpdate = useCallback((orderId: string, status: string) => {
    return sendMessage({
      type: 'order_status_update',
      orderId,
      status
    });
  }, [sendMessage]);

  const sendTableStatusUpdate = useCallback((tableId: string, status: string) => {
    return sendMessage({
      type: 'table_status_update',
      tableId,
      status
    });
  }, [sendMessage]);

  const sendServiceRequest = useCallback((tableId: string, requestType: string) => {
    return sendMessage({
      type: 'service_request',
      tableId,
      requestType
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    sendMessage,
    sendOrderSubscription,
    sendOrderStatusUpdate,
    sendTableStatusUpdate,
    sendServiceRequest,
    connect,
    disconnect
  };
};
