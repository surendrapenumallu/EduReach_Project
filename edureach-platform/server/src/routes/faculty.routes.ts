import { Router } from "express";
import { getFacultyDashboardData, facultyAIAssist, evaluateAssignment, saveAttendance } from "../controllers/faculty.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.get("/dashboard-data", authMiddleware, getFacultyDashboardData);
router.post("/ai-assist", authMiddleware, facultyAIAssist);
router.post("/evaluate-assignment", authMiddleware, evaluateAssignment);
router.post("/attendance", authMiddleware, saveAttendance);

export default router;
