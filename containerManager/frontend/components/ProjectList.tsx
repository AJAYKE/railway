import { DeploymentAction, Project, Service } from "@/types/railway";
import { FolderOpen } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "./ui/EmptyState";

interface ProjectListProps {
  projects: Project[];
  services: Service[];
  selectedProject: string | null;
  isLoadingServices: boolean;
  onLoadServices: (projectId: string) => void;
  onRefreshProjects: () => void;
  onDeploymentAction: (
    action: DeploymentAction,
    projectId: string,
    deploymentId: string,
    serviceName: string
  ) => Promise<void>;
  isActionLoading: (deploymentId: string, action: DeploymentAction) => boolean;
}

export const ProjectList = ({
  projects,
  services,
  selectedProject,
  isLoadingServices,
  onLoadServices,
  onRefreshProjects,
  onDeploymentAction,
  isActionLoading,
}: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="You don't have any Railway projects yet, or there was an issue loading them."
        actionLabel="Refresh Projects"
        onAction={onRefreshProjects}
        icon={<FolderOpen className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          services={services}
          selectedProject={selectedProject}
          isLoadingServices={isLoadingServices}
          onLoadServices={onLoadServices}
          onDeploymentAction={onDeploymentAction}
          isActionLoading={isActionLoading}
        />
      ))}
    </div>
  );
};
