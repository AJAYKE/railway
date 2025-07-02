import { DeploymentAction, Service } from "@/types/railway";
import { AlertTriangle } from "lucide-react";
import { DeploymentActions } from "./DeploymentActions";

interface ServiceItemProps {
  service: Service;
  projectId: string;
  onDeploymentAction: (
    action: DeploymentAction,
    projectId: string,
    deploymentId: string,
    serviceName: string
  ) => Promise<void>;
  isActionLoading: (deploymentId: string, action: DeploymentAction) => boolean;
}

export const ServiceItem = ({
  service,
  projectId,
  onDeploymentAction,
  isActionLoading,
}: ServiceItemProps) => {
  const getDeploymentId = (service: Service): string | null => {
    return service.deployments?.edges?.[0]?.node?.id || null;
  };

  const deploymentId = getDeploymentId(service);
  const canPerformActions = deploymentId !== null;

  return (
    <div className="flex justify-between items-center p-4 border border-gray-100 rounded-lg bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{service.name}</span>
          {!canPerformActions && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>

        <div className="text-sm text-gray-600 mt-1">
          <span>Service ID: {service.id}</span>
          {service.createdAt && (
            <span className="ml-3">
              Created: {new Date(service.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {!canPerformActions && (
          <p className="text-sm text-orange-600 mt-1">
            No active deployment found
          </p>
        )}
      </div>

      {canPerformActions && deploymentId && (
        <DeploymentActions
          deploymentId={deploymentId}
          projectId={projectId}
          serviceName={service.name}
          onAction={onDeploymentAction}
          isActionLoading={isActionLoading}
        />
      )}
    </div>
  );
};
