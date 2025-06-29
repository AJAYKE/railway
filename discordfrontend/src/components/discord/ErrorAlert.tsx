import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  reconnectAttempts: number;
  connectionStatus: string;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export function ErrorAlert({
  error,
  reconnectAttempts,
  connectionStatus,
}: ErrorAlertProps) {
  if (!error) return null;

  const calculateReconnectDelay = (attempt: number): number => {
    return Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, attempt),
      MAX_RECONNECT_DELAY
    );
  };

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {error}
        {reconnectAttempts < MAX_RECONNECT_ATTEMPTS &&
          connectionStatus === "reconnecting" && (
            <span className="ml-2">
              Reconnecting in{" "}
              {calculateReconnectDelay(reconnectAttempts - 1) / 1000}s...
            </span>
          )}
      </AlertDescription>
    </Alert>
  );
}
