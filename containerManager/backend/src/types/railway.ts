export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

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

export interface ProjectsQueryResult {
  projects: {
    edges: Array<{
      node: Project;
    }>;
  };
}

export interface ServicesQueryResult {
  project: {
    services: {
      edges: Array<{
        node: Service;
      }>;
    };
  };
}

export interface DeploymentCreateResult {
  deploymentCreate: {
    deployment: {
      id: string;
      status: string;
    };
  };
}

export interface ServiceDeleteResult {
  serviceDelete: {
    id: string;
  };
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }
    this.name = "ApiError";
  }
}
