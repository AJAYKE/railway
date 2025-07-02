import { DeploymentAction, Service } from "@/types/railway";
import { Package } from "lucide-react";
import { ServiceItem } from "./ServiceItem";
import { EmptyState } from "./ui/EmptyState";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface ServiceListProps {
  services: Service[];
  projectId: string;
  isLoading: boolean;
  onDeploymentAction: (
    action: DeploymentAction,
    projectId: string,
    deploymentId: string,
    serviceName: string
  ) => Promise<void>;
  isActionLoading: (deploymentId: string, action: DeploymentAction) => boolean;
}

export const ServiceList = ({
  services,
  projectId,
  isLoading,
  onDeploymentAction,
  isActionLoading,
}: ServiceListProps) => {
  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner size="md" text="Loading services..." />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services found"
        description="This project doesn't have any services yet."
        icon={<Package className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Services ({services.length})
      </h3>
      {services.map((service) => (
        <ServiceItem
          key={service.id}
          service={service}
          projectId={projectId}
          onDeploymentAction={onDeploymentAction}
          isActionLoading={isActionLoading}
        />
      ))}
    </div>
  );
};
