import { Button } from "@/components/ui/button";
import { DeploymentAction } from "@/types/railway";
import { Loader2, RefreshCw, Square } from "lucide-react";

interface DeploymentActionsProps {
  deploymentId: string;
  projectId: string;
  serviceName: string;
  onAction: (
    action: DeploymentAction,
    projectId: string,
    deploymentId: string,
    serviceName: string
  ) => Promise<void>;
  isActionLoading: (deploymentId: string, action: DeploymentAction) => boolean;
}

export const DeploymentActions = ({
  deploymentId,
  projectId,
  serviceName,
  onAction,
  isActionLoading,
}: DeploymentActionsProps) => {
  const isRestartLoading = isActionLoading(deploymentId, "restart");
  const isStopLoading = isActionLoading(deploymentId, "stop");
  const isAnyActionLoading = isRestartLoading || isStopLoading;

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        onClick={() =>
          onAction("restart", projectId, deploymentId, serviceName)
        }
        disabled={isAnyActionLoading}
        className="min-w-[80px]"
      >
        {isRestartLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        <span className="ml-1">Restart</span>
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => onAction("stop", projectId, deploymentId, serviceName)}
        disabled={isAnyActionLoading}
        className="min-w-[70px]"
      >
        {isStopLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Square className="h-4 w-4" />
        )}
        <span className="ml-1">Stop</span>
      </Button>
    </div>
  );
};
