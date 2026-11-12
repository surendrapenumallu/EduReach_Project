import { Router } from "express";
import {
  createApplication,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/application.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createApplicationSchema, updateApplicationStatusSchema } from "../schemas/application.schema";

const router = Router();

// Public / optional auth endpoint to submit application
router.post("/", validateBody(createApplicationSchema), createApplication);

// Protected / Admin endpoints
router.get("/my", authMiddleware, getMyApplications);
router.get("/all", getAllApplications);
router.patch("/:id/status", validateBody(updateApplicationStatusSchema), updateApplicationStatus);
router.delete("/:id", deleteApplication);

export default router;

