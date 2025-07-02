import { Button } from "@/components/ui/button";
import { DeploymentAction, Project, Service } from "@/types/railway";
import { Loader2 } from "lucide-react";
import { ServiceList } from "./ServiceList";

interface ProjectCardProps {
  project: Project;
  services: Service[];
  selectedProject: string | null;
  isLoadingServices: boolean;
  onLoadServices: (projectId: string) => void;
  onDeploymentAction: (
    action: DeploymentAction,
    projectId: string,
    deploymentId: string,
    serviceName: string
  ) => Promise<void>;
  isActionLoading: (deploymentId: string, action: DeploymentAction) => boolean;
}

export const ProjectCard = ({
  project,
  services,
  selectedProject,
  isLoadingServices,
  onLoadServices,
  onDeploymentAction,
  isActionLoading,
}: ProjectCardProps) => {
  const isSelected = selectedProject === project.id;
  const isCurrentlyLoading = isLoadingServices && isSelected;

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {project.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Project ID: {project.id}
            </p>
            {project.createdAt && (
              <p className="text-sm text-gray-500">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <Button
            onClick={() => onLoadServices(project.id)}
            disabled={isCurrentlyLoading}
            variant={isSelected ? "secondary" : "default"}
            className="min-w-[120px]"
          >
            {isCurrentlyLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "View Services"
            )}
          </Button>
        </div>

        {isSelected && (
          <div className="mt-6 border-t pt-6">
            <ServiceList
              services={services}
              projectId={project.id}
              isLoading={isCurrentlyLoading}
              onDeploymentAction={onDeploymentAction}
              isActionLoading={isActionLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
