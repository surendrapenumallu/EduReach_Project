import { Router } from "express";
import {
  applyForAdmission,
  getMyApplication,
  getApplicationById,
  uploadAdditionalDocuments,
  getApplicationStatus,
} from "../controllers/admission.controller";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Student submission & management
// /apply supports both authenticated students and direct applicant submissions
router.post("/apply", optionalAuthMiddleware, applyForAdmission);
router.get("/my-application", authMiddleware, getMyApplication);
router.get("/:applicationId/status", getApplicationStatus);
router.get("/:applicationId", authMiddleware, getApplicationById);
router.post("/:applicationId/documents", authMiddleware, uploadAdditionalDocuments);

export default router;
