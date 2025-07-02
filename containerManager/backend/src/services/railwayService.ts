import fetch from "node-fetch";
import {
  DeploymentCreateResult,
  GraphQLResponse,
  ProjectsQueryResult,
  ServiceDeleteResult,
  ServicesQueryResult,
} from "../types/railway";

const API_URL = "https://backboard.railway.app/graphql/v2";

// Validate environment variables
if (!process.env["RAILWAY_TOKEN"]) {
  throw new Error("RAILWAY_TOKEN environment variable is required");
}

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env["RAILWAY_TOKEN"]}`,
};

// GraphQL query constants
const QUERIES = {
  FETCH_PROJECTS: `
    query FetchProjects {
      projects {
        edges {
          node {
            id
            name
            createdAt
          }
        }
      }
    }
  `,

  FETCH_SERVICES_BY_PROJECT: `
    query FetchServicesByProject($projectId: String!) {
      project(id: $projectId) {
        services(first: 50) {
          edges {
            node {
              id
              name
              createdAt
              deployments(first: 1) {
                edges {
                  node {
                    id
                    status
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  CREATE_DEPLOYMENT: `
    mutation CreateDeployment($projectId: String!, $serviceId: String!) {
      deploymentCreate(input: {
        projectId: $projectId
        serviceId: $serviceId
      }) {
        deployment {
          id
          status
        }
      }
    }
  `,

  DELETE_SERVICE: `
    mutation DeleteService($serviceId: String!) {
      serviceDelete(id: $serviceId) {
        id
      }
    }
  `,

  STOP_DEPLOYMENT: `
    mutation StopDeployment($deploymentId: String!) {
      deploymentStop(id: $deploymentId)
    }
  `,

  RESTART_DEPLOYMENT: `
    mutation RestartDeployment($deploymentId: String!) {
      deploymentRestart(id: $deploymentId)
    }
  `,
};

/**
 * Makes a GraphQL request to Railway API
 */
async function makeGraphQLRequest<T>(
  query: string,
  variables?: Record<string, any>
): Promise<GraphQLResponse<T>> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as GraphQLResponse<T>;

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors
        .map((error) =>
          typeof error === "object" && error !== null && "message" in error
            ? error.message
            : JSON.stringify(error)
        )
        .join(", ");
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Request failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Validates required parameters
 */
function validateRequiredParams(
  params: Record<string, any>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (
      !params[field] ||
      (typeof params[field] === "string" && params[field].trim() === "")
    ) {
      throw new Error(`Missing required parameter: ${field}`);
    }
  }
}

/**
 * Fetches all projects from Railway
 */
export async function fetchProjects(): Promise<
  GraphQLResponse<ProjectsQueryResult>
> {
  try {
    return await makeGraphQLRequest<ProjectsQueryResult>(
      QUERIES.FETCH_PROJECTS
    );
  } catch (error) {
    throw new Error(
      `Failed to fetch projects: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Fetches services for a specific project
 */
export async function fetchServicesByProject(
  projectId: string
): Promise<GraphQLResponse<ServicesQueryResult>> {
  try {
    validateRequiredParams({ projectId }, ["projectId"]);

    return await makeGraphQLRequest<ServicesQueryResult>(
      QUERIES.FETCH_SERVICES_BY_PROJECT,
      { projectId }
    );
  } catch (error) {
    throw new Error(
      `Failed to fetch services for project ${projectId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Creates a new deployment for a service
 */
export async function createDeployment(
  projectId: string,
  serviceId: string
): Promise<GraphQLResponse<DeploymentCreateResult>> {
  try {
    validateRequiredParams({ projectId, serviceId }, [
      "projectId",
      "serviceId",
    ]);

    return await makeGraphQLRequest<DeploymentCreateResult>(
      QUERIES.CREATE_DEPLOYMENT,
      { projectId, serviceId }
    );
  } catch (error) {
    throw new Error(
      `Failed to create deployment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Deletes a service
 */
export async function deleteService(
  serviceId: string
): Promise<GraphQLResponse<ServiceDeleteResult>> {
  try {
    validateRequiredParams({ serviceId }, ["serviceId"]);

    return await makeGraphQLRequest<ServiceDeleteResult>(
      QUERIES.DELETE_SERVICE,
      { serviceId }
    );
  } catch (error) {
    throw new Error(
      `Failed to delete service ${serviceId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Stops a deployment
 */
export async function stopDeployment(
  deploymentId: string
): Promise<GraphQLResponse<boolean>> {
  try {
    validateRequiredParams({ deploymentId }, ["deploymentId"]);

    return await makeGraphQLRequest<boolean>(QUERIES.STOP_DEPLOYMENT, {
      deploymentId,
    });
  } catch (error) {
    throw new Error(
      `Failed to stop deployment ${deploymentId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Restarts a deployment
 */
export async function restartDeployment(
  deploymentId: string
): Promise<GraphQLResponse<boolean>> {
  try {
    validateRequiredParams({ deploymentId }, ["deploymentId"]);

    return await makeGraphQLRequest<boolean>(QUERIES.RESTART_DEPLOYMENT, {
      deploymentId,
    });
  } catch (error) {
    throw new Error(
      `Failed to restart deployment ${deploymentId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
