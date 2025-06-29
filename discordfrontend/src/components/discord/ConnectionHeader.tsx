import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStats, ConnectionStatus } from "@/types/discord";
import { MessageCircle, Users, Wifi, WifiOff } from "lucide-react";

interface ConnectionHeaderProps {
  connectionStatus: ConnectionStatus;
  connectionStats: ConnectionStats | null;
  reconnectAttempts: number;
  onReconnect: () => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;

export function ConnectionHeader({
  connectionStatus,
  connectionStats,
  reconnectAttempts,
  onReconnect,
}: ConnectionHeaderProps) {
  const getStatusColor = (status: ConnectionStatus): string => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "bg-green-500";
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return "bg-yellow-500";
      case ConnectionStatus.ERROR:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <Wifi className="h-4 w-4" />;
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return <WifiOff className="h-4 w-4 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 w-full">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <MessageCircle className="h-6 w-6" />
            Discord Live Chat
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            {connectionStats && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {connectionStats.total_connections} connected
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {connectionStats.messages_sent_last_hour} msgs/hr
                </div>
              </div>
            )}

            <Badge
              variant="outline"
              className={`${getStatusColor(
                connectionStatus
              )} text-white border-none`}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(connectionStatus)}
                <span className="capitalize">
                  {connectionStatus}
                  {reconnectAttempts > 0 &&
                    ` (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`}
                </span>
              </div>
            </Badge>

            <Button
              onClick={onReconnect}
              variant="outline"
              size="sm"
              disabled={connectionStatus === ConnectionStatus.CONNECTING}
            >
              Reconnect
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
