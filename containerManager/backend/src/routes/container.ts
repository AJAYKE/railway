import { Router } from "express";
import {
  fetchProjects,
  fetchServicesByProject,
  restartDeployment,
  stopDeployment,
} from "../services/railwayService";

const router = Router();

router.get("/projects", async (_, res) => {
  try {
    const result = await fetchProjects();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/services/:projectId", async (req, res) => {
  try {
    const result = await fetchServicesByProject(req.params.projectId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.post("/stop", async (req, res) => {
  try {
    const { deploymentId } = req.body;
    const result = await stopDeployment(deploymentId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to stop deployment" });
  }
});

router.post("/restart", async (req, res) => {
  try {
    const { deploymentId } = req.body;
    const result = await restartDeployment(deploymentId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to restart deployment" });
  }
});

export default router;
