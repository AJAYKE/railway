import fetch from "node-fetch";

const API_URL = "https://backboard.railway.app/graphql/v2";
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.RAILWAY_TOKEN}`,
};

export const fetchProjects = async () => {
  const query = `
    query  {
  projects {
    edges {
      node {
        id
        name
      }
    }
  }
}
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  return res.json();
};

export const fetchServicesByProject = async (projectId: string) => {
  const query = `
    query {
      project(id: "${projectId}") {
        services(first: 10) {
          edges {
            node {
              id
              name
              createdAt
              deployments(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  return res.json();
};

export const createContainer = async (projectId: string, serviceId: string) => {
  const query = `
    mutation {
      deploymentCreate(input: {
        projectId: "${projectId}"
        serviceId: "${serviceId}"
      }) {
        deployment {
          id
          status
        }
      }
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  return res.json();
};

export const deleteContainer = async (serviceId: string) => {
  const query = `
    mutation {
      serviceDelete(id: "${serviceId}") {
        id
      }
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  return res.json();
};

export const stopDeployment = async (deploymentId: string) => {
  const query = `
    mutation {
      deploymentStop(id: "${deploymentId}")
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  return res.json();
};

export const restartDeployment = async (deploymentId: string) => {
  const query = `
    mutation {
      deploymentRestart(id: "${deploymentId}")
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  return res.json();
};
