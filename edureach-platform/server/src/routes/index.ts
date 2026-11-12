import { Router } from "express";
import authRoutes from "./auth.routes";
import uploadRoutes from "./upload.routes";
import chatRoutes from "./chat.routes";
import applicationRoutes from "./application.routes";
import admissionRoutes from "./admission.routes";
import notificationRoutes from "./notification.routes";
import predictorRoutes from "./predictor.routes";
import resultRoutes from "./result.routes";
import facultyRoutes from "./faculty.routes";
import studentRoutes from "./student.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// Mount all modular API routes
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/chat", chatRoutes);
router.use("/applications", applicationRoutes);
router.use("/admissions", admissionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/predictor", predictorRoutes);
router.use("/results", resultRoutes);
router.use("/faculty", facultyRoutes);
router.use("/student", studentRoutes);
router.use("/admin", adminRoutes);

export default router;
