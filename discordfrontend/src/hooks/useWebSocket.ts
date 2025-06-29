import { ConnectionStatus, Message } from "@/types/discord";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  error: string | null;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  manualReconnect: () => void;
  onMessage: (callback: (message: Message) => void) => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 60000;

export function useWebSocket(): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(0);
  const messageCallbackRef = useRef<((message: Message) => void) | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const calculateReconnectDelay = useCallback((attempt: number): number => {
    return Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, attempt),
      MAX_RECONNECT_DELAY
    );
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("ping");
        lastHeartbeatRef.current = Date.now();
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus(ConnectionStatus.CONNECTING);
    setError(null);

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) {
        throw new Error("WebSocket URL not configured");
      }

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus(ConnectionStatus.CONNECTED);
        setReconnectAttempts(0);
        setError(null);
        startHeartbeat();
        lastHeartbeatRef.current = Date.now();
      };

      wsRef.current.onmessage = (event) => {
        try {
          // Handle plain "pong" or "ping" messages
          if (event.data === "pong" || event.data === "ping") {
            lastHeartbeatRef.current = Date.now();
            return;
          }

          // Otherwise, try to parse as JSON
          const data = JSON.parse(event.data);

          if (data.type === "heartbeat") {
            lastHeartbeatRef.current = Date.now();
            return;
          }

          if (data.id && data.author && data.content) {
            messageCallbackRef.current?.(data);
          }
        } catch (error) {
          console.error(
            "Failed to parse WebSocket message:",
            error,
            event.data
          );
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        stopHeartbeat();

        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus(ConnectionStatus.ERROR);
        setError("Connection error occurred");
      };

      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
          setError("Connection timeout");
        }
      }, CONNECTION_TIMEOUT);
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus(ConnectionStatus.ERROR);
      setError(
        error instanceof Error ? error.message : "Unknown connection error"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnectAttempts, startHeartbeat, stopHeartbeat]);

  connectRef.current = connect;

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setReconnectAttempts(0);
  }, [stopHeartbeat]);

  const manualReconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      setReconnectAttempts(0);
      connect();
    }, 100);
  }, [disconnect, connect]);

  const onMessage = useCallback((callback: (message: Message) => void) => {
    messageCallbackRef.current = callback;
  }, []);

  const scheduleReconnect = useCallback(() => {
    const nextAttempt = reconnectAttempts + 1;

    if (nextAttempt > MAX_RECONNECT_ATTEMPTS) {
      console.warn("Max reconnect attempts reached.");
      setConnectionStatus(ConnectionStatus.ERROR);
      return;
    }

    const delay = calculateReconnectDelay(reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${nextAttempt})`);

    setConnectionStatus(ConnectionStatus.RECONNECTING);
    setReconnectAttempts(nextAttempt);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectRef.current();
    }, delay);
  }, [calculateReconnectDelay, reconnectAttempts]);

  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (connectionStatus === ConnectionStatus.CONNECTED) {
        const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;

        if (timeSinceLastHeartbeat > CONNECTION_TIMEOUT) {
          console.warn("Connection appears stale, attempting reconnect");
          manualReconnect();
        }
      }
    }, 30000);

    return () => clearInterval(healthCheck);
  }, [connectionStatus, manualReconnect]);

  return {
    connectionStatus,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    manualReconnect,
    onMessage,
  };
}
