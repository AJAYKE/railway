import {
  DeploymentAction,
  LoadingState,
  Project,
  ProjectsResponse,
  Service,
  ServicesResponse,
} from "@/types/railway";
import { useCallback, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
}

export const useRailwayApi = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [deploymentLoadingStates, setDeploymentLoadingStates] =
    useState<LoadingState>({});
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      setError(null);

      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data: ProjectsResponse = await response.json();
      const projectList =
        data?.data?.projects?.edges?.map((edge) => edge.node) || [];
      setProjects(projectList);
    } catch (error) {
      handleError(error, "Failed to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  }, [handleError]);

  const loadServices = useCallback(
    async (projectId: string) => {
      try {
        setIsLoadingServices(true);
        setError(null);
        setSelectedProject(projectId);

        const response = await fetch(`${API_URL}/services/${projectId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.statusText}`);
        }

        const data: ServicesResponse = await response.json();
        const serviceList =
          data?.data?.project?.services?.edges?.map((edge) => edge.node) || [];
        setServices(serviceList);
      } catch (error) {
        handleError(error, "Failed to load services");
        setServices([]);
      } finally {
        setIsLoadingServices(false);
      }
    },
    [handleError]
  );

  const handleDeploymentAction = useCallback(
    async (
      action: DeploymentAction,
      projectId: string,
      deploymentId: string,
      serviceName: string
    ) => {
      const loadingKey = `${deploymentId}-${action}`;

      try {
        setDeploymentLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));
        setError(null);

        const response = await fetch(`${API_URL}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deploymentId }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to ${action} service "${serviceName}": ${response.statusText}`
          );
        }

        await loadServices(projectId);
      } catch (error) {
        handleError(error, `Failed to ${action} service "${serviceName}"`);
      } finally {
        setDeploymentLoadingStates((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [loadingKey]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [handleError, loadServices]
  );

  const isActionLoading = useCallback(
    (deploymentId: string, action: DeploymentAction): boolean => {
      return deploymentLoadingStates[`${deploymentId}-${action}`] || false;
    },
    [deploymentLoadingStates]
  );

  return {
    // State
    projects,
    services,
    selectedProject,
    isLoadingProjects,
    isLoadingServices,
    error,

    // Actions
    fetchProjects,
    loadServices,
    handleDeploymentAction,
    isActionLoading,
    clearError,
  };
};
