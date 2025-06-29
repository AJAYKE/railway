export interface Message {
  id: string;
  author: string;
  author_id: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface ConnectionStats {
  total_connections: number;
  connections_by_ip: Record<string, number>;
  messages_sent_last_hour: number;
}

export enum ConnectionStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
  RECONNECTING = "reconnecting",
}
