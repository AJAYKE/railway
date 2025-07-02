export interface Project {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Deployment {
  id: string;
  status?: string;
  createdAt?: string;
}

export interface Service {
  id: string;
  name: string;
  createdAt: string;
  deployments: {
    edges: Array<{
      node: Deployment;
    }>;
  };
}

export interface ProjectEdge {
  node: Project;
}

export interface ServiceEdge {
  node: Service;
}

export interface ProjectsResponse {
  data: {
    projects: {
      edges: ProjectEdge[];
    };
  };
}

export interface ServicesResponse {
  data: {
    project: {
      services: {
        edges: ServiceEdge[];
      };
    };
  };
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface ActionRequest {
  deploymentId: string;
}

export type DeploymentAction = "stop" | "restart";

export interface LoadingState {
  [key: string]: boolean;
}
