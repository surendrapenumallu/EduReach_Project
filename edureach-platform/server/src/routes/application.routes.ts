import { Router } from "express";
import {
  createApplication,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/application.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// Public / optional auth endpoint to submit application
router.post("/", createApplication);

// Protected / Admin endpoints
router.get("/my", authMiddleware, getMyApplications);
router.get("/all", getAllApplications);
router.patch("/:id/status", updateApplicationStatus);
router.delete("/:id", deleteApplication);

export default router;

