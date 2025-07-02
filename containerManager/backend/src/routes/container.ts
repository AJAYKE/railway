import { NextFunction, Request, Response, Router } from "express";
import { body, param, validationResult } from "express-validator";
import {
  createDeployment,
  deleteService,
  fetchProjects,
  fetchServicesByProject,
  restartDeployment,
  stopDeployment,
} from "../services/railwayService";
import { ApiError } from "../types/railway";

const router = Router();

/**
 * Validation middleware
 */
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  return next();
};
/**
 * Error handler middleware
 */
const handleError = (error: unknown, res: Response, operation: string) => {
  console.error(`Error in ${operation}:`, error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode || 500).json({
      error: error.message,
      operation,
    });
  }

  return res.status(500).json({
    error: `Failed to ${operation}`,
    details: error instanceof Error ? error.message : "Unknown error",
  });
};

/**
 * GET /projects - Fetch all Railway projects
 */
router.get("/projects", async (_req: Request, res: Response) => {
  try {
    const result = await fetchProjects();
    res.json(result);
  } catch (error) {
    handleError(error, res, "fetch projects");
  }
});

/**
 * GET /services/:projectId - Fetch services for a specific project
 */
router.get(
  "/services/:projectId",
  [
    param("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Project ID must be between 1 and 100 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    try {
      const result = await fetchServicesByProject(projectId!);
      return res.json(result);
    } catch (error) {
      return handleError(error, res, `fetch services for project ${projectId}`);
    }
  }
);

/**
 * POST /deployment/create - Create a new deployment
 */
router.post(
  "/deployment/create",
  [
    body("projectId")
      .notEmpty()
      .withMessage("Project ID is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Project ID must be between 1 and 100 characters"),
    body("serviceId")
      .notEmpty()
      .withMessage("Service ID is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Service ID must be between 1 and 100 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { projectId, serviceId } = req.body;
      const result = await createDeployment(projectId, serviceId);
      return res.json(result);
    } catch (error) {
      return handleError(error, res, "create deployment");
    }
  }
);

/**
 * POST /stop - Stop a deployment
 */
router.post(
  "/stop",
  [
    body("deploymentId")
      .notEmpty()
      .withMessage("Deployment ID is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Deployment ID must be between 1 and 100 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { deploymentId } = req.body;
      const result = await stopDeployment(deploymentId);
      return res.json(result);
    } catch (error) {
      return handleError(
        error,
        res,
        `stop deployment ${req.body.deploymentId}`
      );
    }
  }
);

/**
 * POST /restart - Restart a deployment
 */
router.post(
  "/restart",
  [
    body("deploymentId")
      .notEmpty()
      .withMessage("Deployment ID is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Deployment ID must be between 1 and 100 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { deploymentId } = req.body;
      const result = await restartDeployment(deploymentId);
      res.json(result);
    } catch (error) {
      handleError(error, res, `restart deployment ${req.body.deploymentId}`);
    }
  }
);

/**
 * DELETE /service/:serviceId - Delete a service
 */
router.delete(
  "/service/:serviceId",
  [
    param("serviceId")
      .notEmpty()
      .withMessage("Service ID is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Service ID must be between 1 and 100 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    try {
      if (!serviceId) {
        return res.status(400).json({ error: "Service ID is required" });
      }
      const result = await deleteService(serviceId);
      return res.json(result);
    } catch (error) {
      return handleError(error, res, `delete service ${serviceId}`);
    }
  }
);

/**
 * Health check endpoint
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] || "development",
  });
});

export default router;
