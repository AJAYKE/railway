"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { ProjectList } from "@/components/ProjectList";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRailwayApi } from "@/hooks/useRailwayApi";
import { useEffect } from "react";

export default function RailwayDashboard() {
  const {
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
  } = useRailwayApi();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoadingProjects) {
    return (
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner
            size="lg"
            text="Loading projects..."
            className="py-12"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <DashboardHeader projectCount={projects.length} />

      {error && (
        <ErrorAlert message={error} onDismiss={clearError} className="mb-6" />
      )}

      <ProjectList
        projects={projects}
        services={services}
        selectedProject={selectedProject}
        isLoadingServices={isLoadingServices}
        onLoadServices={loadServices}
        onRefreshProjects={fetchProjects}
        onDeploymentAction={handleDeploymentAction}
        isActionLoading={isActionLoading}
      />
    </main>
  );
}
