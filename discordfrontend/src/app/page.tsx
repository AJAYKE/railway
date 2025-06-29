"use client";

import { ConnectionHeader } from "@/components/discord/ConnectionHeader";
import { ErrorAlert } from "@/components/discord/ErrorAlert";
import { MessageList } from "@/components/discord/MessageList";
import { Card, CardContent } from "@/components/ui/card";
import { useConnectionStats } from "@/hooks/useConnectionStats";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ConnectionStatus } from "@/types/discord";
import { useEffect } from "react";

export default function DiscordMessenger() {
  const { messages, addMessage } = useMessages();
  const {
    connectionStatus,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    manualReconnect,
    onMessage,
  } = useWebSocket();
  const { connectionStats } = useConnectionStats();

  useEffect(() => {
    onMessage(addMessage);
  }, [onMessage, addMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl mx-auto flex flex-col space-y-4 flex-1 overflow-hidden">
        <ConnectionHeader
          connectionStatus={connectionStatus}
          connectionStats={connectionStats}
          reconnectAttempts={reconnectAttempts}
          onReconnect={manualReconnect}
        />

        <ErrorAlert
          error={error}
          reconnectAttempts={reconnectAttempts}
          connectionStatus={connectionStatus}
        />

        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="p-2 sm:p-4 flex-1 flex flex-col min-h-0">
            <MessageList messages={messages} />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Real-time Discord messages • {messages.length} messages loaded
          {connectionStatus === ConnectionStatus.CONNECTED && (
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
