import { Router } from "express";
import {
  getStudentPortalData,
  aiResumeReview,
  getAIBriefing,
  calculateBunkSafety,
  predictAcademicRisk,
  downloadHallTicketPDF,
} from "../controllers/student.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// GET /api/student/portal-data (Protected)
router.get("/portal-data", authMiddleware, getStudentPortalData);

// GET /api/student/hall-ticket/pdf (Public or Auth)
router.get("/hall-ticket/pdf", downloadHallTicketPDF);

// GET /api/student/ai-briefing (Protected) — Priority 1
router.get("/ai-briefing", authMiddleware, getAIBriefing);

// POST /api/student/attendance-bunk-calc (Protected) — Priority 2
router.post("/attendance-bunk-calc", authMiddleware, calculateBunkSafety);

// GET /api/student/academic-risk (Protected) — Priority 6
router.get("/academic-risk", authMiddleware, predictAcademicRisk);

// POST /api/student/ai-resume-review (Protected) — Priority 5
router.post("/ai-resume-review", authMiddleware, aiResumeReview);

export default router;
