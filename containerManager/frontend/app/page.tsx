"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/projects`)
      .then((res) => res.json())
      .then((data) =>
        setProjects(data?.data?.projects?.edges.map((edge) => edge.node) || [])
      );
  }, []);

  const loadServices = (projectId: string) => {
    setSelectedProject(projectId);
    fetch(`${API_URL}/services/${projectId}`)
      .then((res) => res.json())
      .then((data) => setServices(data?.data?.project?.services?.edges || []));
  };

  const handleAction = async (
    action: "stop" | "restart",
    projectId: string,
    deploymentId: string
  ) => {
    setLoading(true);
    await fetch(`${API_URL}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deploymentId }),
    });
    loadServices(projectId);
    setLoading(false);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Railway Projects</h1>
      <div className="space-y-4">
        {projects.map((proj: any) => (
          <div key={proj.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{proj.name}</span>
              <Button onClick={() => loadServices(proj.id)} disabled={loading}>
                View Services
              </Button>
            </div>
            {selectedProject === proj.id && (
              <div className="mt-4 space-y-2">
                {services.length === 0 && <p>No services found.</p>}
                {services.map((svc: any) => (
                  <div
                    key={svc.node.id}
                    className="flex justify-between items-center border p-2 rounded"
                  >
                    <span>{svc.node.name}</span>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAction(
                            "restart",
                            proj.id,
                            svc.node.deployments.edges[0].node.id
                          )
                        }
                        disabled={loading}
                      >
                        Restart
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleAction(
                            "stop",
                            proj.id,
                            svc.node.deployments.edges[0].node.id
                          )
                        }
                        disabled={loading}
                      >
                        Stop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
